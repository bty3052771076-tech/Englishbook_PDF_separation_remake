/**
 * PDF鍗曡瘝闊抽鎾斁鍣ㄤ富閫昏緫
 * 鍔熻兘锛氬姞杞藉崟璇嶆暟鎹紝鍒涘缓鍙偣鍑绘寜閽紝鎾斁闊抽
 */

const DEBUG_LOG_ENABLED = new URLSearchParams(window.location.search).get('debug') === '1';
const debugLog = (...args) => {
    if (DEBUG_LOG_ENABLED) {
        console.log(...args);
    }
};
class PDFWordAudioPlayer {
    constructor(pageConfig = null) {
        // 椤甸潰閰嶇疆锛屾敮鎸佹墿灞曞埌鍏朵粬椤甸潰
        this.pageConfig = pageConfig || this.getPageConfigFromURL() || {
            pageNumber: 7,           // PDF椤电爜
            sections: ["1.1"],        // 绔犺妭鍒楄〃
            dataFile: "extracted_words/extracted_words_page7.json",  // 鍗曡瘝鏁版嵁鏂囦欢
            imageFile: "images/page7.png",           // PDF椤甸潰鍥剧墖
            title: "The Human Body",  // 椤甸潰鏍囬
            primarySection: "1.1"     // 涓昏绔犺妭
        };

        // 椤甸潰瀵艰埅鏂规硶
        this.navigateToPage = function(pageNumber) {
            const url = new URL(window.location.href);
            url.searchParams.set('page', String(pageNumber));
            url.searchParams.delete('section'); // 绉婚櫎鏃х殑section鍙傛暟
            window.location.href = url.toString();
        };

        this.wordsData = [];
        this.audioPlayer = document.getElementById('audioPlayer');
        this.pdfImage = document.getElementById('pdfImage');
        this.wordButtons = document.getElementById('wordButtons');
        this.loading = document.getElementById('loading');
        this.audioIndicator = document.getElementById('audioIndicator');
        this.playingWord = document.getElementById('playingWord');
        this.progressBar = document.getElementById('progressBar');
        this.errorMessage = document.getElementById('errorMessage');
        
        // 缁熻鏁版嵁
        this.totalWords = 0;
        this.playedWords = new Set();
        
        // 鎾斁鐘舵€?
        this.isPlaying = false;
        this.isPlayingAll = false; // 新增：标记是否正在全部播放
        this.currentWordIndex = -1;
        this.showLabels = true;
        this.showButtons = true;
        this._audioUnlocked = false;
        this.lastSetAudioSrc = null;
        this.buttonListEl = null;
        
        // 鍧愭爣杞崲鍙傛暟
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.sidebarWordList = document.getElementById('sidebarWordList');
        this.sidebarWrongList = document.getElementById('sidebarWrongList');
        this.sidebarTodayReviewList = document.getElementById('sidebarTodayReviewList');
        
        // 绠＄悊鍛樻ā寮忕浉鍏?
        this.adminMode = false;
        this.selectedButton = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.originalButtonData = {};

        // 鏂囨湰鍐呰仈缂栬緫鐩稿叧鐘舵€侊紙绠＄悊鍛樻ā寮忥級
        // editingInput: 褰撳墠姝ｅ湪缂栬緫鐨勮緭鍏ユ鍏冪礌锛沞ditingButton: 褰撳墠姝ｅ湪缂栬緫鐨勬寜閽?
        this.editingInput = null; // 褰撳墠鍐呰仈缂栬緫杈撳叆妗?
        this.editingButton = null; // 褰撳墠澶勪簬缂栬緫鐘舵€佺殑鎸夐挳

        // 绠＄悊鍛橀潰鏉挎嫋鎷界姸鎬?
        this.panelDrag = {
            active: false,
            pointerId: null,
            startX: 0,
            startY: 0,
            startLeft: 0,
            startTop: 0
        };
        
        // 鍒犻櫎妯″紡鐩稿叧
        this.deleteMode = false;

        // 章节过滤相关
        this.activeSection = null; // 当前激活的章节（用于过滤显示）

        // 测试模式相关
        this.testMode = false;
        this.testQueue = [];
        this.currentTestIndex = 0;
        this.testResults = { correct: 0, wrong: 0 };
        this.testModal = document.getElementById('testModal');
        this.testSetup = document.getElementById('testSetup');
        this.testResult = document.getElementById('testResult');

        this.reviewModeActive = false;
        this.reviewModePrevShowLabels = null;
        this.reviewTargetWord = null;
        this.reviewTargetKey = null;
        this.todayReviewDue = [];
        this.reviewToggleBtn = null;
        this.playAllSectionSelect = null;

        this.srsFeedbackContainer = document.getElementById('srsFeedbackContainer');
        this.srsFeedbackList = document.getElementById('srsFeedbackList');
        this.saveSrsFeedbackBtn = document.getElementById('saveSrsFeedback');
        this.pendingSrsReviews = new Map();

        this.testType = 'listen_click';
        this.pictureQuizPanel = document.getElementById('pictureQuizPanel');
        this.pictureQuizHighlight = document.getElementById('pictureQuizHighlight');
        this.pictureQuizProgress = document.getElementById('pictureQuizProgress');
        this.pictureQuizOptions = document.getElementById('pictureQuizOptions');
        this.pictureQuizDragHandle = document.getElementById('pictureQuizDragHandle');
        this.pictureQuizLocked = false;

        this.pictureQuizPanelDrag = {
            active: false,
            pointerId: null,
            startX: 0,
            startY: 0,
            startLeft: 0,
            startTop: 0
        };

        // 新增：y1 过滤阈值配置（中文注释）
        // 目的：仅在需要时过滤掉 y1 超过某个阈值的词条，避免顶部标题或异常数据被误识别。
        // 说明：默认“不过滤”，使用 Infinity 作为默认值；如需调试，可通过 URL 参数 y1thr 设置一个有限数值。
        this.y1ButtonThreshold = Number.POSITIVE_INFINITY;
        
        // 允许通过 URL 参数 y1thr 覆盖阈值，用于调试
        const _params = new URLSearchParams(window.location.search);
        const _y1thr = parseInt(_params.get('y1thr'));
        if (!isNaN(_y1thr)) {
            this.y1ButtonThreshold = _y1thr;
            debugLog('通过URL覆盖 y1ButtonThreshold =', this.y1ButtonThreshold);
        }
        this.init();
    }

    getPageConfigFromURL() {
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        if (page && window.pageConfigManager) {
            return window.pageConfigManager.getPageConfig(Number(page));
        }
        return null;
    }

    async init() {
        debugLog('=== PDFWordAudioPlayer 鍒濆鍖栧紑濮?===');
        debugLog('椤甸潰閰嶇疆:', this.pageConfig);
        
        try {
            // 缁戝畾浜嬩欢鐩戝惉鍣?            debugLog('缁戝畾浜嬩欢鐩戝惉鍣?..');
            this.bindEvents();
            // 鍒濆鍖栫鐞嗗憳闈㈡澘鎷栨嫿
            this.initAdminPanelDrag();
            this.initPictureQuizPanelDrag();
            
            // 鍔犺浇鍗曡瘝鏁版嵁
            debugLog('寮€濮嬪姞杞藉崟璇嶆暟鎹?..');
            await this.loadWordsData();
            debugLog('鍗曡瘝鏁版嵁鍔犺浇瀹屾垚');
            
            // 鍔犺浇PDF鍥剧墖
            debugLog('寮€濮嬪姞杞絇DF鍥剧墖...');
            await this.loadPDFImage();
            debugLog('PDF鍥剧墖鍔犺浇瀹屾垚');
            
            // 鍒涘缓鍗曡瘝鎸夐挳
            debugLog('寮€濮嬪垱寤哄崟璇嶆寜閽?..');
            this.createWordButtons();
            this.renderSidebar();
            this.updatePlayAllSectionSelect();
            debugLog('鍗曡瘝鎸夐挳鍒涘缓瀹屾垚');
            
            // 闅愯棌鍔犺浇鍔ㄧ敾
            debugLog('隐藏加载动画...');
            this.hideLoading();
            
            // 鏇存柊缁熻淇℃伅
            debugLog('更新统计信息...');
            this.updateStats();
            
            // 纭繚鎸夐挳浣嶇疆姝ｇ‘ - 鍦ㄦ墍鏈夊垵濮嬪寲瀹屾垚鍚庡啀娆¤绠?
            setTimeout(() => {
                debugLog('重新计算坐标...');
                this.recalculateCoordinates();
            }, 100);
            
            // 加载错题记录
            setTimeout(() => {
                this.loadWrongWords();
                this.loadTodayReview();
            }, 500);

            // 鍒濆鍖栭煶棰戞枃浠堕€夋嫨鍣?            debugLog('鍒濆鍖栭煶棰戞枃浠堕€夋嫨鍣?..');
            setTimeout(() => {
                this.loadAvailableAudioFiles();
            }, 200);
            
            debugLog('=== PDFWordAudioPlayer 初始化完成 ===');
            
        } catch (error) {
            console.error('=== PDFWordAudioPlayer 初始化失败 ===');
            console.error('错误详情:', error);
            console.error('页面配置:', this.pageConfig);
            console.error('图片文件路径:', this.pageConfig?.imageFile);
            
            this.showError('初始化失败：' + error.message);
            
            // 鍗充娇鍥剧墖鍔犺浇澶辫触锛屼篃瑕佺户缁垵濮嬪寲鍏朵粬鍔熻兘
        try {
                debugLog('尝试继续初始化其他功能...');
                this.createWordButtons();
                this.hideLoading();
                this.updateStats();
                
                // 鍗充娇鍑洪敊涔熻灏濊瘯閲嶆柊璁＄畻鍧愭爣
            setTimeout(() => {
                    this.recalculateCoordinates();
                }, 100);
                
                debugLog('部分功能初始化完成（图片可能未加载）');
            } catch (secondaryError) {
                console.error('再次初始化出错', secondaryError);
                this.showError('完全初始化失败：' + secondaryError.message);
            }
        }
    }

    // 加载错题记录并渲染侧边栏
      async loadWrongWords() {
          if (!this.sidebarWrongList) return;

          try {
              const pageId = this.pageConfig.pageNumber;
              debugLog('正在加载错题记录...', pageId);

              const response = await fetch(`/api/get_wrong_words?pageId=${pageId}`);
              
              if (response.ok) {
                  const data = await response.json();
                  const records = data.records || {};
                  
                  // 转换并排序：按错误次数从高到低
                  const wrongList = Object.values(records).sort((a, b) => b.error_count - a.error_count);
                  
                  this.renderWrongSidebar(wrongList);
              } else {
                  console.warn('加载错题失败，可能未运行在 server 环境下');
                  this.sidebarWrongList.innerHTML = '<div class="empty-tip">加载失败<br>请使用 server.py 启动</div>';
              }
          } catch (error) {
              console.error('加载错题记录出错:', error);
              this.sidebarWrongList.innerHTML = '<div class="empty-tip">暂无错题记录</div>';
          }
      }

      renderWrongSidebar(wrongList) {
          this.sidebarWrongList.innerHTML = '';
          
          if (wrongList.length === 0) {
              this.sidebarWrongList.innerHTML = '<div class="empty-tip">太棒了！<br>本页暂无错题</div>';
              return;
          }

          wrongList.forEach(record => {
              const item = document.createElement('div');
              item.className = 'sidebar-word-item';
              
              // 查找原始单词数据以便播放
              const originalWordData = this.wordsData.find(w => w.word.toLowerCase() === record.word.toLowerCase());
              
              const wordSpan = document.createElement('span');
              wordSpan.textContent = record.word;
              
              const countSpan = document.createElement('span');
              countSpan.className = 'error-count';
              countSpan.textContent = record.error_count;
              countSpan.title = `最后错误时间: ${record.last_error_time}`;
              
              item.appendChild(wordSpan);
              item.appendChild(countSpan);

              if (originalWordData) {
                  item.addEventListener('click', () => {
                      // 查找索引
                      const index = originalWordData._dataIndex !== undefined ? originalWordData._dataIndex : originalWordData.originalIndex;
                      
                      // 移除其他项的高亮
                      this.sidebarWrongList.querySelectorAll('.sidebar-word-item').forEach(el => el.classList.remove('playing'));
                      
                      // 添加自身高亮（模拟按钮按下效果）
                      item.classList.add('playing');
                      
                      // 播放音频
                      this.playWord(originalWordData, index || 0);
                      
                      // 播放结束后自动移除高亮（监听一次性事件）
                      const removeHighlight = () => {
                          item.classList.remove('playing');
                          this.audioPlayer.removeEventListener('ended', removeHighlight);
                          this.audioPlayer.removeEventListener('error', removeHighlight);
                      };
                      
                      this.audioPlayer.addEventListener('ended', removeHighlight, { once: true });
                      this.audioPlayer.addEventListener('error', removeHighlight, { once: true });
                  });
              } else {
                  item.style.opacity = '0.5';
                  item.title = '原单词数据未找到';
              }

              this.sidebarWrongList.appendChild(item);
          });
          
          debugLog(`已渲染 ${wrongList.length} 条错题记录`);
      }

      async loadTodayReview() {
          if (!this.sidebarTodayReviewList) return;

          try {
              const pageId = this.pageConfig.pageNumber;
              const response = await fetch(`/api/srs/today?pageId=${pageId}`);

              if (!response.ok) {
                  if (response.status === 404) {
                      this.sidebarTodayReviewList.innerHTML = '<div class="empty-tip">加载失败<br>请使用 server.py 启动</div>';
                      return;
                  }
                  this.sidebarTodayReviewList.innerHTML = '<div class="empty-tip">加载失败</div>';
                  return;
              }

              const data = await response.json();
              const due = Array.isArray(data.due) ? data.due : [];
              this.todayReviewDue = due;
              this.renderTodayReviewSidebar(due);
          } catch (error) {
              console.error('加载今日复习出错:', error);
              this.sidebarTodayReviewList.innerHTML = '<div class="empty-tip">暂无到期复习</div>';
          }
      }

      renderTodayReviewSidebar(dueList) {
          if (!this.sidebarTodayReviewList) return;
          this.sidebarTodayReviewList.innerHTML = '';

          if (!Array.isArray(dueList) || dueList.length === 0) {
              this.sidebarTodayReviewList.innerHTML = '<div class="empty-tip">暂无到期复习</div>';
              return;
          }

          dueList.forEach(itemData => {
              const word = itemData && itemData.word ? String(itemData.word) : '';
              if (!word) return;

              const stage = itemData && typeof itemData.stage === 'number' ? itemData.stage : 0;
              const key = this.normalizeWord(word);

              const item = document.createElement('button');
              item.type = 'button';
              item.className = 'sidebar-word-item';
              item.dataset.word = word;
              item.dataset.wordKey = key;
              if (this.reviewModeActive && this.reviewTargetKey === key) {
                  item.classList.add('review-target');
              }

              const wordSpan = document.createElement('span');
              wordSpan.textContent = word;

              const badge = document.createElement('span');
              badge.className = 'review-badge';
              badge.textContent = `S${stage}`;

              item.appendChild(wordSpan);
              item.appendChild(badge);

              item.addEventListener('click', () => {
                  if (this.reviewModeActive) {
                      this.setReviewTarget(word);
                      return;
                  }
                  this.sidebarTodayReviewList.querySelectorAll('.sidebar-word-item').forEach(el => el.classList.remove('playing'));
                  item.classList.add('playing');
                  this.focusWordByText(word, true);
                  const removeHighlight = () => {
                      item.classList.remove('playing');
                      this.audioPlayer.removeEventListener('ended', removeHighlight);
                      this.audioPlayer.removeEventListener('error', removeHighlight);
                  };
                  this.audioPlayer.addEventListener('ended', removeHighlight, { once: true });
                  this.audioPlayer.addEventListener('error', removeHighlight, { once: true });
              });

              this.sidebarTodayReviewList.appendChild(item);
          });
      }

      normalizeWord(word) {
          return String(word || '').trim().toLowerCase();
      }

      findWordDataByText(word) {
          const key = this.normalizeWord(word);
          if (!key) return null;

          const idx = this.wordsData.findIndex(w => w && w.word && String(w.word).toLowerCase() === key);
          if (idx < 0) {
              this.showError(`未找到单词：${word}`, 'error');
              return null;
          }

          const wordData = this.wordsData[idx];
          const originalIndex = (wordData && (wordData.originalIndex !== undefined || wordData._dataIndex !== undefined))
              ? (wordData.originalIndex !== undefined ? wordData.originalIndex : wordData._dataIndex)
              : idx;

          return { wordData, originalIndex };
      }

      focusWordByText(word, playAudio = false) {
          const hit = this.findWordDataByText(word);
          if (!hit) return;

          const domBtn = this.wordButtons ? this.wordButtons.querySelector(`.word-button[data-index="${hit.originalIndex}"]`) : null;
          if (domBtn) {
              domBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              const oldBoxShadow = domBtn.style.boxShadow;
              domBtn.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.45)';
              setTimeout(() => {
                  try { domBtn.style.boxShadow = oldBoxShadow; } catch (_) {}
              }, 800);
          }

          if (playAudio) {
              this.playWord(hit.wordData, hit.originalIndex);
          }
      }

      setReviewTarget(word) {
          const key = this.normalizeWord(word);
          if (!key) return;
          this.reviewTargetWord = word;
          this.reviewTargetKey = key;
          const hit = this.findWordDataByText(word);
          if (hit) {
              this.playWord(hit.wordData, hit.originalIndex, { suppressUI: true });
          }
          if (this.sidebarTodayReviewList) {
              this.sidebarTodayReviewList.querySelectorAll('.sidebar-word-item').forEach(el => {
                  el.classList.toggle('review-target', el.dataset.wordKey === key);
              });
          }
          this.showError(`已选择目标单词：${word}`, 'success');
      }

      toggleReviewMode() {
          if (this.reviewModeActive) {
              this.exitReviewMode();
          } else {
              this.enterReviewMode();
          }
      }

      enterReviewMode() {
          if (this.reviewModeActive) return;
          if (this.testMode) this.endTestMode();
          this.reviewModeActive = true;
          this.reviewModePrevShowLabels = this.showLabels;
          this.showLabels = false;
          this.updateButtonLabels();
          document.body.classList.add('review-mode');
          this.reviewTargetWord = null;
          this.reviewTargetKey = null;
          this.updateReviewToggleButton();
          this.loadTodayReview();
          this.showError('已进入今日复习：先选目标词，再点击画面按钮匹配', 'success');
      }

      exitReviewMode() {
          if (!this.reviewModeActive) return;
          this.reviewModeActive = false;
          this.reviewTargetWord = null;
          this.reviewTargetKey = null;
          if (this.reviewModePrevShowLabels !== null) {
              this.showLabels = this.reviewModePrevShowLabels;
              this.reviewModePrevShowLabels = null;
          } else {
              this.showLabels = true;
          }
          this.updateButtonLabels();
          document.body.classList.remove('review-mode');
          if (this.sidebarTodayReviewList) {
              this.sidebarTodayReviewList.querySelectorAll('.sidebar-word-item').forEach(el => {
                  el.classList.remove('review-target');
              });
          }
          this.updateReviewToggleButton();
          this.showError('已退出今日复习', 'success');
      }

      updateReviewToggleButton() {
          const btn = this.reviewToggleBtn || document.getElementById('startReview');
          if (!btn) return;
          if (this.reviewModeActive) {
              btn.textContent = '退出复习';
              btn.classList.add('active');
          } else {
              btn.textContent = '今日复习';
              btn.classList.remove('active');
          }
      }

      async handleReviewClick(clickedWordData, buttonElement) {
          if (!this.reviewModeActive) return;
          if (!clickedWordData || clickedWordData.is_title) {
              this.showError('标题不参与复习匹配', 'error');
              return;
          }
          if (!this.reviewTargetKey || !this.reviewTargetWord) {
              this.showError('请先从今日复习列表选择一个单词', 'error');
              return;
          }
          const clickedKey = this.normalizeWord(clickedWordData.word);
          const isCorrect = clickedKey === this.reviewTargetKey;
          if (isCorrect) {
              await this.handleReviewCorrect(buttonElement);
          } else {
              await this.handleReviewWrong(clickedWordData, buttonElement);
          }
      }

      async handleReviewCorrect(buttonElement) {
          const targetWord = this.reviewTargetWord;
          if (!targetWord) return;
          if (buttonElement) {
              buttonElement.classList.add('review-correct');
              setTimeout(() => buttonElement.classList.remove('review-correct'), 700);
          }
          const success = await this.recordSrsReview(targetWord, 5);
          if (success) {
              this.removeReviewWord(targetWord);
              this.reviewTargetWord = null;
              this.reviewTargetKey = null;
              this.showError('匹配正确，已提升熟练度', 'success');
              this.loadTodayReview();
          }
      }

      async handleReviewWrong(clickedWordData, buttonElement) {
          const targetWord = this.reviewTargetWord;
          if (!targetWord) return;
          if (buttonElement) {
              buttonElement.classList.add('review-wrong');
              setTimeout(() => buttonElement.classList.remove('review-wrong'), 700);
          }
          await this.saveWrongWordsToLocal([{
              target: targetWord,
              clicked: clickedWordData ? clickedWordData.word : ''
          }]);
          this.showError('匹配错误，已刷新错误时间', 'error');
      }

      removeReviewWord(word) {
          const key = this.normalizeWord(word);
          if (!key) return;
          this.todayReviewDue = (this.todayReviewDue || []).filter(item => {
              const itemWord = item && item.word ? String(item.word) : '';
              return this.normalizeWord(itemWord) !== key;
          });
          this.renderTodayReviewSidebar(this.todayReviewDue);
      }

      async recordSrsReview(word, quality) {
          const pageId = this.pageConfig.pageNumber;
          try {
              const response = await fetch('/api/srs/record', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      pageId,
                      word,
                      quality
                  })
              });

              if (!response.ok) {
                  if (response.status === 404) {
                      this.showError('保存失败：请使用 server.py 启动服务', 'error');
                      return false;
                  }
                  this.showError(`保存失败：状态码 ${response.status}`, 'error');
                  return false;
              }
              return true;
          } catch (error) {
              console.error('保存复习记录出错:', error);
              return false;
          }
      }

      getQualityValueByLabel(label) {
          if (label === '认识') return 5;
          if (label === '模糊') return 3;
          return 1;
      }

      async submitSrsFeedback() {
          const pageId = this.pageConfig.pageNumber;
          const reviews = [];
          for (const [word, quality] of this.pendingSrsReviews.entries()) {
              reviews.push({ word, quality });
          }

          if (reviews.length === 0) {
              this.showError('请先为本次测试的单词选择复习反馈', 'error');
              return;
          }

          try {
              const response = await fetch('/api/srs/record', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ pageId, reviews })
              });

              if (!response.ok) {
                  if (response.status === 404) {
                      this.showError('保存失败：请使用 server.py 启动服务', 'error');
                      return;
                  }
                  this.showError(`保存失败：状态码 ${response.status}`, 'error');
                  return;
              }

              this.showError('复习反馈已保存', 'success');
              this.pendingSrsReviews.clear();
              this.loadTodayReview();
          } catch (error) {
              console.error('保存复习反馈出错:', error);
          }
      }

    bindEvents() {
        // 闊抽噺鎺у埗
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.audioPlayer.volume = volume;
            volumeValue.textContent = Math.round(volume * 100) + '%';
        });

        // 鎺у埗鎸夐挳
        document.getElementById('toggleLabels').addEventListener('click', () => {
            this.toggleLabels();
        });

        document.getElementById('toggleButtons').addEventListener('click', () => {
            this.toggleButtons();
        });

        document.getElementById('playAll').addEventListener('click', () => {
            const sectionSelect = this.playAllSectionSelect || document.getElementById('playAllSectionSelect');
            const section = sectionSelect ? sectionSelect.value : 'all';
            this.playAllWords(section);
        });

        // 测试模式按钮
        const startReviewBtn = document.getElementById('startReview');
        if (startReviewBtn) {
            this.reviewToggleBtn = startReviewBtn;
            this.updateReviewToggleButton();
            startReviewBtn.addEventListener('click', () => {
                this.toggleReviewMode();
            });
        }

        const startTestBtn = document.getElementById('startTest');
        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => {
                this.initTestMode();
            });
        }
        
        // 测试模态框按钮
        const confirmTestBtn = document.getElementById('confirmStartTest');
        if (confirmTestBtn) {
            confirmTestBtn.addEventListener('click', () => {
                const count = parseInt(document.getElementById('testCountInput').value);
                if (count > 0) {
                    const testTypeEl = document.getElementById('testTypeSelect');
                    const type = testTypeEl ? testTypeEl.value : 'listen_click';
                    this.startTest(count, type);
                }
            });
        }
        
        const cancelTestBtn = document.getElementById('cancelTest');
        if (cancelTestBtn) {
            cancelTestBtn.addEventListener('click', () => {
                this.testModal.style.display = 'none';
            });
        }
        
        const closeResultBtn = document.getElementById('closeTestResult');
        if (closeResultBtn) {
            closeResultBtn.addEventListener('click', () => {
                this.endTestMode();
            });
        }

        const saveSrsFeedbackBtn = document.getElementById('saveSrsFeedback');
        if (saveSrsFeedbackBtn) {
            saveSrsFeedbackBtn.addEventListener('click', () => {
                this.submitSrsFeedback();
            });
        }

        // 绠＄悊鍛樻ā寮忔寜閽?
        document.getElementById('adminToggle').addEventListener('click', () => {
            this.toggleAdminMode();
        });

        // 绠＄悊鍛橀潰鏉挎寜閽?
        document.getElementById('saveChanges').addEventListener('click', () => {
            this.saveChanges();
        });

        document.getElementById('resetChanges').addEventListener('click', () => {
            this.resetChanges();
        });

        // 导出JSON按钮
        const exportBtn = document.getElementById('exportJSON');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportJSON();
            });
        }

        document.getElementById('applyEdit').addEventListener('click', () => {
            this.applyEdit();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.cancelEdit();
        });

        // 鏂板鎸夐挳浜嬩欢鐩戝惉
        document.getElementById('addNewButton').addEventListener('click', () => {
            this.addNewButton();
        });

        document.getElementById('clearAddForm').addEventListener('click', () => {
            this.clearAddForm();
        });

        // 闊抽鏂囦欢閫夋嫨鍣ㄤ簨浠剁洃鍚?
        document.getElementById('refreshAudioList').addEventListener('click', () => {
            this.refreshAudioList();
        });

        const refreshTodayBtn = document.getElementById('refreshTodayReview');
        if (refreshTodayBtn) {
            refreshTodayBtn.addEventListener('click', () => {
                this.loadTodayReview();
            });
        }

        // 错题本刷新按钮
        const refreshWrongBtn = document.getElementById('refreshWrongList');
        if (refreshWrongBtn) {
            refreshWrongBtn.addEventListener('click', () => {
                this.loadWrongWords();
            });
        }

        document.getElementById('newAudioSelect').addEventListener('change', (e) => {
            const selectedFile = e.target.value;
            if (selectedFile) {
                const fileName = selectedFile.split('/').pop();
                document.getElementById('newAudio').value = fileName;
            } else {
                document.getElementById('newAudio').value = '';
            }
        });
        const refreshBtnList = document.getElementById('refreshButtonList');
        if (refreshBtnList) {
            refreshBtnList.addEventListener('click', () => {
                this.renderButtonList();
            });
        }

        // 鍒犻櫎妯″紡浜嬩欢鐩戝惉
        document.getElementById('toggleDeleteMode').addEventListener('click', () => {
            this.toggleDeleteMode();
        });

        // 音频事件
        this.audioPlayer.addEventListener('loadstart', () => {
            this.showAudioIndicator();
        });

        this.audioPlayer.addEventListener('canplay', () => {
            debugLog('音频已可播放');
        });

        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
        });

        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.onAudioEnded();
            this.updateSidebarPlayingState(this.currentWordIndex, false);
        });

        this.audioPlayer.addEventListener('error', (e) => {
            this.onAudioError(e);
        });

        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        // 绐楀彛澶у皬鍙樺寲鏃堕噸鏂拌绠楀潗鏍?
        window.addEventListener('resize', () => {
            // 鍦ㄧ鐞嗗憳妯″紡鍜岄潪绠＄悊鍛樻ā寮忎笅閮戒娇鐢ㄧ浉鍚岀殑鍧愭爣閲嶆柊璁＄畻閫昏緫
            // 浣跨敤requestAnimationFrame纭繚resize瀹屾垚鍚庡啀閲嶆柊璁＄畻
            requestAnimationFrame(() => {
                setTimeout(() => {
                    this.recalculateCoordinates();
                    // 濡傛灉鍦ㄧ鐞嗗憳妯″紡涓嬶紝纭繚閫変腑鐨勬寜閽繚鎸侀€変腑鐘舵€?
                    if (this.adminMode && this.selectedButton) {
                        this.selectedButton.classList.add('selected');
                        this.addResizeHandles(this.selectedButton);
                    }
                }, 50);
            });
        });

        // 椤甸潰閫夋嫨鍣ㄥ拰瀵艰埅鎸夐挳
        const pageSelector = document.getElementById('pageSelector');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        // 收集所有页面配置
        let allPages = [];
        if (window.pageConfigManager && typeof window.pageConfigManager.getAllPageConfigs === 'function') {
            try {
                allPages = window.pageConfigManager.getAllPageConfigs() || [];
                debugLog('获取到的页面配置:', allPages.length, '个页面');
            } catch (e) {
                console.error('获取页面配置失败:', e);
                allPages = [];
            }
        }
        
        // 如果没有获取到页面配置，使用回退方案
        if (!Array.isArray(allPages) || allPages.length === 0) {
            console.warn('无法获取页面配置，使用回退方案');
            try {
                // 尝试获取更多页面的配置
                const pageNumbers = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
                allPages = [];
                for (const pageNum of pageNumbers) {
                    try {
                        const pageConfig = window.pageConfigManager.getPageConfig(pageNum);
                        if (pageConfig && pageConfig.pageNumber === pageNum) {
                            allPages.push(pageConfig);
                        }
                    } catch (e) {
                        // 忽略单个页面的错误，继续处理其它页面
                        console.debug(`页面 ${pageNum} 配置获取失败:`, e);
                    }
                }
                debugLog('回退方案获取到', allPages.length, '个页面');
            } catch (e) {
                console.warn('页面配置回退失败', e);
                allPages = [];
            }
        }

        // 提取页面号并排序
        const pageNumbers = allPages
            .map(cfg => cfg && (cfg.pageNumber || cfg.page))
            .filter(n => typeof n === 'number')
            .sort((a, b) => a - b);

        debugLog('可用页面列表:', pageNumbers);

        // 填充页面选择器
        if (pageSelector && pageNumbers.length > 0) {
            pageSelector.innerHTML = '';
            pageNumbers.forEach(n => {
                const opt = document.createElement('option');
                opt.value = String(n);
                // 修复页面选择器中文文案乱码与模板字符串未闭合问题
                // 原错误：opt.textContent = `绗?${n} 椤礰;
                // 修复为可读中文并使用普通字符串拼接，避免编码问题
                opt.textContent = '第 ' + n + ' 页';
                pageSelector.appendChild(opt);
            });
            
            // 设置当前页面
            const currentPage = this.pageConfig.pageNumber || this.pageConfig.page;
            if (typeof currentPage === 'number') {
                pageSelector.value = String(currentPage);
            }

            // 绑定页面选择器的变更事件
            pageSelector.addEventListener('change', (e) => {
                const newPage = Number(e.target.value);
                debugLog('选择切换到页面:', newPage);
                if (!isNaN(newPage)) {
                    this.navigateToPage(newPage);
                }
            });
        } else {
            console.warn('页面选择器未找到或没有可用页面');
        }
        
        // 设置上一页/下一页按钮
        const currentPage = this.pageConfig.pageNumber || this.pageConfig.page;
        const currentIndex = pageNumbers.indexOf(currentPage);

        if (prevBtn && pageNumbers.length > 0) {
            prevBtn.disabled = currentIndex <= 0;
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    const newPage = pageNumbers[currentIndex - 1];
                    debugLog('鐐瑰嚮涓婁竴椤碉紝璺宠浆鍒?', newPage);
                    this.navigateToPage(newPage);
                }
            });
        }

        if (nextBtn && pageNumbers.length > 0) {
            nextBtn.disabled = currentIndex === -1 || currentIndex >= pageNumbers.length - 1;
            nextBtn.addEventListener('click', () => {
                if (currentIndex < pageNumbers.length - 1) {
                    const newPage = pageNumbers[currentIndex + 1];
                    debugLog('鐐瑰嚮涓嬩竴椤碉紝璺宠浆鍒?', newPage);
                    this.navigateToPage(newPage);
                }
            });
        }
    }

    initPictureQuizPanelDrag() {
        const panel = this.pictureQuizPanel;
        const handle = this.pictureQuizDragHandle;
        if (!panel || !handle) return;

        const getPanelLeftTop = () => {
            const rect = panel.getBoundingClientRect();
            let left = rect.left;
            let top = rect.top;

            if (!Number.isFinite(left) || !Number.isFinite(top)) {
                left = 0;
                top = 0;
            }
            return { left, top };
        };

        const clampToViewport = (left, top) => {
            const margin = 8;
            const maxLeft = Math.max(margin, window.innerWidth - panel.offsetWidth - margin);
            const maxTop = Math.max(margin, window.innerHeight - panel.offsetHeight - margin);
            const clampedLeft = Math.min(Math.max(margin, left), maxLeft);
            const clampedTop = Math.min(Math.max(margin, top), maxTop);
            return { left: clampedLeft, top: clampedTop };
        };

        const applyPosition = (left, top) => {
            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.transform = 'none';
        };

        const pointerDown = (e) => {
            if (panel.style.display === 'none') return;
            if (e.type === 'mousedown' && e.button !== 0) return;

            this.pictureQuizPanelDrag.active = true;
            this.pictureQuizPanelDrag.pointerId = e.pointerId || null;

            const pos = getPanelLeftTop();
            this.pictureQuizPanelDrag.startLeft = pos.left;
            this.pictureQuizPanelDrag.startTop = pos.top;
            this.pictureQuizPanelDrag.startX = e.clientX;
            this.pictureQuizPanelDrag.startY = e.clientY;

            panel.style.bottom = 'auto';
            panel.style.transform = 'none';

            document.body.style.userSelect = 'none';
            if (handle.setPointerCapture && e.pointerId != null) {
                try { handle.setPointerCapture(e.pointerId); } catch (_) {}
            }
            e.preventDefault();
        };

        const pointerMove = (e) => {
            if (!this.pictureQuizPanelDrag.active) return;
            const dx = e.clientX - this.pictureQuizPanelDrag.startX;
            const dy = e.clientY - this.pictureQuizPanelDrag.startY;
            const nextLeft = this.pictureQuizPanelDrag.startLeft + dx;
            const nextTop = this.pictureQuizPanelDrag.startTop + dy;

            const clamped = clampToViewport(nextLeft, nextTop);
            applyPosition(clamped.left, clamped.top);
        };

        const pointerUp = (e) => {
            if (!this.pictureQuizPanelDrag.active) return;
            this.pictureQuizPanelDrag.active = false;
            document.body.style.userSelect = '';

            if (handle.releasePointerCapture && e.pointerId != null) {
                try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
            }

            const rect = panel.getBoundingClientRect();
            const pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
            try {
                localStorage.setItem(this.getPictureQuizPanelStorageKey(), JSON.stringify(pos));
            } catch (_) {}
        };

        if (window.PointerEvent) {
            handle.addEventListener('pointerdown', pointerDown);
            window.addEventListener('pointermove', pointerMove);
            window.addEventListener('pointerup', pointerUp);
            window.addEventListener('pointercancel', pointerUp);
        } else {
            handle.addEventListener('mousedown', pointerDown);
            window.addEventListener('mousemove', pointerMove);
            window.addEventListener('mouseup', pointerUp);
            handle.addEventListener('touchstart', (ev) => pointerDown(ev.touches[0]), { passive: false });
            window.addEventListener('touchmove', (ev) => { pointerMove(ev.touches[0]); ev.preventDefault(); }, { passive: false });
            window.addEventListener('touchend', (ev) => pointerUp(ev.changedTouches[0]));
        }

        window.addEventListener('resize', () => {
            if (panel.style.display === 'none') return;
            this.clampAndRestorePictureQuizPanelPosition();
        });

        this.clampAndRestorePictureQuizPanelPosition();
    }

    getPictureQuizPanelStorageKey() {
        const pageId = this.pageConfig && this.pageConfig.pageNumber ? this.pageConfig.pageNumber : 'unknown';
        return `pictureQuizPanelPos_page_${pageId}`;
    }

    resetPictureQuizPanelToDefault() {
        const panel = this.pictureQuizPanel;
        if (!panel) return;
        panel.style.left = '50%';
        panel.style.bottom = '16px';
        panel.style.top = 'auto';
        panel.style.right = 'auto';
        panel.style.transform = 'translateX(-50%)';
    }

    clampAndRestorePictureQuizPanelPosition() {
        const panel = this.pictureQuizPanel;
        if (!panel) return;

        let pos = null;
        try {
            const raw = localStorage.getItem(this.getPictureQuizPanelStorageKey());
            if (raw) pos = JSON.parse(raw);
        } catch (_) {
            pos = null;
        }

        if (!pos || typeof pos.left !== 'number' || typeof pos.top !== 'number') {
            this.resetPictureQuizPanelToDefault();
            return;
        }

        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - panel.offsetWidth - margin);
        const maxTop = Math.max(margin, window.innerHeight - panel.offsetHeight - margin);
        const left = Math.min(Math.max(margin, pos.left), maxLeft);
        const top = Math.min(Math.max(margin, pos.top), maxTop);

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        panel.style.transform = 'none';
    }

    async loadWordsData() {
        try {
            const response = await fetch(this.pageConfig.dataFile);
            if (!response.ok) {
                // 使用普通字符串拼接，避免某些环境下模板字符串解析问题
                throw new Error('HTTP错误: ' + response.status);
            }
            
            const originalData = await response.json();
            
            // 检查是否有本地存储的修改数据
            const pageKey = 'page_' + this.pageConfig.pageNumber + '_data';
            const savedData = localStorage.getItem(pageKey);
            
            if (savedData) {
                try {
                    const parsedSavedData = JSON.parse(savedData);
                    debugLog('找到本地存储的修改数据，使用修改后的数据');
                    this.wordsData = parsedSavedData;
                } catch (error) {
                    console.error('解析本地存储数据失败，使用原始数据', error);
                    this.wordsData = originalData;
                }
            } else {
                debugLog('未找到本地存储数据，使用原始数据');
                this.wordsData = originalData;
            }
            
            this.totalWords = this.wordsData.length;
            debugLog('加载了', this.totalWords, '条单词数据（来自', this.pageConfig.dataFile, '）');
        } catch (error) {
            throw new Error('加载单词数据失败: ' + error.message);
        }
    }

    async loadPDFImage() {
        return new Promise((resolve, reject) => {
            // 先清除之前的事件监听器
            this.pdfImage.onload = null;
            this.pdfImage.onerror = null;
            
            this.pdfImage.onload = () => {
                debugLog('PDF图片加载成功:', this.pdfImage.src);
                debugLog('图片自然尺寸:', this.pdfImage.naturalWidth + 'x' + this.pdfImage.naturalHeight);
                debugLog('当前页面配置:', this.pageConfig);
                this.pdfImage.style.display = 'block';
                
                // 浣跨敤requestAnimationFrame纭繚鍥剧墖瀹屽叏娓叉煋鍚庡啀璁＄畻鍧愭爣
                requestAnimationFrame(() => {
                    // 鍐嶆浣跨敤requestAnimationFrame纭繚DOM瀹屽叏鏇存柊
                    requestAnimationFrame(() => {
                        // 璁＄畻鍧愭爣杞崲鍙傛暟
                        this.calculateCoordinateTransform();
                        resolve();
                    });
                });
            };

            this.pdfImage.onerror = (error) => {
                // 忽略与预期 URL 不匹配或空 SRC 导致的非关键错误
                const currentSrc = this.pdfImage.currentSrc || this.pdfImage.src || '';
                if (this._expectedImageURL && currentSrc && currentSrc !== this._expectedImageURL) {
                    console.warn('检测到与预期URL不匹配的图片错误事件，忽略该错误', {
                        currentSrc,
                        expected: this._expectedImageURL
                    });
                    return; // 不处理非关键的错误事件
                }

                console.error('PDF图片加载失败:', this.pageConfig.imageFile, error);
                console.error('完整URL:', currentSrc);
                // 不要 reject，而是继续执行，让页面能正常工作
                console.warn('图片加载失败，但继续初始化其他功能');
                resolve();
            };

            // 寮哄埗娓呴櫎缂撳瓨骞惰缃浘鐗囨簮
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(7);
            const imageUrl = this.pageConfig.imageFile + '?t=' + timestamp + '&r=' + randomId + '&page=' + this.pageConfig.pageNumber;
            
            debugLog('=== 图片加载调试信息 ===');
            debugLog('页面号', this.pageConfig.pageNumber);
            debugLog('配置的图片文件', this.pageConfig.imageFile);
            debugLog('完整图片URL', imageUrl);
            debugLog('========================');
            
            // 记录预期加载的 URL（绝对路径），用于排查中间过程的意外错误
            try {
                this._expectedImageURL = new URL(imageUrl, window.location.href).href;
            } catch (e) {
                // 兼容处理：URL 构造失败时，直接使用原始字符串
                this._expectedImageURL = imageUrl;
            }

            // 直接设置图片源（避免缓存干扰参数即可），避免设置为空 SRC 引发的错误事件
            this.pdfImage.src = imageUrl;
            debugLog('图片源已设置:', this.pdfImage.src);

            // 设置超时：若 5 秒内未加载成功则继续初始化其他功能
            setTimeout(() => {
                if (!this.pdfImage.complete || this.pdfImage.naturalWidth === 0) {
                    console.warn('图片加载超时，继续初始化');
                    resolve();
                }
            }, 5000);
        });
    }

    calculateCoordinateTransform() {
        // 鑾峰彇娴忚鍣ㄧ缉鏀剧骇鍒?- 鏇村噯纭殑鏂规硶
        const browserZoom = window.devicePixelRatio || 1;
        
        // 检测 CSS 缩放：通过比较 visualViewport 与窗口宽度
        const visualViewport = window.visualViewport;
        let cssZoom = 1;
        if (visualViewport) {
            cssZoom = window.innerWidth / visualViewport.width;
        } else {
            // 备用方法：通过创建测试元素测量缩放比例
            const testElement = document.createElement('div');
            testElement.style.width = '100px';
            testElement.style.height = '100px';
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            document.body.appendChild(testElement);
            const rect = testElement.getBoundingClientRect();
            cssZoom = rect.width / 100;
            document.body.removeChild(testElement);
        }
        
        // 获取图片的实际显示尺寸
        const displayRect = this.pdfImage.getBoundingClientRect();
        const containerRect = this.pdfImage.parentElement.getBoundingClientRect();

        // 获取图片的原始尺寸（来自导出的 PNG 图片）
        const naturalWidth = this.pdfImage.naturalWidth;
        const naturalHeight = this.pdfImage.naturalHeight;

        // PDF 原始尺寸（点单位，来自 PyMuPDF）
        // 根据导出模板，我们使用 2 倍缩放，因此原始 PDF 尺寸为图片尺寸的一半
        const pdfWidth = naturalWidth / 2;  // 553 像素 -> 276.5 点
        const pdfHeight = naturalHeight / 2; // 660.5 像素 -> 330.25 点
        // 璁＄畻缂╂斁姣斾緥锛堜粠PDF鍧愭爣鍒版樉绀哄潗鏍囷級
        // 注意：getBoundingClientRect 返回的是 CSS 像素，需要考虑浏览器与 CSS 缩放
        this.scaleX = displayRect.width / pdfWidth;
        this.scaleY = displayRect.height / pdfHeight;

        // 璁＄畻鍋忕Щ閲忥紙鍥剧墖鍦ㄥ鍣ㄤ腑鐨勪綅缃級
        this.offsetX = displayRect.left - containerRect.left;
        this.offsetY = displayRect.top - containerRect.top;

        // 瀛樺偍缂╂斁绾у埆锛岀敤浜庡悗缁殑鍧愭爣杞崲
        this.browserZoom = browserZoom;
        this.cssZoom = cssZoom;
        this.totalZoom = browserZoom * cssZoom;

        debugLog('鍧愭爣杞崲鍙傛暟:', {
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            browserZoom: this.browserZoom,
            cssZoom: this.cssZoom,
            totalZoom: this.totalZoom,
            displaySize: { width: displayRect.width, height: displayRect.height },
            naturalSize: { width: naturalWidth, height: naturalHeight },
            pdfSize: { width: pdfWidth, height: pdfHeight }
        });
    }

    recalculateCoordinates() {
        // 浣跨敤requestAnimationFrame纭繚DOM瀹屽叏鏇存柊鍚庡啀璁＄畻
        requestAnimationFrame(() => {
            this.calculateCoordinateTransform();
            this.updateButtonPositions();

            if (this.testMode && this.testType === 'picture_choice' && Array.isArray(this.testQueue)) {
                const current = this.testQueue[this.currentTestIndex];
                if (current) {
                    this.renderPictureChoiceQuestion(current);
                }
            }
        });
    }

    getDisplayWord(wordData) {
        if (!wordData) return '';
        const display = (typeof wordData.display_word === 'string') ? wordData.display_word.trim() : '';
        if (display) return display;
        return String(wordData.word || '').trim();
    }

    createWordButtons() {
        this.wordButtons.innerHTML = '';

        // 新增：仅当设置了“有限”的 y1 阈值时才进行过滤；默认不过滤。
        // 若数据集中未提供 y1 字段，则使用 y0 + height 进行计算。
        const thr = this.y1ButtonThreshold;
        const filteredByY1 = this.adminMode
            ? this.wordsData.map((w, i) => { w._dataIndex = i; return w; })
            : (Number.isFinite(thr)
                ? this.wordsData.filter((w, i) => {
                    const y1Value = (typeof w.y1 === 'number') ? w.y1 : ((w.y0 || 0) + (w.height || 0));
                    const keep = y1Value < thr;
                    if (keep) { w._dataIndex = i; }
                    else { debugLog('按 y1 过滤: 跳过索引 ' + i + ' (' + this.getDisplayWord(w) + '), y1=' + y1Value + ' >= ' + thr); }
                    return keep;
                })
                : this.wordsData.map((w, i) => { w._dataIndex = i; return w; }));

        // 覆盖优先：按钮按“词实例”渲染，不按词文本去重，避免同词多处出现时漏遮盖
        const renderWords = filteredByY1;
        // 保存过滤后的结果，供播放全部/测试模式等功能使用
        this.filteredWords = renderWords;
        renderWords.forEach((wordData, index) => {
            const button = this.createWordButton(wordData, index);
            this.wordButtons.appendChild(button);
        });

        debugLog('创建了', renderWords.length, '个单词按钮（过滤前共', this.wordsData.length, '条，过滤后', filteredByY1.length, '条）');
    }

    processWordsForDuplicates(wordsData) {
        const wordGroups = {};
        
        // 按单词名称分组
        wordsData.forEach((wordData, originalIndex) => {
            const wordKey = wordData.word.toLowerCase();
            if (!wordGroups[wordKey]) {
                wordGroups[wordKey] = [];
            }
            wordGroups[wordKey].push({...wordData, originalIndex});
        });
        
        const processedWords = [];
        
        // 处理每个单词组
        Object.keys(wordGroups).forEach(wordKey => {
            const group = wordGroups[wordKey];
            
            if (group.length === 1) {
                // 单个单词，直接添加
                processedWords.push(group[0]);
            } else {
                // 重复单词：按用户规则处理
                if (wordKey === 'phalanges') {
                    // 特殊处理 phalanges：保留所有不同序号的
                    const seenNumbers = [];
                    group.forEach(word => {
                        if (!seenNumbers.includes(word.number)) {
                            seenNumbers.push(word.number);
                            processedWords.push(word);
                            debugLog('保留 phalanges，序号 ' + word.number + ', 坐标: (' + word.x0 + ', ' + word.y0 + ')');
                        }
                    });
                } else {
                    // 检查是否包含标题
                    const titles = group.filter(word => word.is_title);
                    const nonTitles = group.filter(word => !word.is_title);
                    
                    if (titles.length > 0) {
                        // 如果有标题，保留所有标题（不同 section 的标题都保留）
                        titles.forEach(title => processedWords.push(title));
                        
                        // 对于非标题的重复单词，选择面积最小的
                        if (nonTitles.length > 0) {
                            const sortedByArea = nonTitles.sort((a, b) => {
                                const areaA = a.width * a.height;
                                const areaB = b.width * b.height;
                                return areaA - areaB;
                            });
                            processedWords.push(sortedByArea[0]);
                        }
                    } else {
                        // 其它重复单词：选择面积最小的（面积最小）
                        const sortedByArea = group.sort((a, b) => {
                            const areaA = a.width * a.height;
                            const areaB = b.width * b.height;
                            return areaA - areaB;
                        });
                        processedWords.push(sortedByArea[0]);
                        
                        debugLog('处理重复单词 "' + wordKey + '"：选择面积最小的 (' + sortedByArea[0].width.toFixed(2) + ' x ' + sortedByArea[0].height.toFixed(2) + ' = ' + (sortedByArea[0].width * sortedByArea[0].height).toFixed(2) + ')');
                    }
                }
            }
        });
        
        // 按原始顺序排序
        return processedWords.sort((a, b) => a.originalIndex - b.originalIndex);
    }

    renderSidebar() {
        if (!this.sidebarWordList) {
            console.warn('Sidebar element not found.');
            return;
        }

        this.sidebarWordList.innerHTML = '';
        
        const wordsToDisplay = this.wordsData
            .map((word, index) => ({ ...word, originalIndex: index }))
            .filter(word => !word.is_title)
            .sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);

        wordsToDisplay.forEach(wordData => {
            const item = document.createElement('div');
            item.className = 'sidebar-word-item';
            item.textContent = this.getDisplayWord(wordData);
            item.dataset.index = wordData.originalIndex;

            item.addEventListener('click', () => {
                this.playWord(this.wordsData[wordData.originalIndex], wordData.originalIndex);
            });

            this.sidebarWordList.appendChild(item);
        });
        debugLog('Sidebar rendered with', wordsToDisplay.length, 'words.');
    }

    updateSidebarPlayingState(index, isPlaying) {
        if (!this.sidebarWordList) return;

        this.sidebarWordList.querySelectorAll('.sidebar-word-item.playing').forEach(item => {
            item.classList.remove('playing');
        });

        if (isPlaying) {
            const sidebarItem = this.sidebarWordList.querySelector(`.sidebar-word-item[data-index="${index}"]`);
            if (sidebarItem) {
                sidebarItem.classList.add('playing');
                sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    updatePlayAllSectionSelect() {
        const sectionSelect = document.getElementById('playAllSectionSelect');
        if (!sectionSelect) return;
        this.playAllSectionSelect = sectionSelect;

        const sections = new Set();
        (this.filteredWords || this.wordsData).forEach(w => {
            if (w.section && w.section !== 'custom') {
                sections.add(w.section);
            }
        });

        const prev = sectionSelect.value || 'all';
        sectionSelect.innerHTML = '<option value="all">整页</option>';

        const sortedSections = Array.from(sections).sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        sortedSections.forEach(sec => {
            const option = document.createElement('option');
            option.value = sec;
            option.textContent = `章节 ${sec}`;
            sectionSelect.appendChild(option);
        });

        if (sortedSections.includes(prev)) {
            sectionSelect.value = prev;
        } else {
            sectionSelect.value = 'all';
        }
    }

    createWordButton(wordData, index) {
        const button = document.createElement('button');
        button.className = 'word-button';
        // 浣跨敤鍘熷鏁版嵁绱㈠紩锛屼繚璇佸悗缁紪杈?鍒犻櫎/瀹氫綅鍧囪兘鍑嗙‘鏄犲皠鍒?this.wordsData
        // 鑻ユ湭鎻愪緵 originalIndex锛堝鏂板鎸夐挳鎴栫壒娈婃儏鍐碉級锛屽垯閫€鍥炲綋鍓嶅惊鐜殑 index
        const originalIndex = (typeof wordData._dataIndex === 'number')
            ? wordData._dataIndex
            : ((typeof wordData.originalIndex === 'number') ? wordData.originalIndex : index);
        const buttonLabel = this.getDisplayWord(wordData);
        const canonicalWord = String(wordData.word || '').trim();
        button.dataset.index = originalIndex;
        button.dataset.word = buttonLabel;
        button.dataset.label = buttonLabel;
        button.dataset.wordKey = canonicalWord.toLowerCase();
        button.setAttribute('aria-label', buttonLabel);

        // 璁剧疆鎸夐挳鍙鎬х姸鎬?
                    if (!this.showButtons) {
            button.classList.add('hidden');
        }

        // 设置按钮文本（仅显示单词，不显示序号）
        if (this.showLabels) {
            const textSpan = document.createElement('span');
            textSpan.className = 'word-text';
            textSpan.textContent = buttonLabel;
            button.appendChild(textSpan);
            if (wordData.is_title) {
                button.classList.add('title');
            }
        }

        // 璁＄畻鎸夐挳浣嶇疆鍜屽昂瀵?        this.setButtonPosition(button, wordData);

        // 缁戝畾鐐瑰嚮浜嬩欢
        button.addEventListener('click', (event) => {
            // 1. 管理员模式下，禁用播放和过滤功能（点击仅用于选中，选中逻辑由 handleAdminButtonClick 处理）
            if (this.adminMode) {
                // 注意：不要调用 stopPropagation，否则 handleAdminButtonClick 可能无法接收到事件
                return;
            }

            // 2. 濡傛灉鍦ㄥ垹闄ゆā寮忎笅锛屾墽琛屽垹闄ゆ搷浣?
            if (this.deleteMode) {
                event.preventDefault();
                event.stopPropagation();
                this.deleteButton(originalIndex);
                return;
            }

            // 今日复习模式处理
            if (this.reviewModeActive) {
                this.handleReviewClick(wordData, button);
                return;
            }

            // 新增：测试模式处理
            if (this.testMode) {
                this.handleTestClick(wordData, button);
                return;
            }
            
            // 3. 新增：如果是标题按钮（不带序号），点击时触发章节过滤
            // 注意：在“播放全部”过程中不触发过滤，以免隐藏其他按钮
            if (wordData.is_title && wordData.section && !this.isPlayingAll) {
                this.toggleSectionFilter(wordData.section);
            }

            // 4. 鍚﹀垯姝ｅ父鎾斁闊抽
            this.playWord(wordData, originalIndex);
        });

        // 鑻ュ凡鍦ㄧ鐞嗗憳妯″紡涓嬶紝缁戝畾绠＄悊鍛樼浉鍏充簨浠?
        if (this.adminMode) {
            button.addEventListener('click', this.handleAdminButtonClick.bind(this));
            button.addEventListener('mousedown', this.handleMouseDown.bind(this));
            button.addEventListener('dblclick', this.handleInlineEditDblClick.bind(this));
            this.addResizeHandles(button);
        }

        return button;
    }

    setButtonPosition(button, wordData) {
        // 将 PDF 坐标转换为网页坐标
        const x = wordData.x0 * this.scaleX + this.offsetX;
        const y = wordData.y0 * this.scaleY + this.offsetY;
        const width = wordData.width * this.scaleX;
        const height = wordData.height * this.scaleY;

        // 功能优先：学习模式按钮增加遮罩外扩，避免 OCR 框偏紧导致边角漏字
        // 经验规则：普通模式下至少 4px 外扩，长单词再额外增加 1px。
        const wordLength = this.getDisplayWord(wordData).length;
        const coverPadding = this.adminMode ? 0 : (wordLength >= 8 ? 5 : 4);
        const finalWidth = Math.max(width + coverPadding * 2, 34);
        const finalHeight = Math.max(height + coverPadding * 2, 22);

        button.style.left = (x - coverPadding) + 'px';
        button.style.top = (y - coverPadding) + 'px';
        button.style.width = finalWidth + 'px';
        button.style.height = finalHeight + 'px';

        // 文本大小按按钮高度自适应，避免文字溢出
        const textSpan = button.querySelector('.word-text');
        if (textSpan) {
            const text = this.getDisplayWord(wordData);
            const textLength = Math.max(1, text.length);
            const maxByHeight = finalHeight * 0.52;
            const maxByWidth = (finalWidth - 6) / (textLength * 0.62);
            const adaptiveFontSize = Math.max(7, Math.min(13, maxByHeight, maxByWidth));
            textSpan.style.fontSize = adaptiveFontSize.toFixed(1) + 'px';
        }
    }

    // 鏂板锛氬皢鍍忕礌鍧愭爣杞崲鍥濸DF鍧愭爣
    convertPixelToPDFCoordinates(pixelX, pixelY, pixelWidth, pixelHeight) {
        // 灏嗗儚绱犲潗鏍囪浆鎹㈠洖PDF鍧愭爣
        // 鑰冭檻娴忚鍣ㄧ缉鏀剧殑褰卞搷
        const adjustedX = (pixelX - this.offsetX);
        const adjustedY = (pixelY - this.offsetY);
        
        const pdfX = adjustedX / this.scaleX;
        const pdfY = adjustedY / this.scaleY;
        const pdfWidth = pixelWidth / this.scaleX;
        const pdfHeight = pixelHeight / this.scaleY;
        
        return {
            x0: pdfX,
            y0: pdfY,
            width: pdfWidth,
            height: pdfHeight
        };
    }

    updateButtonPositions() {
        const buttons = this.wordButtons.querySelectorAll('.word-button');
        buttons.forEach((button) => {
            const idx = parseInt(button.dataset.index);
            if (!isNaN(idx) && this.wordsData[idx]) {
                this.setButtonPosition(button, this.wordsData[idx]);
            }
        });
    }

    async playWord(wordData, index, options = {}) {
        try {
            debugLog('开始播放单词', wordData.word, '索引:', index);
            
            // 获取所有可能的音频路径
            const possiblePaths = await this.getAllPossibleAudioPaths(wordData);
            debugLog('候选音频路径列表:', possiblePaths);
            
            let audioPath = null;
            let encodedPath = null;
            // 记录最后一次尝试的音频路径（用于错误提示）
            this.lastAudioAttemptedRawPath = null;
            this.lastAudioAttemptedSrc = null;

            // 逐个尝试可能的音频路径，直到找到存在的文件
            for (let i = 0; i < possiblePaths.length; i++) {
                const path = possiblePaths[i];
                const encoded = this.encodeAudioPath(path);
                debugLog(`尝试音频路径 [${i + 1}/${possiblePaths.length}]: ${path}`);
                debugLog(`编码后的路径: ${encoded}`);

                // 记录当前尝试路径（即便失败也用于错误提示）
                this.lastAudioAttemptedRawPath = path;
                this.lastAudioAttemptedSrc = encoded;

                const audioExists = await this.checkAudioExists(encoded);
                debugLog(`路径 ${path} 存在性校验结果: ${audioExists}`);

                if (audioExists) {
                    audioPath = path;
                    encodedPath = encoded;
                    debugLog(`找到可用的音频文件: ${audioPath}`);
                    break;
                }
            }

            // 如果没有找到任何可用的音频文件
            if (!audioPath) {
                const errorMsg = `未找到任何可用的音频文件。已尝试的路径: ${possiblePaths.join(', ')}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }

            // 更新 UI 状态
            if (!this.testMode && !options.suppressUI) {
                this.currentWordIndex = index;
                this.updatePlayingState(wordData, index);
                this.updateSidebarPlayingState(index, true);
            }

            // 加载并播放音频（增强版：避免并发导致的播放拒绝）
            debugLog('设置音频源:', encodedPath);
            // 若当前正在播放，先暂停并归零
            if (this.isPlaying) {
                try { this.audioPlayer.pause(); } catch (e) { console.warn('暂停当前音频失败（可忽略）:', e); }
            }
            this.audioPlayer.currentTime = 0;
            this.isPlaying = false;
            this.hideAudioIndicator();

            // 设置新音频源并主动加载
            this.audioPlayer.src = encodedPath;
            this.lastSetAudioSrc = encodedPath;
            try { this.audioPlayer.load(); } catch (e) { console.warn('调用 load() 失败（浏览器可能忽略），继续播放流程:', e); }

            debugLog('开始播放音频...');
            await this.audioPlayer.play();
            debugLog('音频播放成功');

            // 璁板綍宸叉挱鏀剧殑鍗曡瘝
            this.playedWords.add(index);
            this.updateStats();

        } catch (error) {
            const errorMsg = `播放 "${wordData.word}" 失败: ${error.message}`;
            console.error('播放错误详情:', error);
            this.showError(errorMsg);
            this.onAudioError(error);
        }
    }

    // 检查音频文件是否存在
    async checkAudioExists(audioPath) {
        try {
            // 统一转换为可请求的绝对地址
            const requestURL = this.encodeAudioPath(audioPath);
            // 优先使用 HEAD 方法（若服务器支持）
            const headResp = await fetch(requestURL, { method: 'HEAD', cache: 'no-cache' });
            if (headResp && headResp.ok) {
                return true;
            }
            // HEAD 不可用或非 2xx，回退到 GET 的轻量验证（使用 Range 请求仅测试文件存在性）
            const getResp = await fetch(requestURL, {
                method: 'GET',
                headers: { 'Range': 'bytes=0-0' },
                cache: 'no-cache'
            });
            if (getResp && getResp.ok) {
                return true;
            }
            // 进一步回退：使用临时 <audio> 元素尝试加载（解决部分服务禁止 HEAD/Range 的情况）
            return await this.testAudioPathViaElement(requestURL, 2000);
        } catch (error) {
            console.warn(`检查音频文件失败: ${audioPath}`, error);
            // 网络/权限异常下，尝试通过 <audio> 元素验证
            try {
                const req = this.encodeAudioPath(audioPath);
                return await this.testAudioPathViaElement(req, 2000);
            } catch (e2) {
                console.warn('通过 <audio> 元素验证也失败:', e2);
                return false;
            }
        }
    }

    // 使用临时 <audio> 元素检测路径是否可播放（canplay/loadedmetadata 即视为成功）
    async testAudioPathViaElement(url, timeoutMs = 2000) {
        return new Promise(resolve => {
            let settled = false;
            const temp = new Audio();
            temp.preload = 'metadata';

            const cleanup = () => {
                try {
                    temp.pause();
                } catch (_) {}
                temp.removeAttribute('src');
                try { temp.load(); } catch (_) {}
            };

            const onSuccess = () => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    resolve(true);
                }
            };

            const onError = () => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    resolve(false);
                }
            };

            temp.addEventListener('canplay', onSuccess, { once: true });
            temp.addEventListener('loadedmetadata', onSuccess, { once: true });
            temp.addEventListener('error', onError, { once: true });

            try {
                temp.src = url;
                temp.load();
            } catch (e) {
                console.warn('临时音频元素加载失败:', e);
                cleanup();
                return resolve(false);
            }

            setTimeout(() => {
                if (!settled) {
                    settled = true;
                    cleanup();
                    resolve(false);
                }
            }, timeoutMs);
        });
    }

    getAudioPath(wordData) {
        // 鏍规嵁闊抽鏂囦欢鍛藉悕瑙勫垯鏋勫缓璺緞
        // 使用新的音频文件路径结构：all_sounds/section/filename
        const section = wordData.section || this.pageConfig.primarySection;
        if (wordData.is_title) {
            // 鏍囬闊抽鏂囦欢璺緞 - 浼樺厛浣跨敤uk鍙戦煶
            const titleText = wordData.title_text || wordData.word;
            return `all_sounds/${section}/${titleText}_main_uk.mp3`;
        } else {
            // 鏅€氬崟璇嶉煶棰戞枃浠惰矾寰?            // 鑾峰彇鍙戦煶鏍囪瘑锛堝鐞嗙壒娈婃儏鍐碉級
            const pronunciation = this.getPronunciationSuffix(wordData.word, section);
            
            // 澶勭悊鐗规畩鐨勬枃浠跺悕鏍煎紡
            let audioFileName;
            if (wordData.word.toLowerCase() === 'gray') {
                // gray鐨勭壒娈婃枃浠跺悕鏍煎紡
                audioFileName = `${wordData.number}. gray _US_ _ grey _UK__${pronunciation}.mp3`;
            } else if (wordData.word.includes(' ')) {
                // 澶氳瘝鐭鐨勬枃浠跺悕鏍煎紡
                audioFileName = `${wordData.number}. ${wordData.word}_${pronunciation}.mp3`;
            } else {
                // 标准文件名格式
                audioFileName = `${wordData.number}. ${wordData.word}_${pronunciation}.mp3`;
            }
            
            return `all_sounds/${section}/${audioFileName}`;
        }
    }

    // 新增：获取所有可能的音频路径（用于多后缀尝试）
    async getAllPossibleAudioPaths(wordData) {
        // 1) 自定义音频路径优先（适用于“章节/文件名”或完整 URL/磁盘路径）
        if (wordData.section === "custom" && wordData.audio) {
            const customPaths = [];
            const audioFile = wordData.audio;

            // 完整 URL 或磁盘路径（如 E:\xxx\a.mp3）
            if (audioFile.startsWith('http') || audioFile.match(/^[a-zA-Z]:/)) {
                customPaths.push(audioFile);
            } else if (audioFile.includes('/') && !audioFile.startsWith('all_sounds/')) {
                // 形如 "66.1/2. xxx_us.mp3" → 统一加上 all_sounds 前缀
                customPaths.push(`all_sounds/${audioFile}`);
            } else if (audioFile.startsWith('all_sounds/')) {
                // 已经是完整相对路径，直接使用
                customPaths.push(audioFile);
            } else {
                // 未指定章节时，按当前页面的章节集合进行尝试
                const pageSections = (this.pageConfig.sections && Array.isArray(this.pageConfig.sections) && this.pageConfig.sections.length > 0)
                    ? this.pageConfig.sections
                    : [this.pageConfig.primarySection];
                for (const sec of pageSections) {
                    customPaths.push(`all_sounds/${sec}/${audioFile}`);
                    if (!audioFile.includes('.')) {
                        customPaths.push(`all_sounds/${sec}/${audioFile}.mp3`);
                        customPaths.push(`all_sounds/${sec}/${audioFile}.wav`);
                    }
                }
            }

            debugLog(`自定义按钮 "${wordData.word}" 的候选音频路径:`, customPaths);
            return customPaths;
        }

        // 2) 章节集合：优先使用单词自身的 section，否则使用页面配置的 sections（支持多章节页，如第72页对应 66 与 67 章）
        const candidateSections = (wordData.section && wordData.section !== 'custom')
            ? [wordData.section]
            : ((this.pageConfig.sections && Array.isArray(this.pageConfig.sections) && this.pageConfig.sections.length > 0)
                ? this.pageConfig.sections
                : [this.pageConfig.primarySection]);

        debugLog(`单词 "${wordData.word}" 使用章节集合: ${JSON.stringify(candidateSections)}（原始: ${wordData.section}，主章节: ${this.pageConfig.primarySection}）`);

        const possiblePaths = [];
        let foundInCandidateSections = false; // 标记：是否在候选章节中通过清单反向匹配命中

        // 3) 标题音频：在所有候选章节中尝试多种命名模式（优先检查常见的“下划线默认文件”），仅使用 mp3
        if (wordData.is_title) {
            const titleText = wordData.title_text || wordData.word;
            for (const sec of candidateSections) {
                const primarySuffix = this.getPronunciationSuffix(titleText, sec);
                const suffixes = Array.from(new Set([primarySuffix, 'uk', 'us', 'usuk']));
                for (const sfx of suffixes) {
                    // 优先：_uk / _us / _usuk（很多章节标题音频采用此命名）
                    possiblePaths.push(`all_sounds/${sec}/_${sfx}.mp3`);
                    // 其次：_main_uk 等（部分章节标题采用 main 标识）
                    possiblePaths.push(`all_sounds/${sec}/_main_${sfx}.mp3`);
                    // 再次：The human body_uk 等（少数目录可能显式写出标题文本）
                    possiblePaths.push(`all_sounds/${sec}/${titleText}_${sfx}.mp3`);
                    possiblePaths.push(`all_sounds/${sec}/${titleText}_main_${sfx}.mp3`);
                }
                // 兜底：不带后缀的标题文件
                possiblePaths.push(`all_sounds/${sec}/${titleText}.mp3`);
            }
            return possiblePaths;
        }

        // 4) 普通单词：生成所有“变体 × 发音后缀 × 章节”的组合路径
        const allSuffixes = ['us', 'uk', 'usuk'];
        const wordVariants = this.getWordVariants(wordData.word);

        for (const sec of candidateSections) {
            for (const wordVariant of wordVariants) {
                for (const suffix of allSuffixes) {
                    let audioFileName;
                    if (wordVariant.toLowerCase() === 'gray') {
                        // gray 的特殊命名模式
                        audioFileName = `${wordData.number}. gray _US_ _ grey _UK__${suffix}.mp3`;
                    } else if (wordVariant.includes(' ')) {
                        // 多词短语的命名模式（空格保留为原格式，用于后续 URL 编码）
                        audioFileName = `${wordData.number}. ${wordVariant}_${suffix}.mp3`;
                    } else {
                        // 标准文件名
                        audioFileName = `${wordData.number}. ${wordVariant}_${suffix}.mp3`;
                    }
                    possiblePaths.push(`all_sounds/${sec}/${audioFileName}`);

                    // 新增：无编号命名模式（适配常见目录中的 word_suffix.mp3 / word.mp3）
                    const variantSlug = wordVariant.trim();
                    const variantUnderscore = variantSlug.replace(/\s+/g, '_');
                    // 例如：head_us.mp3
                    possiblePaths.push(`all_sounds/${sec}/${variantSlug}_${suffix}.mp3`);
                    // 例如：shoulder_blade_us.mp3 / shoulder_blade_us.wav
                    if (variantUnderscore !== variantSlug) {
                        possiblePaths.push(`all_sounds/${sec}/${variantUnderscore}_${suffix}.mp3`);
                    }
                }

                // 新增：不带后缀的简化命名（例如 head.mp3 / shoulder_blade.mp3）
                const variantSlug2 = wordVariant.trim();
                const variantUnderscore2 = variantSlug2.replace(/\s+/g, '_');
                possiblePaths.push(`all_sounds/${sec}/${variantSlug2}.mp3`);
                if (variantUnderscore2 !== variantSlug2) {
                    possiblePaths.push(`all_sounds/${sec}/${variantUnderscore2}.mp3`);
                }
            }

            // 5) 反向匹配：直接从章节音频清单中按“编号.”匹配，提高容错率
            try {
                const audioFileBasedPaths = await this.getAudioFileBasedPaths(wordData, sec);
                if (audioFileBasedPaths && audioFileBasedPaths.length > 0) {
                    foundInCandidateSections = true;
                    debugLog(`在候选章节 ${sec} 中找到 ${audioFileBasedPaths.length} 个与编号 ${wordData.number} 匹配的音频：`, audioFileBasedPaths);
                    possiblePaths.unshift(...audioFileBasedPaths);
                } else {
                    debugLog(`候选章节 ${sec} 未找到与编号 ${wordData.number} 匹配的音频文件`);
                }
            } catch (e) {
                console.warn(`基于清单反向匹配失败（可忽略）: 章节 ${sec}`, e);
            }

            // 5.1) 补充反向匹配：基于单词名称在清单中匹配，提高容错率
            try {
                const audioFileByWordPaths = await this.getAudioFileBasedPathsByWord(wordData, sec);
                if (audioFileByWordPaths && audioFileByWordPaths.length > 0) {
                    foundInCandidateSections = true;
                    debugLog(`在候选章节 ${sec} 中通过单词名匹配到 ${audioFileByWordPaths.length} 个音频：`, audioFileByWordPaths);
                    possiblePaths.unshift(...audioFileByWordPaths);
                } else {
                    debugLog(`候选章节 ${sec} 未通过单词名匹配到任何音频文件`);
                }
            } catch (e) {
                console.warn(`基于单词名的清单反向匹配失败（可忽略）: 章节 ${sec}`, e);
            }
        }

        // 6) 兜底：若候选章节未命中清单反向匹配，则尝试跨章节扫描（优先同大章）
        try {
            if (!foundInCandidateSections) {
                debugLog('候选章节未命中清单匹配，启动跨章节反向匹配兜底...');
                const crossPaths = await this.getAudioFileBasedPathsAcrossSections(wordData);
                if (crossPaths && crossPaths.length > 0) {
                    debugLog(`跨章节反向匹配找到 ${crossPaths.length} 个候选路径：`, crossPaths);
                    possiblePaths.push(...crossPaths);
                } else {
                    debugLog('跨章节反向匹配未找到任何候选路径');
                }
            }
        } catch (e) {
            console.warn('跨章节反向匹配兜底流程出现异常（可忽略）:', e);
        }

        // 7) 去重避免重复尝试
        const deduped = Array.from(new Set(possiblePaths));
        return deduped;
    }

    // 新增：基于音频文件名的反向匹配方法
    // 作用：读取章节目录下的所有 mp3 文件，匹配与当前单词编号相同的文件，返回可能路径列表
    async getAudioFileBasedPaths(wordData, section) {
        const possiblePaths = [];
        try {
            const audioFiles = await this.getAudioFilesInSection(section);
            const matchingFiles = audioFiles.filter(fileName => {
                const numMatch = fileName.match(/^(\d+)\./);
                if (!numMatch) return false;
                const fileNumber = parseInt(numMatch[1], 10);
                return fileNumber === wordData.number;
            });
            for (const fileName of matchingFiles) {
                possiblePaths.push(`all_sounds/${section}/${fileName}`);
            }
        } catch (error) {
            console.warn(`获取章节 ${section} 的音频文件列表失败:`, error);
        }
        return possiblePaths;
    }

    // 新增：基于“单词名称”的反向匹配（兼容章节清单为真实文件名或仅为词条名两种情况）
    async getAudioFileBasedPathsByWord(wordData, section) {
        const results = [];
        try {
            const audioFiles = await this.getAudioFilesInSection(section);
            if (!audioFiles || audioFiles.length === 0) return results;

            // 生成候选词形（空格、下划线、连字符三种写法）
            const variants = this.getWordVariants(wordData.word).map(v => v.trim());
            const candidates = new Set();
            for (const v of variants) {
                candidates.add(v);
                const underscored = v.replace(/\s+/g, '_');
                if (underscored !== v) candidates.add(underscored);
                const hyphenated = v.replace(/\s+/g, '-');
                if (hyphenated !== v) candidates.add(hyphenated);
            }
            const lowerCandidates = Array.from(candidates).map(c => c.toLowerCase());

            // 情况区分：目录真实文件名 vs 词条名列表
            const hasExtensions = audioFiles.some(name => /\.(mp3|wav)$/i.test(name));
            if (hasExtensions) {
                // 情况 A：真实文件名列表 → 仅考虑 .mp3，并进行“严格词根”评分排序，避免 arm 命中 forearm
                const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const variantForms = new Set();
                for (const v of this.getWordVariants(wordData.word)) {
                    const vl = v.trim().toLowerCase();
                    variantForms.add(vl); // 原始（保留空格）
                    variantForms.add(vl.replace(/\s+/g, '_')); // 下划线
                    variantForms.add(vl.replace(/\s+/g, '-')); // 连字符
                }
                const matched = [];
                for (const fileName of audioFiles) {
                    if (!/\.mp3$/i.test(fileName)) continue; // 只绑定 mp3
                    const lowerName = fileName.toLowerCase();
                    const baseName = lowerName.replace(/\.(mp3|wav)$/i, '');
                    let score = 0;
                    for (const form of variantForms) {
                        if (baseName === form) { score = Math.max(score, 3); continue; }
                        if (baseName.startsWith(form + '_') || baseName.startsWith(form + '-') || baseName.startsWith(form + ' ')) {
                            score = Math.max(score, 2);
                            continue;
                        }
                        const re = new RegExp(`(^|[_\\-\\s])${escapeRegex(form)}([_\\-\\s]|$)`);
                        if (re.test(baseName)) { score = Math.max(score, 1); }
                    }
                    if (score > 0) {
                        const suffixPriority = (name) => {
                            if (name.endsWith('_uk')) return 3;
                            if (name.endsWith('_usuk')) return 2;
                            if (name.endsWith('_us')) return 1;
                            return 0;
                        };
                        matched.push({ fileName, baseName, score, prio: suffixPriority(baseName) });
                    }
                }
                matched.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    if (b.prio !== a.prio) return b.prio - a.prio;
                    return a.baseName.length - b.baseName.length;
                });
                if (matched.length > 0) {
                    debugLog(`章节 ${section} 基于严格词根匹配到 ${matched.length} 个 .mp3：`, matched.map(m => m.fileName));
                    for (const m of matched) {
                        results.push(`all_sounds/${section}/${m.fileName}`);
                    }
                }
            } else {
                // 情况 B：lists_output 仅提供“词条名” → 根据命名规范构造候选路径（仅构造 mp3）
                const normalizedList = audioFiles.map(s => s.trim().toLowerCase());
                const existsInList = lowerCandidates.some(c => normalizedList.includes(c));
                if (existsInList) {
                    const primarySuffix = this.getPronunciationSuffix(wordData.word, section);
                    const suffixes = Array.from(new Set([primarySuffix, 'uk', 'us', 'usuk']));
                    for (const v of variants) {
                        const label = v; // 章节清单中常用空格形式（例如 “tear duct”）
                        // 带编号形式：“<number>. <label>_<suffix>.mp3”
                        for (const sfx of suffixes) {
                            const base = `${wordData.number}. ${label}_${sfx}`;
                            results.push(`all_sounds/${section}/${base}.mp3`);
                        }
                        // 无编号形式：“<label>_<suffix>.mp3” 和 “<label>.mp3”
                        for (const sfx of suffixes) {
                            results.push(`all_sounds/${section}/${label}_${sfx}.mp3`);
                        }
                        results.push(`all_sounds/${section}/${label}.mp3`);
                    }
                    // 特例：gray/grey（双写法合并到一个文件名中，且含编号）
                    if (lowerCandidates.some(x => x === 'gray' || x === 'grey')) {
                        results.push(`all_sounds/${section}/${wordData.number}. gray _US_ _ grey _UK__usuk.mp3`);
                    }
                }
            }
        } catch (e) {
            console.warn(`基于单词名反向匹配章节 ${section} 失败：`, e);
        }
        return results;
    }

    // 新增：获取指定章节的所有音频文件列表
    async getAudioFilesInSection(section) {
        // 杩欓噷鎴戜滑浣跨敤涓€涓紦瀛樻満鍒舵潵閬垮厤閲嶅璇锋眰
                    if (!this.audioFileCache) {
            this.audioFileCache = {};
        }
        
        if (this.audioFileCache[section]) {
            return this.audioFileCache[section];
        }
        
        // 方案 A：直接解析 all_sounds/section 的目录页，提取 a 标签中的文件名（支持 mp3/wav）
        try {
            const response = await fetch(`all_sounds/${section}/`);
            if (response.ok) {
                const html = await response.text();
                const audioFiles = [];
                const linkRegex = /<a[^>]*href="([^"]*\.(?:mp3|wav))"[^>]*>/gi;
                let match;
                while ((match = linkRegex.exec(html)) !== null) {
                    const href = match[1];
                    // 可能是相对路径或百分号编码，这里统一只保留文件名部分
                    try {
                        const url = new URL(href, window.location.origin);
                        audioFiles.push(decodeURIComponent(url.pathname.split('/').pop()));
                    } catch (e) {
                        const parts = href.split('/');
                        audioFiles.push(decodeURIComponent(parts[parts.length - 1]));
                    }
                }
                if (audioFiles.length > 0) {
                    this.audioFileCache[section] = audioFiles;
                    return audioFiles;
                }
                // 若未解析到链接，继续方案 B
            }
        } catch (error) {
            console.warn(`无法通过目录页接口获取章节 ${section} 的文件列表，改用 lists_output`, error);
        }
        
        // 方案 B：从 lists_output/list_{section}.txt 读取音频文件列表
        try {
            const listResponse = await fetch(`lists_output/list_${section}.txt`);
            if (listResponse.ok) {
                const text = await listResponse.text();
                // 清洗文本内容，生成文件/词条列表（可能是真实文件名，也可能仅是词条名）
                const filesFromList = text
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line)
                    .map(line => {
                        const parts = line.split('/');
                        const last = parts[parts.length - 1];
                        try { return decodeURIComponent(last); } catch (e) { return last; }
                    });
                this.audioFileCache[section] = filesFromList;
                return filesFromList;
            }
        } catch (e) {
            console.warn(`读取 lists_output/list_${section}.txt 失败:`, e);
        }
        
        // 最终兜底：返回空列表并写入缓存，避免重复请求
        this.audioFileCache[section] = [];
        return [];
    }

    // 新增：解析 all_sounds/ 下的所有章节目录（一次请求后缓存）
    async getAllSections() {
        try {
            if (this.allSectionsCache && Array.isArray(this.allSectionsCache) && this.allSectionsCache.length > 0) {
                return this.allSectionsCache;
            }
            const resp = await fetch('all_sounds/');
            if (!resp.ok) {
                console.warn('获取 all_sounds 目录页失败，状态码:', resp.status);
                this.allSectionsCache = [];
                return this.allSectionsCache;
            }
            const html = await resp.text();
            const sections = [];
            // 提取所有 "目录/" 链接，并尝试还原章节名（如 1.1/、66.2/）
            const dirLinkRegex = /<a[^>]*href="([^\"]+\/)"[^>]*>/gi;
            let match;
            while ((match = dirLinkRegex.exec(html)) !== null) {
                const href = match[1];
                // 仅保留形如 "x.y/" 的目录
                const cleaned = href.replace(/\/+$/,'');
                const lastPart = cleaned.split('/').pop();
                if (/^\d+\.\d+$/.test(lastPart)) {
                    sections.push(decodeURIComponent(lastPart));
                }
            }
            this.allSectionsCache = sections;
            debugLog(`已解析到 ${sections.length} 个章节目录：`, sections);
            return sections;
        } catch (e) {
            console.warn('解析 all_sounds 章节目录失败：', e);
            this.allSectionsCache = [];
            return this.allSectionsCache;
        }
    }

    // 新增：基于编号的跨章节反向匹配（优先同大章，再次全量扫描）
    async getAudioFileBasedPathsAcrossSections(wordData) {
        const results = [];
        try {
            const allSections = await this.getAllSections();
            if (!allSections || allSections.length === 0) {
                return results;
            }

            const baseSection = (wordData.section && wordData.section !== 'custom')
                ? wordData.section
                : (this.pageConfig.primarySection || (Array.isArray(this.pageConfig.sections) ? this.pageConfig.sections[0] : ''));
            const baseMajor = (baseSection || '').split('.')[0];

            // 优先扫描同大章（如 1.x），再扫描剩余章节
            const prioritized = [
                ...allSections.filter(s => baseMajor && s.startsWith(baseMajor + '.')),
                ...allSections.filter(s => !baseMajor || !s.startsWith(baseMajor + '.'))
            ];

            debugLog(`跨章节反向匹配开始（编号: ${wordData.number}, 基准大章: ${baseMajor || '未知'}），待扫描章节数: ${prioritized.length}`);

            // 顺序扫描，找到即停止，避免过多请求
            for (let i = 0; i < prioritized.length; i++) {
                const sec = prioritized[i];
                // 先按编号匹配
                const pathsByNumber = await this.getAudioFileBasedPaths(wordData, sec);
                if (pathsByNumber && pathsByNumber.length > 0) {
                    debugLog(`在章节 ${sec} 按编号找到 ${pathsByNumber.length} 个候选：`, pathsByNumber);
                    results.push(...pathsByNumber);
                    break; // 命中即停止
                }
                // 再按单词名匹配
                const pathsByWord = await this.getAudioFileBasedPathsByWord(wordData, sec);
                if (pathsByWord && pathsByWord.length > 0) {
                    debugLog(`在章节 ${sec} 按单词名找到 ${pathsByWord.length} 个候选：`, pathsByWord);
                    results.push(...pathsByWord);
                    break; // 命中即停止
                }
                // 每 10 个章节打印一次进度日志
                if (i % 10 === 0) {
                    debugLog(`跨章节扫描进度：${i}/${prioritized.length}，当前章节 ${sec} 未命中`);
                }
            }
        } catch (e) {
            console.warn('跨章节反向匹配流程异常：', e);
        }
        return results;
    }

    // 获取单词的所有可能变体（处理斜杠、连字符、下划线连接等场景）
    getWordVariants(word) {
        // 1) 规范化输入
        const base = typeof word === 'string' ? word.trim() : '';
        const variants = [];
        if (base.length > 0) {
            variants.push(base);
        }

        // 2) 已知同义映射（用于 PDF 中的“X _ Y”形式）
        const slashWordMappings = {
            'breastbone': 'breastbone _ sternum',
            'sternum': 'breastbone _ sternum',
            'collarbone': 'collarbone _ clavicle',
            'clavicle': 'collarbone _ clavicle',
            'shoulder blade': 'shoulder blade _ scapula',
            'scapula': 'shoulder blade _ scapula',
            'kneecap': 'kneecap _ patella',
            'patella': 'kneecap _ patella',
            'tailbone': 'tailbone _ sacrum',
            'sacrum': 'tailbone _ sacrum',
            'to sweat': 'to sweat _ to perspire',
            'to perspire': 'to sweat _ to perspire',
            'buttock': 'buttock _ gluteus maximus',
            'gluteus maximus': 'buttock _ gluteus maximus',
            'bicuspids': 'bicuspids _US_ _ premolars _UK_',
            'premolars': 'bicuspids _US_ _ premolars _UK_'
        };

        const lowerWord = base.toLowerCase();
        if (slashWordMappings[lowerWord]) {
            variants.push(slashWordMappings[lowerWord]);
        }

        // 3) 处理“空格斜杠空格”形式（如 "to sweat / to perspire"）
        if (base.includes(' / ')) {
            const parts = base.split(' / ').map(part => part.trim()).filter(Boolean);
            variants.push(...parts);
            if (parts.length > 1) {
                variants.push(parts.join(' _ '));
            }
        }

        // 4) 处理无空格斜杠（如 "to sweat/to perspire"）
        if (base.includes('/') && !base.includes(' / ')) {
            const parts = base.split('/').map(part => part.trim()).filter(Boolean);
            variants.push(...parts);
            if (parts.length > 1) {
                variants.push(parts.join(' _ '));
            }
        }

        // 5) 处理连字符（如 "father-in-law" → "father in law"）
        if (base.includes('-')) {
            variants.push(base.replace(/-/g, ' '));
        }

        // 6) 去重并输出日志
        const unique = Array.from(new Set(variants));
        debugLog(`单词 "${base}" 的变体:`, unique);
        return unique;
    }

    // 获取单词的发音标识后缀（增强版，支持更多章节规则）
    getPronunciationSuffix(word, section) {
        // 根据章节和单词确定发音标识
        const sectionBasedPronunciations = {
            // 绗?4-21椤电殑鐗规畩鍙戦煶瑙勫垯
            '1.1': 'uk',     // 绗?4椤电珷鑺?.1浣跨敤鑻卞紡鍙戦煶
            '1.2': 'uk',     // 绗?5椤电珷鑺?.2浣跨敤鑻卞紡鍙戦煶
            '1.3': 'uk',     // 绗?5椤电珷鑺?.3浣跨敤鑻卞紡鍙戦煶
            '2.1': 'uk',     // 绗?6椤电珷鑺?.1浣跨敤鑻卞紡鍙戦煶
            '2.2': 'uk',     // 绗?6椤电珷鑺?.2浣跨敤鑻卞紡鍙戦煶
            '2.3': 'uk',     // 绗?7椤电珷鑺?.3浣跨敤鑻卞紡鍙戦煶
            '3.1': 'us',     // 绗?8椤电珷鑺?.1浣跨敤缇庡紡鍙戦煶
            '3.2': 'us',     // 绗?8椤电珷鑺?.2浣跨敤缇庡紡鍙戦煶  
            '3.3': 'us',     // 绗?9椤电珷鑺?.3浣跨敤缇庡紡鍙戦煶锛堜慨澶嶏細鍖归厤瀹為檯闊抽鏂囦欢锛?            '4.1': 'us',     // 绗?0椤电珷鑺?.1浣跨敤缇庡紡鍙戦煶
            '4.2': 'usuk',   // 绗?0椤电珷鑺?.2浣跨敤缇庤嫳鍙戦煶
            '4.3': 'us',     // 绗?1椤电珷鑺?.3浣跨敤缇庡紡鍙戦煶
            '4.4': 'us'      // 绗?1椤电珷鑺?.4浣跨敤缇庡紡鍙戦煶
        };

        // 特殊单词使用不同的发音标识
        const specialPronunciations = {
            'calf': 'usuk',
            'gray': 'usuk',
            'tear duct': 'uk',
            'phalanges': 'usuk',  // phalanges浣跨敤缇庤嫳鍙戦煶
            'trachea': 'usuk',    // trachea浣跨敤缇庤嫳鍙戦煶
            'respiratory': 'usuk', // respiratory浣跨敤缇庤嫳鍙戦煶
            'endocrine': 'usuk'   // endocrine浣跨敤缇庤嫳鍙戦煶
        };

        // 棣栧厛妫€鏌ユ槸鍚︽槸鐗规畩鍗曡瘝
                    if (specialPronunciations.hasOwnProperty(word.toLowerCase())) {
            return specialPronunciations[word.toLowerCase()];
        }

        // 鐒跺悗妫€鏌ョ珷鑺傜壒瀹氱殑鍙戦煶瑙勫垯
                    if (sectionBasedPronunciations.hasOwnProperty(section)) {
            return sectionBasedPronunciations[section];
        }

        // 榛樿浣跨敤鑻卞紡鍙戦煶
        return 'uk';
    }

    // 辅助方法：对音频文件路径进行 URL 编码（保留斜杠）
    encodeAudioPath(path) {
        // 说明：
        // 1) 对相对路径逐段编码，避免空格/中文导致的 404；
        // 2) 对 http/https 绝对地址保持不变；
        // 3) 返回可被 <audio> 直接使用的完整 URL（绝对地址）。
        try {
            if (/^https?:\/\//i.test(path)) {
                return path;
            }
            const encodedRelative = path
                .split('/')
                .map(segment => encodeURIComponent(segment))
                .join('/');
            const abs = new URL(encodedRelative, window.location.origin);
            return abs.toString();
        } catch (e) {
            console.warn('encodeAudioPath 编码失败，回退为原始路径:', path, e);
            return path;
        }
    }

    updatePlayingState(wordData, index) {
        // 清除之前的播放状态
        const prevButton = this.wordButtons.querySelector('.word-button.playing');
        if (prevButton) {
            prevButton.classList.remove('playing');
        }
        
        // 设置当前播放状态
        const currentButton = this.wordButtons.querySelector(`[data-index="${index}"]`);
        if (currentButton) {
            currentButton.classList.add('playing');
        }
        
        this.currentWordIndex = index;
        this.playingWord.textContent = `正在播放: ${wordData.word}`;
    }

    onAudioEnded() {
        // 清除播放状态
        const playingButton = this.wordButtons.querySelector('.word-button.playing');
        if (playingButton) {
            playingButton.classList.remove('playing');
            playingButton.classList.add('played');
        }
        
        this.hideAudioIndicator();
        this.isPlaying = false;
        this.currentWordIndex = -1;
    }

    onAudioError(error) {
        // 统一可读中文日志
        let src = '(空)';
        const origin = window.location.origin + '/';
        if (this.audioPlayer && this.audioPlayer.src) {
            src = this.audioPlayer.src;
        }
        const isMedia = /\.(mp3|wav)([?#].*)?$/i.test(src);
        if (!src || src === origin || !isMedia) {
            src = this.lastSetAudioSrc || this.lastAudioAttemptedSrc || src;
        }
        console.error('音频播放错误，当前音频源:', src, '错误对象:', error);
        this.hideAudioIndicator();
        
        const playingButton = this.wordButtons.querySelector('.word-button.playing');
        if (playingButton) {
            playingButton.classList.remove('playing');
        }
        
        // 用户提示：包含当前尝试的音频地址，便于定位问题
        this.showError(`音频播放失败，请检查音频文件是否存在或可访问。源地址: ${src}`);
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressBar.style.width = progress + '%';
        }
    }

    showAudioIndicator() {
        this.audioIndicator.classList.add('show');
    }

    hideAudioIndicator() {
        this.audioIndicator.classList.remove('show');
        this.progressBar.style.width = '0%';
    }

    toggleLabels() {
        if (this.reviewModeActive) {
            this.showError('复习进行中，无法切换标签显示', 'error');
            return;
        }
        this.showLabels = !this.showLabels;
        this.createWordButtons();
        // 重建按钮后，必须重新应用当前的可见性规则（包括章节过滤）
        this.updateButtonVisibility();
    }

    toggleSectionFilter(section) {
        if (this.activeSection === section) {
            this.activeSection = null; // 再次点击同章节标题，取消过滤（显示全部）
            this.showError('已显示全部章节', 'success');
        } else {
            this.activeSection = section; // 激活章节过滤
            this.showError(`只显示章节 ${section} 的按钮`, 'success');
        }
        this.updateButtonVisibility();
    }

    updateButtonVisibility() {
        const buttons = this.wordButtons.querySelectorAll('.word-button');
        
        buttons.forEach(button => {
            const index = parseInt(button.dataset.index);
            if (isNaN(index) || !this.wordsData[index]) return;
            
            const wordData = this.wordsData[index];
            let visible = true;
            
            // 1. 全局按钮开关
            if (!this.showButtons) {
                visible = false;
            }
            
            // 2. 章节过滤
            if (visible && this.activeSection) {
                // 逻辑：显示本章节的所有按钮，以及其他章节的标题按钮（以便切换）
                // 如果不是本章节，且不是标题，则隐藏
                if (wordData.section !== this.activeSection && !wordData.is_title) {
                     visible = false;
                }
            }
            
            if (visible) {
                button.classList.remove('hidden');
            } else {
                button.classList.add('hidden');
            }
        });

        this.recalculateCoordinates();
    }

    toggleButtons() {
        this.showButtons = !this.showButtons;
        const toggleBtn = document.getElementById('toggleButtons');

        if (this.showButtons) {
            toggleBtn.textContent = '隐藏按钮';
            toggleBtn.classList.remove('active');
        } else {
            toggleBtn.textContent = '显示按钮';
            toggleBtn.classList.add('active');
        }

        this.updateButtonVisibility();

        debugLog(`按钮可视性切换: ${this.showButtons ? '显示' : '隐藏'}`);

        // 显示提示信息
        const message = this.showButtons ? '按钮已显示 - 单词被标为按钮' : '按钮已隐藏 - 单词可见';
        this.showError(message, 'success');
    }

    async playAllWords(section = 'all') {
        if (this.isPlaying) {
            // 修复播放全部前的提示文案乱码与字符串未闭合问题
            this.showError('请等待当前音频播放完成');
            return;
        }

        const playAllBtn = document.getElementById('playAll');
        const originalText = playAllBtn.textContent;

        // 设置全部播放标记，防止触发章节过滤等副作用
        this.isPlayingAll = true;

        try {
            await this.unlockAudioPlayback();
            playAllBtn.textContent = '播放中...';
            playAllBtn.disabled = true;
            await this.playAllByButtons(section);

            if (section === 'all') {
                this.showError('全部单词播放完成', 'success');
            } else {
                this.showError(`章节 ${section} 播放完成`, 'success');
            }

        } catch (error) {
            this.showError(`播放全部失败: ${error.message}`);
            console.error('播放全部错误', error);
        } finally {
            this.isPlayingAll = false; // 重置全部播放标记
            playAllBtn.textContent = originalText;
            playAllBtn.disabled = false;
        }
    }

    async playAllByButtons(section = 'all') {
        const buttons = Array.from(this.wordButtons.querySelectorAll('.word-button'))
            .filter(btn => !btn.classList.contains('hidden'))
            .filter(btn => {
                if (section === 'all') return true;
                const idx = parseInt(btn.dataset.index, 10);
                if (isNaN(idx) || !this.wordsData[idx]) return false;
                return this.wordsData[idx].section === section;
            });
        if (buttons.length === 0) {
            if (section === 'all') {
                this.showError('当前页面没有可播放的按钮');
            } else {
                this.showError(`该章节没有可播放的按钮：${section}`);
            }
            return;
        }
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            const idx = parseInt(btn.dataset.index, 10);
            if (isNaN(idx) || !this.wordsData[idx]) continue;
            const wordData = this.wordsData[idx];
            debugLog(`按按钮顺序播放第 ${i + 1}/${buttons.length} 个：${wordData.word}`);
            try {
                await new Promise((resolve, reject) => {
                    const onEnded = () => {
                        this.audioPlayer.removeEventListener('ended', onEnded);
                        this.audioPlayer.removeEventListener('error', onError);
                        resolve();
                    };
                    const onError = (e) => {
                        this.audioPlayer.removeEventListener('ended', onEnded);
                        this.audioPlayer.removeEventListener('error', onError);
                        reject(e);
                    };
                    this.audioPlayer.addEventListener('ended', onEnded);
                    this.audioPlayer.addEventListener('error', onError);
                    btn.click();
                });
            } catch (e) {
                console.warn('播放按钮出错，跳过：', wordData.word, e);
            }
            if (i < buttons.length - 1) {
                await this.delay(500);
            }
        }
    }

    async unlockAudioPlayback() {
        if (this._audioUnlocked) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                if (!this._audioCtx) {
                    try { this._audioCtx = new AudioCtx(); } catch (_) {}
                }
                if (this._audioCtx && typeof this._audioCtx.resume === 'function') {
                    await this._audioCtx.resume();
                }
            }
        } catch (_) {}
        this._audioUnlocked = true;
    }

    // 播放单词并等待完成
    async playWordAndWait(wordData, index) {
        return new Promise((resolve, reject) => {
            const onEnded = () => {
                this.audioPlayer.removeEventListener('ended', onEnded);
                this.audioPlayer.removeEventListener('error', onError);
                resolve();
            };

            const onError = (error) => {
                this.audioPlayer.removeEventListener('ended', onEnded);
                this.audioPlayer.removeEventListener('error', onError);
                reject(error);
            };

            this.audioPlayer.addEventListener('ended', onEnded);
            this.audioPlayer.addEventListener('error', onError);

            // 寮€濮嬫挱鏀?            this.playWord(wordData, index).catch(reject);
        });
    }

    // 寤惰繜鍑芥暟
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateStats() {
        document.getElementById('totalWords').textContent = this.totalWords;
        document.getElementById('playedWords').textContent = this.playedWords.size;
        
        // 鏇存柊褰撳墠绔犺妭鏄剧ず
        const currentSectionElement = document.getElementById('currentSection');
        if (currentSectionElement) {
            const sectionsText = this.pageConfig.sections.join(' + ');
            currentSectionElement.textContent = `${sectionsText} - ${this.pageConfig.title}`;
        }
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message, type = 'error') {
        this.errorMessage.textContent = message;
        this.errorMessage.className = type === 'success' ? 'success-message' : 'error-message';
        this.errorMessage.style.display = 'block';

        const timeout = type === 'success' ? 3000 : 5000;
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, timeout);
    }

    // 管理模式相关方法
    toggleAdminMode() {
        this.adminMode = !this.adminMode;
        const adminToggle = document.getElementById('adminToggle');
        const adminPanel = document.getElementById('adminPanel');
        const container = document.querySelector('.container');

        if (this.adminMode) {
            adminToggle.textContent = '退出管理';
            adminToggle.classList.add('active');
            adminPanel.style.display = 'block';
            // 鎭㈠绠＄悊鍛橀潰鏉夸綅缃?            this.restoreAdminPanelPosition();
            container.classList.add('admin-mode');
            this.enableAdminMode();
            this.buttonListEl = document.getElementById('buttonList');
            this.renderButtonList();
        } else {
            adminToggle.textContent = '管理员模式';
            adminToggle.classList.remove('active');
            adminPanel.style.display = 'none';
            container.classList.remove('admin-mode');
            this.disableAdminMode();
        }

        // 修复：切换面板显示状态会导致布局变化（主内容区域宽度改变导致图片缩放/位移），必须重算坐标
        // 使用 requestAnimationFrame 和 setTimeout 确保在 DOM 布局更新完成后执行
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.recalculateCoordinates();
                debugLog('管理员模式切换，坐标已重算');
            }, 100);
        });
    }

    // 鍒濆鍖栫鐞嗗憳闈㈡澘鎷栨嫿鑳藉姏
    initAdminPanelDrag() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        const handle = adminPanel.querySelector('.admin-drag-handle') || adminPanel.querySelector('h3') || adminPanel;

        const pointerDown = (e) => {
            // 浠呭湪闈㈡澘鍙鏃跺厑璁告嫋鍔?
                    if (adminPanel.style.display === 'none') return;

            // 浠呭厑璁稿乏閿?鍗曟寚
                    if (e.type === 'mousedown' && e.button !== 0) return;

            this.panelDrag.active = true;
            this.panelDrag.pointerId = e.pointerId || null;

            const rect = adminPanel.getBoundingClientRect();
            this.panelDrag.startLeft = rect.left;
            this.panelDrag.startTop = rect.top;
            this.panelDrag.startX = e.clientX;
            this.panelDrag.startY = e.clientY;

            // 鍒囨崲涓轰娇鐢╨eft/top杩涜瀹氫綅
            adminPanel.style.left = `${rect.left}px`;
            adminPanel.style.top = `${rect.top}px`;
            adminPanel.style.right = 'auto';
            adminPanel.style.bottom = 'auto';

            // 闃绘鏂囨湰閫変腑涓庢粴鍔ㄥ共鎵?            document.body.style.userSelect = 'none';
                    if (handle.setPointerCapture && e.pointerId != null) {
                try { handle.setPointerCapture(e.pointerId); } catch (_) {}
            }
            e.preventDefault();
        };

        const pointerMove = (e) => {
            if (!this.panelDrag.active) return;
            const dx = e.clientX - this.panelDrag.startX;
            const dy = e.clientY - this.panelDrag.startY;

            let newLeft = this.panelDrag.startLeft + dx;
            let newTop = this.panelDrag.startTop + dy;

            // 杈圭晫绾︽潫
            const maxLeft = Math.max(0, window.innerWidth - adminPanel.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - adminPanel.offsetHeight);
            newLeft = Math.min(Math.max(0, newLeft), maxLeft);
            newTop = Math.min(Math.max(0, newTop), maxTop);

            adminPanel.style.left = `${newLeft}px`;
            adminPanel.style.top = `${newTop}px`;
        };

        const pointerUp = (e) => {
            if (!this.panelDrag.active) return;
            this.panelDrag.active = false;
            document.body.style.userSelect = '';

            if (handle.releasePointerCapture && e.pointerId != null) {
                try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
            }

            // 淇濆瓨浣嶇疆
            const rect = adminPanel.getBoundingClientRect();
            const pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
            try { localStorage.setItem('adminPanelPos', JSON.stringify(pos)); } catch (_) {}
        };

        // 浼樺厛浣跨敤Pointer Events
                    if (window.PointerEvent) {
            handle.addEventListener('pointerdown', pointerDown);
            window.addEventListener('pointermove', pointerMove);
            window.addEventListener('pointerup', pointerUp);
            window.addEventListener('pointercancel', pointerUp);
        } else {
            // 鍥為€€鍒伴紶鏍?瑙︽懜
            handle.addEventListener('mousedown', pointerDown);
            window.addEventListener('mousemove', pointerMove);
            window.addEventListener('mouseup', pointerUp);
            handle.addEventListener('touchstart', (e) => pointerDown(e.touches[0]), { passive: false });
            window.addEventListener('touchmove', (e) => { pointerMove(e.touches[0]); e.preventDefault(); }, { passive: false });
            window.addEventListener('touchend', (e) => pointerUp(e.changedTouches[0]));
        }

        // 鍒濇鍔犺浇鏃跺皾璇曟仮澶嶄綅缃紙鍗充究鏈紑鍚鐞嗗憳妯″紡锛屼篃鍙厛璁剧疆浣嶇疆锛?        this.restoreAdminPanelPosition();
    }

    restoreAdminPanelPosition() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;
        try {
            const raw = localStorage.getItem('adminPanelPos');
            if (!raw) return;
            const pos = JSON.parse(raw);
            if (typeof pos.left === 'number' && typeof pos.top === 'number') {
                // 杈圭晫鏍℃锛岄伩鍏嶇獥鍙ｅ昂瀵稿彉鍖栧鑷撮潰鏉夸笉鍙
                const maxLeft = Math.max(0, window.innerWidth - adminPanel.offsetWidth);
                const maxTop = Math.max(0, window.innerHeight - adminPanel.offsetHeight);
                const left = Math.min(Math.max(0, pos.left), maxLeft);
                const top = Math.min(Math.max(0, pos.top), maxTop);
                adminPanel.style.left = `${left}px`;
                adminPanel.style.top = `${top}px`;
                adminPanel.style.right = 'auto';
                adminPanel.style.bottom = 'auto';
            }
        } catch (_) { /* 蹇界暐瑙ｆ瀽閿欒 */ }
    }

    enableAdminMode() {
        // 涓烘墍鏈夋寜閽坊鍔犵鐞嗗憳妯″紡鐨勪簨浠剁洃鍚櫒
        const buttons = document.querySelectorAll('.word-button');
        buttons.forEach(button => {
            button.addEventListener('click', this.handleAdminButtonClick.bind(this));
            button.addEventListener('mousedown', this.handleMouseDown.bind(this));
            // 鏂板锛氬弻鍑昏繘琛屾枃鏈唴鑱旂紪杈戯紙浠呯鐞嗗憳妯″紡锛?            button.addEventListener('dblclick', this.handleInlineEditDblClick.bind(this));
            this.addResizeHandles(button);
        });

        // 娣诲姞鍏ㄥ眬榧犳爣浜嬩欢
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    disableAdminMode() {
        // 绉婚櫎閫変腑鐘舵€?
                    if (this.selectedButton) {
            this.selectedButton.classList.remove('selected');
            this.removeResizeHandles(this.selectedButton);
            this.selectedButton = null;
        }

        // 鑻ュ瓨鍦ㄥ唴鑱旂紪杈戣緭鍏ユ锛岃繘琛屾竻鐞?
                    if (this.editingInput) {
        try { this.editingInput.remove(); } catch (_) {}
            this.editingInput = null;
            this.editingButton = null;
        }

        // 绉婚櫎鍏ㄥ眬榧犳爣浜嬩欢
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));

        // 娓呯┖缂栬緫琛ㄥ崟
        this.clearEditForm();
    }

    handleAdminButtonClick(event) {
        if (!this.adminMode) return;
        
        event.preventDefault();
        event.stopPropagation();

        // 绉婚櫎涔嬪墠閫変腑鐨勬寜閽?
                    if (this.selectedButton) {
            this.selectedButton.classList.remove('selected');
            this.removeResizeHandles(this.selectedButton);
        }

        // 閫変腑褰撳墠鎸夐挳
        this.selectedButton = event.target;
        this.selectedButton.classList.add('selected');
        this.addResizeHandles(this.selectedButton);

        // 濉厖缂栬緫琛ㄥ崟
        this.fillEditForm(this.selectedButton);
    }

    /**
     * 绠＄悊鍛樻ā寮忥細鍙屽嚮鎸夐挳杩涘叆鍐呰仈鏂囨湰缂栬緫
     * 涓枃娉ㄩ噴锛氬綋绠＄悊鍛樺弻鍑诲凡鏈夌殑鍗曡瘝鎸夐挳鏃讹紝鍦ㄦ寜閽唴閮ㄧ敓鎴愪竴涓緭鍏ユ锛?     * 鍏佽鐩存帴淇敼鏂囨湰鍐呭銆傛寜 Enter 鎴栧け鐒︿繚瀛橈紝ESC 鍙栨秷銆?     */
    handleInlineEditDblClick(event) {
        if (!this.adminMode) return;
        event.preventDefault();
        event.stopPropagation();

        const button = event.currentTarget;

        // 如果标签处于隐藏状态，提示并停止内联文本编辑（避免看不见文案导致误操作）
                    if (!this.showLabels) {
            this.showError('当前标签隐藏，无法进行内联文本编辑。请先点击“显示/隐藏标签”显示标签。');
            return;
        }

        // 姝ｅ湪缂栬緫鍏朵粬鎸夐挳锛屽厛缁撴潫涔嬪墠鐨勭紪杈?
                    if (this.editingInput && this.editingButton) {
            this.commitInlineEdit(this.editingButton, this.editingInput.value);
        }

        this.startInlineEdit(button);
    }

    /**
     * 涓枃娉ㄩ噴锛氬紑濮嬪鎸囧畾鎸夐挳杩涜鍐呰仈缂栬緫锛屽垱寤鸿緭鍏ユ骞惰仛鐒︺€?     */
    startInlineEdit(button) {
        // 璁板綍閫変腑鐘舵€侊紝鏂逛究鍚屾缂栬緫琛ㄥ崟瀛楁
        this.selectedButton = button;
        this.selectedButton.classList.add('selected');

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-edit-input';

        // 初始值：按钮当前文本；若为空则使用数据中的单词
        const idx = parseInt(button.dataset.index);
        const currentWord = (button.textContent || '').trim() || (this.wordsData[idx] && this.wordsData[idx].word) || '';
        input.value = currentWord;

        // 娓呯┖鎸夐挳鏂囨湰骞舵彃鍏ヨ緭鍏ユ
        button.textContent = '';
        button.appendChild(input);

        // 记录当前编辑状态
        this.editingInput = input;
        this.editingButton = button;

        // 浜嬩欢锛氶樆姝㈣緭鍏ユ浜嬩欢鍐掓场褰卞搷鎾斁/鎷栨嫿
        const stop = (e) => { e.stopPropagation(); };
        input.addEventListener('click', stop);
        input.addEventListener('mousedown', stop);
        input.addEventListener('dblclick', stop);

        // 事件：按键处理（Enter 提交，Esc 取消）
        input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                e.preventDefault();
                this.commitInlineEdit(button, input.value);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelInlineEdit(button, currentWord);
            }
        });

        // 事件：失焦自动提交
        input.addEventListener('blur', () => {
            // 如果仍处于该按钮的编辑状态，则提交
            if (this.editingButton === button) {
                this.commitInlineEdit(button, input.value);
            }
        });

        // 聚焦并选中文本，便于快速编辑
        input.focus();
        try { input.select(); } catch (_) {}

        // 鍚屾缂栬緫琛ㄥ崟锛堝彸渚ч潰鏉匡級鏂囨湰瀛楁
        const editWordInput = document.getElementById('editWord');
        if (editWordInput) editWordInput.value = currentWord;
    }

    /**
     * 涓枃娉ㄩ噴锛氭彁浜ゅ唴鑱旂紪杈戠粨鏋滐紝鏇存柊鎸夐挳鏂囨湰涓庡搴旂殑 wordsData锛屽苟娓呯悊杈撳叆妗嗐€?     */
    commitInlineEdit(button, newTextRaw) {
        const newText = String(newTextRaw || '').trim();
        const idx = parseInt(button.dataset.index);

        // 娓呯悊缂栬緫鐘舵€?
                    if (this.editingInput) {
        try { this.editingInput.remove(); } catch (_) {}
        }
        this.editingInput = null;
        this.editingButton = null;

        if (!newText) {
            this.showError('单词不能为空');
            // 鎭㈠鍘熸枃鏈樉绀猴紙鑻ュ瓨鍦級
            const original = (this.wordsData[idx] && this.wordsData[idx].word) || '';
            button.textContent = original;
            return;
        }

        // 鏇存柊鎸夐挳鏂囨湰
        button.textContent = newText;

        // 鏇存柊鏁版嵁妯″瀷锛岀‘淇濅繚瀛樻椂鑳芥寔涔呭寲鍒?localStorage
                    if (!isNaN(idx) && idx >= 0 && idx < this.wordsData.length) {
            this.wordsData[idx].word = newText;
        }

        // 鏇存柊鍙充晶缂栬緫琛ㄥ崟瀛楁
        const editWordInput = document.getElementById('editWord');
        if (editWordInput) editWordInput.value = newText;

        // 缁欎簣鎴愬姛鎻愮ず锛屼絾涓嶈嚜鍔ㄤ繚瀛橈紙閬靛惊鐜版湁鈥滀繚瀛樹慨鏀光€濇祦绋嬶級
        this.showError('文本已更新（请点击“保存修改”以持久化）', 'success');
    }

    /**
     * 涓枃娉ㄩ噴锛氬彇娑堝唴鑱旂紪杈戯紝鎭㈠鍘熸枃鏈€?     */
    cancelInlineEdit(button, originalText) {
        if (this.editingInput) {
            try { this.editingInput.remove(); } catch (_) {}
        }
        this.editingInput = null;
        this.editingButton = null;
        button.textContent = originalText || '';
        this.showError('已取消文本编辑', 'success');
    }

    handleMouseDown(event) {
        if (!this.adminMode || !this.selectedButton) return;

        const rect = this.selectedButton.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 妫€鏌ユ槸鍚︾偣鍑诲湪璋冩暣澶у皬鐨勬帶鍒剁偣涓?
                    if (this.isOnResizeHandle(x, y, rect.width, rect.height)) {
            this.isResizing = true;
            this.isDragging = false;
        } else {
            this.isDragging = true;
            this.isResizing = false;
        }

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        
        // 淇濆瓨鍘熷鏁版嵁
        this.originalButtonData = {
            left: this.selectedButton.style.left,
            top: this.selectedButton.style.top,
            width: this.selectedButton.style.width,
            height: this.selectedButton.style.height
        };

        event.preventDefault();
    }

    handleMouseMove(event) {
        if (!this.adminMode || !this.selectedButton) return;

        if (this.isDragging) {
            const deltaX = event.clientX - this.dragStartX;
            const deltaY = event.clientY - this.dragStartY;

            const currentLeft = parseInt(this.selectedButton.style.left) || 0;
            const currentTop = parseInt(this.selectedButton.style.top) || 0;

            this.selectedButton.style.left = (currentLeft + deltaX) + 'px';
            this.selectedButton.style.top = (currentTop + deltaY) + 'px';

            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;

            this.updateWordDataFromButton(this.selectedButton);
        } else if (this.isResizing) {
            const deltaX = event.clientX - this.dragStartX;
            const deltaY = event.clientY - this.dragStartY;

            const currentWidth = parseInt(this.selectedButton.style.width) || this.selectedButton.offsetWidth;
            const currentHeight = parseInt(this.selectedButton.style.height) || this.selectedButton.offsetHeight;

            const newWidth = Math.max(20, currentWidth + deltaX);
            const newHeight = Math.max(15, currentHeight + deltaY);

            this.selectedButton.style.width = newWidth + 'px';
            this.selectedButton.style.height = newHeight + 'px';

            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;

            this.updateResizeHandles(this.selectedButton);
            this.updateWordDataFromButton(this.selectedButton);
        }
    }

    updateWordDataFromButton(button) {
        const index = parseInt(button.dataset.index);
        if (index >= 0 && index < this.wordsData.length) {
            const pixelX = parseInt(button.style.left) || 0;
            const pixelY = parseInt(button.style.top) || 0;
            const pixelWidth = parseInt(button.style.width) || button.offsetWidth;
            const pixelHeight = parseInt(button.style.height) || button.offsetHeight;
            
            const pdfCoords = this.convertPixelToPDFCoordinates(pixelX, pixelY, pixelWidth, pixelHeight);
            
            this.wordsData[index].x0 = pdfCoords.x0;
            this.wordsData[index].y0 = pdfCoords.y0;
            this.wordsData[index].width = pdfCoords.width;
            this.wordsData[index].height = pdfCoords.height;
        }
    }

    handleMouseUp(event) {
        if (!this.adminMode) return;

        this.isDragging = false;
        this.isResizing = false;

        // 濡傛灉鏈夐€変腑鐨勬寜閽紝鏇存柊缂栬緫琛ㄥ崟
                    if (this.selectedButton) {
            this.fillEditForm(this.selectedButton);
        }
    }

    addResizeHandles(button) {
        // 绉婚櫎宸插瓨鍦ㄧ殑鎺у埗鐐?        this.removeResizeHandles(button);

        const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.dataset.position = position;
            button.appendChild(handle);
        });
    }

    removeResizeHandles(button) {
        const handles = button.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
    }

    updateResizeHandles(button) {
        // 璋冩暣澶у皬鎺у埗鐐逛細鑷姩鏍规嵁CSS瀹氫綅鏇存柊
    }

    isOnResizeHandle(x, y, width, height) {
        const handleSize = 8;
        const margin = 4;

        // 妫€鏌ュ洓涓鐨勬帶鍒剁偣
        const corners = [
            { x: -margin, y: -margin }, // top-left
            { x: width + margin - handleSize, y: -margin }, // top-right
            { x: -margin, y: height + margin - handleSize }, // bottom-left
            { x: width + margin - handleSize, y: height + margin - handleSize } // bottom-right
        ];

        return corners.some(corner => 
            x >= corner.x && x <= corner.x + handleSize &&
            y >= corner.y && y <= corner.y + handleSize
        );
    }

    fillEditForm(button) {
        const wordData = this.getWordDataFromButton(button);
        if (!wordData) return;

        document.getElementById('editWord').value = wordData.word || '';
        document.getElementById('editAudio').value = wordData.audio || '';
        document.getElementById('editWidth').value = parseInt(button.style.width) || button.offsetWidth;
        document.getElementById('editHeight').value = parseInt(button.style.height) || button.offsetHeight;
    }

    clearEditForm() {
        document.getElementById('editWord').value = '';
        document.getElementById('editAudio').value = '';
        document.getElementById('editWidth').value = '';
        document.getElementById('editHeight').value = '';
    }

    getWordDataFromButton(button) {
        const index = parseInt(button.dataset.index);
        return this.wordsData[index];
    }

    applyEdit() {
        if (!this.selectedButton) {
            this.showError('请先选择一个按钮');
            return;
        }

        const newWord = document.getElementById('editWord').value.trim();
        const newAudio = document.getElementById('editAudio').value.trim();
        const newWidth = parseInt(document.getElementById('editWidth').value);
        const newHeight = parseInt(document.getElementById('editHeight').value);

        if (!newWord) {
            this.showError('单词不能为空');
            return;
        }

        // 鏇存柊鎸夐挳鏄剧ず
        this.selectedButton.textContent = newWord;
        if (newWidth > 0) this.selectedButton.style.width = newWidth + 'px';
        if (newHeight > 0) this.selectedButton.style.height = newHeight + 'px';

        // 鏇存柊鏁版嵁
        const wordData = this.getWordDataFromButton(this.selectedButton);
        if (wordData) {
            wordData.word = newWord;
            if (newAudio) wordData.audio = newAudio;
        }

        this.showError('修改已应用', 'success');
    }

    cancelEdit() {
        if (!this.selectedButton) return;

        // 鎭㈠鍘熷鏁版嵁
                    if (this.originalButtonData.left) this.selectedButton.style.left = this.originalButtonData.left;
        if (this.originalButtonData.top) this.selectedButton.style.top = this.originalButtonData.top;
        if (this.originalButtonData.width) this.selectedButton.style.width = this.originalButtonData.width;
        if (this.originalButtonData.height) this.selectedButton.style.height = this.originalButtonData.height;

        this.clearEditForm();
        this.showError('已取消修改', 'success');
    }

    // 鏂板鎸夐挳鍔熻兘
    addNewButton() {
        if (!this.adminMode) {
            this.showError('请先进入管理员模式');
            return;
        }

        const newWord = document.getElementById('newWord').value.trim();
        let newAudio = document.getElementById('newAudio').value.trim();
        const selectedAudio = document.getElementById('newAudioSelect').value.trim();
        const newWidth = parseInt(document.getElementById('newWidth').value) || 80;
        const newHeight = parseInt(document.getElementById('newHeight').value) || 30;
        const newX = parseInt(document.getElementById('newX').value) || 100;
        const newY = parseInt(document.getElementById('newY').value) || 100;

        if (!newWord) {
            this.showError('单词文本不能为空');
            return;
        }

        // 浼樺厛浣跨敤涓嬫媺妗嗛€夋嫨鐨勯煶棰戞枃浠讹紝濡傛灉娌℃湁閫夋嫨鍒欎娇鐢ㄦ墜鍔ㄨ緭鍏ョ殑
                    if (selectedAudio) {
            // 濡傛灉閫夋嫨浜嗕笅鎷夋涓殑闊抽鏂囦欢锛屼娇鐢ㄥ畬鏁磋矾寰?            newAudio = selectedAudio;
        } else if (!newAudio) {
            // 濡傛灉鏃㈡病鏈夐€夋嫨涔熸病鏈夋墜鍔ㄨ緭鍏ワ紝缁欏嚭鎻愮ず
            debugLog('未指定音频文件，将使用默认音频查找策略');
        }

        // 灏嗗儚绱犲潗鏍囪浆鎹负PDF鍧愭爣
        const pdfCoords = this.convertPixelToPDFCoordinates(newX, newY, newWidth, newHeight);

        // 鍒涘缓鏂扮殑鍗曡瘝鏁版嵁
        const newWordData = {
            word: newWord,
            x0: pdfCoords.x0,
            y0: pdfCoords.y0,
            x1: pdfCoords.x0 + pdfCoords.width,
            y1: pdfCoords.y0 + pdfCoords.height,
            width: pdfCoords.width,
            height: pdfCoords.height,
            font_size: 8.75,
            section: "custom",
            number: this.wordsData.length + 1,
            is_title: false,
            audio: newAudio || null
        };

        // 添加到数据数组
        this.wordsData.push(newWordData);
        this.totalWords = this.wordsData.length;
        try {
            const pageKey = 'page_' + this.pageConfig.pageNumber + '_data';
            localStorage.setItem(pageKey, JSON.stringify(this.wordsData));
        } catch (e) {
            console.warn('持久化新增按钮到本地存储失败:', e);
        }

        // 重建全部按钮，确保新增项参与后续坐标与索引逻辑（管理员模式下不去重）
        this.createWordButtons();
        if (!this.showButtons) {
            this.showButtons = true;
            const tBtn = document.getElementById('toggleButtons');
            if (tBtn) tBtn.textContent = '隐藏按钮';
            Array.from(this.wordButtons.querySelectorAll('.word-button')).forEach(b => b.classList.remove('hidden'));
        }
        this.recalculateCoordinates();
        this.updateStats();

        // 娓呯┖琛ㄥ崟
        this.clearAddForm();
        this.renderButtonList();

        const audioInfo = newAudio ? `（音频：${newAudio}）` : '';
        this.showError(`成功添加新按钮 ${newWord}${audioInfo}`, 'success');
        debugLog('新增按钮数据:', newWordData);
    }

    clearAddForm() {
        document.getElementById('newWord').value = '';
        document.getElementById('newAudio').value = '';
        document.getElementById('newAudioSelect').value = '';
        document.getElementById('newWidth').value = '80';
        document.getElementById('newHeight').value = '30';
        document.getElementById('newX').value = '100';
        document.getElementById('newY').value = '100';
    }

    renderButtonList() {
        if (!this.buttonListEl) this.buttonListEl = document.getElementById('buttonList');
        const el = this.buttonListEl;
        if (!el) return;
        const rows = this.wordsData.map((w, idx) => {
            const audio = w.audio ? w.audio : '-';
            const hidden = this.wordButtons.querySelector(`.word-button[data-index="${idx}"]`)?.classList.contains('hidden') ? '隐藏' : '显示';
            return `<div class="bl-item" data-idx="${idx}">
                <span class="bl-index">${idx + 1}</span>
                <span class="bl-word">${w.word}</span>
                <span class="bl-audio">${audio}</span>
                <span class="bl-state">${hidden}</span>
                <button class="bl-action" data-action="highlight">定位</button>
                <button class="bl-action" data-action="play">播放</button>
                <button class="bl-action" data-action="toggle">显示/隐藏</button>
            </div>`;
        }).join('');
        el.innerHTML = rows || '<p>当前无按钮</p>';
        el.querySelectorAll('.bl-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const parent = btn.closest('.bl-item');
                const idx = parseInt(parent.getAttribute('data-idx'), 10);
                const wordData = this.wordsData[idx];
                const domBtn = this.wordButtons.querySelector(`.word-button[data-index="${idx}"]`);
                if (!wordData) return;
                if (action === 'highlight') {
                    if (domBtn) {
                        this.selectedButton && this.selectedButton.classList.remove('selected');
                        this.selectedButton = domBtn;
                        domBtn.classList.add('selected');
                        domBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        this.fillEditForm(domBtn);
                    }
                } else if (action === 'play') {
                    this.playWordAndWait(wordData, idx);
                } else if (action === 'toggle') {
                    if (domBtn) {
                        domBtn.classList.toggle('hidden');
                        this.renderButtonList();
                    }
                }
            });
        });
    }

    // 加载当前页面可用的音频文件列表
    async loadAvailableAudioFiles() {
        const audioSelect = document.getElementById('newAudioSelect');
        if (!audioSelect) return;

        // 娓呯┖鐜版湁閫夐」
        audioSelect.innerHTML = '<option value="">-- 选择音频文件 --</option>';

        try {
            // 获取当前页面的章节列表，若无则尝试解析 all_sounds 目录（防止 sections 未定义导致报错）
            const pageSections = Array.isArray(this.pageConfig.sections)
                ? this.pageConfig.sections
                : (this.pageConfig && this.pageConfig.primarySection ? [this.pageConfig.primarySection] : []);

            const sectionsToUse = (pageSections && pageSections.length > 0)
                ? pageSections
                : (await this.getAllSections());

            const allAudioFiles = new Set(); // 使用 Set 避免重复

            // 为每个章节获取音频文件
            for (const section of sectionsToUse) {
                const audioFiles = await this.getAudioFilesInSection(section);
                audioFiles.forEach(file => {
                    // 添加章节前缀以区分不同章节的文件
                    allAudioFiles.add(`${section}/${file}`);
                });
            }

            // 将音频文件添加到下拉框
            const sortedFiles = Array.from(allAudioFiles).sort();
            sortedFiles.forEach(filePath => {
                const option = document.createElement('option');
                option.value = filePath;
                option.textContent = filePath;
                audioSelect.appendChild(option);
            });

            debugLog(`已加载 ${sortedFiles.length} 个音频文件到选择器（章节源：${(sectionsToUse||[]).join(', ')}）`);
        } catch (error) {
            console.error('加载音频文件列表失败:', error);
            // 添加错误提示选项
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = '-- 加载失败，请手动输入 --';
            audioSelect.appendChild(errorOption);
        }
    }

    // 鍒锋柊闊抽鏂囦欢鍒楄〃
    refreshAudioList() {
        this.loadAvailableAudioFiles();
    }

    // 切换删除模式
    // 说明：
    // - 开启后：按钮将高亮提示为“可删除”，单击任意词条按钮即可删除。
    // - 关闭后：恢复正常状态，按钮不可直接删除。
    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        const toggleButton = document.getElementById('toggleDeleteMode');

        if (this.deleteMode) {
            // 开启删除模式
            toggleButton.textContent = '退出删除模式';
            toggleButton.classList.add('delete-mode-active');
            this.showError('删除模式已启用：单击任意词条按钮可删除；再次点击上方“退出删除模式”按钮可关闭。', 'success');

            // 为所有按钮添加删除模式样式
            document.querySelectorAll('.word-button').forEach(button => {
                button.classList.add('delete-mode');
            });
        } else {
            // 关闭删除模式
            toggleButton.textContent = '启用删除模式';
            toggleButton.classList.remove('delete-mode-active');
            this.showError('删除模式已关闭', 'success');

            // 移除所有按钮的删除模式样式
            document.querySelectorAll('.word-button').forEach(button => {
                button.classList.remove('delete-mode');
            });
        }
    }

    // 删除按钮
    // 参数：index - 目标按钮在 this.wordsData 中的索引
    // 逻辑：
    // 1) 弹窗确认（包含词条名称以便确认）；
    // 2) 从数据中移除并重建按钮；
    // 3) 若仍处于删除模式且仍有按钮，维持删除样式；
    // 4) 若当前页按钮已全部删除，则自动退出删除模式（修复原逻辑错误）。
    deleteButton(index) {
        const targetWord = this.wordsData[index]?.word || `索引 ${index}`;
        if (confirm(`确定要删除“${targetWord}”这个按钮吗？`)) {
            // 从数据数组中移除
            this.wordsData.splice(index, 1);

            // 重新创建所有按钮
            this.createWordButtons();
            // 删除后立刻重算坐标，避免出现左上角定位问题
            this.recalculateCoordinates();

            // 如果仍在删除模式：
            if (this.deleteMode) {
                if (this.wordsData.length > 0) {
                    // 为新创建的按钮维持删除模式样式
                    document.querySelectorAll('.word-button').forEach(button => {
                        button.classList.add('delete-mode');
                    });
                } else {
                    // 若已无按钮，则自动退出删除模式（从 true 切回 false）
                    this.toggleDeleteMode();
                }
            }

            // 更新统计信息
            this.updateStats();

            // 成功提示（包含词条名称）
            this.showError(`已删除按钮：“${targetWord}”`, 'success');
        }
    }

    saveChanges() {
        // 收集当前页面全部已修改的按钮数据（像素坐标 → PDF 坐标）
        const modifiedData = this.wordsData.map((wordData, index) => {
            const button = this.wordButtons.querySelector(`.word-button[data-index="${index}"]`);
            
            // 仅当按钮存在且可见时，才从 DOM 更新坐标
            // 如果按钮被隐藏（例如被章节过滤或全局隐藏），getBoundingClientRect() 会返回 0，导致数据损坏
            if (button && !button.classList.contains('hidden') && button.style.display !== 'none') {
                // 使用布局矩形获取相对像素坐标，避免 style.left/top 为空导致 0 值
                const rect = button.getBoundingClientRect();
                // 再次检查 rect 是否有效，避免意外情况
                if (rect.width > 0 && rect.height > 0) {
                    const containerRect = this.wordButtons.getBoundingClientRect();
                    const pixelX = rect.left - containerRect.left;
                    const pixelY = rect.top - containerRect.top;
                    const pixelWidth = rect.width;
                    const pixelHeight = rect.height;

                    // 转换为 PDF 坐标
                    const pdfCoords = this.convertPixelToPDFCoordinates(pixelX, pixelY, pixelWidth, pixelHeight);

                    return {
                        ...wordData,
                        x0: pdfCoords.x0,
                        y0: pdfCoords.y0,
                        x1: pdfCoords.x0 + pdfCoords.width,
                        y1: pdfCoords.y0 + pdfCoords.height,
                        width: pdfCoords.width,
                        height: pdfCoords.height
                    };
                }
            }
            // 如果按钮不存在、隐藏或尺寸无效，则保留原始数据（假设未被修改）
            return wordData;
        });

        // 此处应发送到服务端存储，当前仅用于演示（写入 localStorage）
        debugLog('准备保存的数据（当前页）:', modifiedData);
        
        // 实际保存到本地存储，作为回滚参考
        try {
            const pageKey = `page_${this.pageConfig.pageNumber}_data`;
            localStorage.setItem(pageKey, JSON.stringify(modifiedData));
            this.showError(`修改已保存到本地存储（键：${pageKey}），共 ${modifiedData.length} 项。`, 'success');
            // 保存后用最新数据刷新内存与坐标，防止后续渲染使用旧坐标
            this.wordsData = modifiedData;
            this.createWordButtons();
            // 恢复正确的可见性状态（章节过滤）
            this.updateButtonVisibility();
        } catch (error) {
            console.error('保存到本地存储失败:', error);
            this.showError('保存失败：' + error.message + '。请检查浏览器隐私设置或存储空间。', 'error');
        }
    }

    resetChanges() {
        const pageKey = `page_${this.pageConfig.pageNumber}_data`;
        const hasSaved = !!localStorage.getItem(pageKey);
        if (confirm(`确定要重置当前页面的所有修改吗？\n这将清除本地存储（键：${pageKey}）并恢复到初始数据。`)) {
            try {
                localStorage.removeItem(pageKey);
                this.showError(hasSaved ? '已清除本地保存的修改，正在刷新页面…' : '当前无本地保存的修改，正在刷新页面…', 'success');
            } catch (e) {
                console.warn('清理本地存储时出现问题：', e);
            }
            // 刷新页面以重新加载初始数据
            location.reload();
        }
    }

    // 导出JSON文件到本地下载
    exportJSON() {
        try {
            // 1. 获取最新数据（复用 saveChanges 的逻辑，确保坐标是最新的）
            const exportData = this.wordsData.map((wordData, index) => {
                const button = this.wordButtons.querySelector(`.word-button[data-index="${index}"]`);
                
                // 仅当按钮存在且可见时，才从 DOM 更新坐标
                if (button && !button.classList.contains('hidden') && button.style.display !== 'none') {
                    const rect = button.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        const containerRect = this.wordButtons.getBoundingClientRect();
                        const pixelX = rect.left - containerRect.left;
                        const pixelY = rect.top - containerRect.top;
                        const pixelWidth = rect.width;
                        const pixelHeight = rect.height;

                        // 转换为 PDF 坐标
                        const pdfCoords = this.convertPixelToPDFCoordinates(pixelX, pixelY, pixelWidth, pixelHeight);

                        // 保留原始字段并更新坐标
                        return {
                            ...wordData,
                            x0: parseFloat(pdfCoords.x0.toFixed(2)),
                            y0: parseFloat(pdfCoords.y0.toFixed(2)),
                            // x1/y1 根据 width/height 重新计算
                            x1: parseFloat((pdfCoords.x0 + pdfCoords.width).toFixed(2)),
                            y1: parseFloat((pdfCoords.y0 + pdfCoords.height).toFixed(2)),
                            width: parseFloat(pdfCoords.width.toFixed(2)),
                            height: parseFloat(pdfCoords.height.toFixed(2))
                        };
                    }
                }
                // 如果按钮不可见，直接使用现有数据（保留原始精度）
                return wordData;
            });

            // 2. 移除内部使用的临时字段（如 _dataIndex, originalIndex 等）
            const cleanData = exportData.map(item => {
                const { _dataIndex, originalIndex, ...rest } = item;
                return rest;
            });

            // 3. 生成文件名
            const fileName = `extracted_words_page${this.pageConfig.pageNumber}.json`;

            // 4. 创建 Blob 并下载
            const jsonStr = JSON.stringify(cleanData, null, 2); // 格式化缩进为2空格
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showError(`已导出JSON文件：${fileName}，请保存到 extracted_words_fix 目录`, 'success');
            
        } catch (error) {
            console.error('导出JSON失败:', error);
            this.showError('导出失败：' + error.message, 'error');
        }
    }

    // 测试模式相关方法
    initTestMode() {
        this.testModal.style.display = 'flex';
        this.testSetup.style.display = 'block';
        this.testResult.style.display = 'none';

        const typeSelect = document.getElementById('testTypeSelect');
        if (typeSelect) {
            const updateTitle = () => {
                const titleEl = document.getElementById('testModalTitle');
                if (!titleEl) return;
                if (typeSelect.value === 'picture_choice') {
                    titleEl.textContent = '单词测试（看图识词）';
                } else {
                    titleEl.textContent = '单词测试（听音辨位）';
                }
            };
            typeSelect.onchange = updateTitle;
            updateTitle();
        }
        
        // 1. 获取并去重章节列表
        const sections = new Set();
        (this.filteredWords || this.wordsData).forEach(w => {
            if (w.section && w.section !== 'custom') {
                sections.add(w.section);
            }
        });
        
        // 2. 填充章节选择下拉框
        const sectionSelect = document.getElementById('testSectionSelect');
        if (sectionSelect) {
            sectionSelect.innerHTML = '<option value="all">整页测试 (所有章节)</option>';
            
            // 排序章节（例如 1.1, 1.2, ...）
            const sortedSections = Array.from(sections).sort((a, b) => {
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
            
            sortedSections.forEach(sec => {
                const option = document.createElement('option');
                option.value = sec;
                option.textContent = `章节 ${sec}`;
                sectionSelect.appendChild(option);
            });
            
            // 监听章节变化，动态更新最大题目数量
            sectionSelect.onchange = () => {
                this.updateMaxTestCount(sectionSelect.value);
            };
        }
        
        // 初始化最大值（默认为 'all'）
        this.updateMaxTestCount('all');
    }
    
    // 根据选中的章节更新最大题目数量
    updateMaxTestCount(section) {
        let count = 0;
        const input = document.getElementById('testCountInput');
        
        if (section === 'all') {
            count = (this.filteredWords || this.wordsData).filter(w => !w.is_title).length;
        } else {
            count = (this.filteredWords || this.wordsData).filter(w => !w.is_title && w.section === section).length;
        }
        
        if (input) {
            input.max = count;
            input.value = Math.min(10, count);
            // 如果该章节题目极少（例如少于10个），直接设为总数
            if (count < 10) input.value = count;
        }
    }

    startTest(count, testType = 'listen_click') {
        this.testMode = true;
        this.testType = testType || 'listen_click';
        this.testModal.style.display = 'none';

        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }

        const sectionSelect = document.getElementById('testSectionSelect');
        const selectedSection = sectionSelect ? sectionSelect.value : 'all';

        const validWords = (this.filteredWords || this.wordsData).filter(w => {
            const isWord = !w.is_title;
            const isSectionMatch = selectedSection === 'all' || w.section === selectedSection;
            return isWord && isSectionMatch;
        });

        if (validWords.length === 0) {
            this.showError('该章节没有可测试的单词', 'error');
            this.endTestMode();
            return;
        }

        const shuffled = this.shuffleArray([...validWords]);
        this.testQueue = shuffled.slice(0, Math.min(count, validWords.length));
        this.currentTestIndex = 0;
        this.testResults = { correct: 0, wrong: 0, wrongDetails: [], answerDetails: [] };
        this.pendingSrsReviews.clear();
        if (this.srsFeedbackContainer) this.srsFeedbackContainer.style.display = 'none';
        if (this.srsFeedbackList) this.srsFeedbackList.innerHTML = '';

        this.showLabels = false;
        this.activeSection = null;
        this.showButtons = true;
        this.updateButtonVisibility();
        this.updateButtonLabels();

        if (this.testType === 'picture_choice') {
            this.startPictureChoiceTest(validWords);
        } else {
            this.hidePictureChoiceUI();
            this.playNextTestAudio();
        }
    }

    startPictureChoiceTest(validWordsPool) {
        this.pictureChoicePool = Array.isArray(validWordsPool) ? validWordsPool : (this.filteredWords || this.wordsData);
        this.pictureQuizLocked = false;
        this.showPictureChoiceUI();
        this.showNextPictureChoiceQuestion();
    }

    showPictureChoiceUI() {
        if (this.pictureQuizPanel) this.pictureQuizPanel.style.display = 'block';
        if (this.pictureQuizHighlight) this.pictureQuizHighlight.style.display = 'block';
        this.clampAndRestorePictureQuizPanelPosition();
    }

    hidePictureChoiceUI() {
        if (this.pictureQuizPanel) this.pictureQuizPanel.style.display = 'none';
        if (this.pictureQuizHighlight) {
            this.pictureQuizHighlight.style.display = 'none';
            this.pictureQuizHighlight.classList.remove('correct', 'wrong');
        }
        if (this.pictureQuizOptions) this.pictureQuizOptions.innerHTML = '';
        if (this.pictureQuizProgress) this.pictureQuizProgress.textContent = '';
        this.pictureQuizLocked = false;
    }

    showNextPictureChoiceQuestion() {
        if (this.currentTestIndex >= this.testQueue.length) {
            this.finishTest();
            return;
        }

        const targetWord = this.testQueue[this.currentTestIndex];
        this.renderPictureChoiceQuestion(targetWord);

        const options = this.buildMultipleChoiceOptions(targetWord, this.pictureChoicePool);
        this.renderPictureChoiceOptions(targetWord, options);

        if (this.pictureQuizProgress) {
            this.pictureQuizProgress.textContent = `进度：${this.currentTestIndex + 1} / ${this.testQueue.length}`;
        }
    }

    renderPictureChoiceQuestion(wordData) {
        if (!this.pictureQuizHighlight) return;

        this.pictureQuizHighlight.classList.remove('correct', 'wrong');

        const x = wordData.x0 * this.scaleX + this.offsetX;
        const y = wordData.y0 * this.scaleY + this.offsetY;
        const width = wordData.width * this.scaleX;
        const height = wordData.height * this.scaleY;

        this.pictureQuizHighlight.style.left = x + 'px';
        this.pictureQuizHighlight.style.top = y + 'px';
        this.pictureQuizHighlight.style.width = Math.max(width, 30) + 'px';
        this.pictureQuizHighlight.style.height = Math.max(height, 20) + 'px';
    }

    buildMultipleChoiceOptions(targetWord, pool) {
        const targetText = (targetWord.word || '').toLowerCase();
        const candidates = (Array.isArray(pool) ? pool : []).filter(w => {
            if (!w || w.is_title) return false;
            const text = (w.word || '').toLowerCase();
            return text && text !== targetText;
        });

        const uniqueMap = new Map();
        candidates.forEach(w => {
            const key = (w.word || '').toLowerCase();
            if (!uniqueMap.has(key)) uniqueMap.set(key, w);
        });

        const uniqueCandidates = Array.from(uniqueMap.values());
        const shuffled = this.shuffleArray(uniqueCandidates);
        const picks = shuffled.slice(0, 3).map(w => w.word);

        const options = [targetWord.word, ...picks].filter(Boolean);
        while (options.length < 4) {
            options.push(targetWord.word);
        }

        const distinct = Array.from(new Set(options.map(w => String(w))));
        if (distinct.length < 4) {
            const fallback = this.shuffleArray((this.filteredWords || this.wordsData).filter(w => w && !w.is_title && w.word && w.word.toLowerCase() !== targetText));
            for (const w of fallback) {
                if (distinct.length >= 4) break;
                const ww = String(w.word);
                if (!distinct.includes(ww)) distinct.push(ww);
            }
        }

        const finalOptions = distinct.slice(0, 4);
        while (finalOptions.length < 4) {
            finalOptions.push(String(targetWord.word || ''));
        }

        return this.shuffleArray(finalOptions);
    }

    renderPictureChoiceOptions(targetWord, options) {
        if (!this.pictureQuizOptions) return;
        this.pictureQuizOptions.innerHTML = '';
        this.pictureQuizLocked = false;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'picture-quiz-option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                this.handlePictureChoiceAnswer(targetWord, opt, btn);
            });
            this.pictureQuizOptions.appendChild(btn);
        });
    }

    handlePictureChoiceAnswer(targetWord, selectedText, selectedButtonEl) {
        if (this.pictureQuizLocked) return;
        this.pictureQuizLocked = true;

        const isCorrect = String(selectedText).toLowerCase() === String(targetWord.word).toLowerCase();
        const optionButtons = this.pictureQuizOptions ? Array.from(this.pictureQuizOptions.querySelectorAll('button')) : [];

        if (isCorrect) {
            this.testResults.correct++;
            if (selectedButtonEl) selectedButtonEl.classList.add('correct');
            if (this.pictureQuizHighlight) this.pictureQuizHighlight.classList.add('correct');
        } else {
            this.testResults.wrong++;
            this.testResults.wrongDetails.push({
                target: targetWord.word,
                clicked: selectedText,
                type: 'picture_choice'
            });

            if (selectedButtonEl) selectedButtonEl.classList.add('wrong');
            if (this.pictureQuizHighlight) this.pictureQuizHighlight.classList.add('wrong');

            optionButtons.forEach(btn => {
                if (btn.textContent && btn.textContent.toLowerCase() === String(targetWord.word).toLowerCase()) {
                    btn.classList.add('correct');
                }
            });
        }

        if (!this.testResults.answerDetails) this.testResults.answerDetails = [];
        this.testResults.answerDetails.push({
            target: targetWord.word,
            clicked: selectedText,
            isCorrect: isCorrect,
            type: 'picture_choice'
        });

        optionButtons.forEach(btn => {
            btn.disabled = true;
        });

        if (this.testTimer) clearTimeout(this.testTimer);
        this.testTimer = setTimeout(() => {
            this.currentTestIndex++;
            this.showNextPictureChoiceQuestion();
        }, 900);
    }
    
    playNextTestAudio() {
        if (this.currentTestIndex >= this.testQueue.length) {
            this.finishTest();
            return;
        }
        
        const currentWord = this.testQueue[this.currentTestIndex];
        debugLog(`测试进度: ${this.currentTestIndex + 1}/${this.testQueue.length}, 目标: ${currentWord.word}`);
        
        // 查找原始索引
        const originalIndex = currentWord.originalIndex !== undefined ? currentWord.originalIndex : currentWord._dataIndex;
        
        this.playWord(currentWord, originalIndex);
    }
    
    handleTestClick(clickedWordData, buttonElement) {
        if (this.testType === 'picture_choice') {
            return;
        }
        if (this.currentTestIndex >= this.testQueue.length) return;
        
        const targetWord = this.testQueue[this.currentTestIndex];
        
        // 比较逻辑：比较单词内容（忽略大小写）
        const isCorrect = clickedWordData.word.toLowerCase() === targetWord.word.toLowerCase();
        
        // 清除之前的高亮（如果有）
        // 实际上每次播放前并没有清除所有按钮样式，因为点击后马上就跳转了
        // 这里只是给当前点击的按钮加样式
        
        if (isCorrect) {
            debugLog('测试: 回答正确');
            this.testResults.correct++;
            buttonElement.style.backgroundColor = '#2ecc71'; // 绿色
            buttonElement.style.borderColor = '#27ae60';
        } else {
            debugLog(`测试: 回答错误。目标: ${targetWord.word}, 点击: ${clickedWordData.word}`);
            this.testResults.wrong++;
            // 记录错误详情
            this.testResults.wrongDetails.push({
                target: targetWord.word,
                clicked: clickedWordData.word
            });
            
            buttonElement.style.backgroundColor = '#e74c3c'; // 红色
            buttonElement.style.borderColor = '#c0392b';
            
            // 可选：高亮正确答案提示
            // 找到所有匹配正确单词的按钮
            const buttons = this.wordButtons.querySelectorAll('.word-button');
            buttons.forEach(btn => {
                if ((btn.dataset.wordKey || '').toLowerCase() === targetWord.word.toLowerCase()) {
                    btn.style.boxShadow = '0 0 15px #f1c40f'; // 黄色发光提示
                    setTimeout(() => { btn.style.boxShadow = ''; }, 1000);
                }
            });
        }

        if (!this.testResults.answerDetails) this.testResults.answerDetails = [];
        this.testResults.answerDetails.push({
            target: targetWord.word,
            clicked: clickedWordData.word,
            isCorrect: isCorrect,
            type: 'listen_click'
        });
        
        // 无论对错，稍作延迟后播放下一个
        // 防止用户快速连点
        if (this.testTimer) clearTimeout(this.testTimer);
        this.testTimer = setTimeout(() => {
            // 恢复样式
            buttonElement.style.backgroundColor = '';
            buttonElement.style.borderColor = '';
            
            this.currentTestIndex++;
            this.playNextTestAudio();
        }, 1000); 
    }
    
    finishTest() {
        this.hidePictureChoiceUI();
        this.testModal.style.display = 'flex';
        this.testSetup.style.display = 'none';
        this.testResult.style.display = 'block';
        
        const correctEl = document.getElementById('correctCount');
        const totalEl = document.getElementById('totalTestCount');
        const accuracyEl = document.getElementById('accuracy');
        
        if (correctEl) correctEl.textContent = this.testResults.correct;
        if (totalEl) totalEl.textContent = this.testQueue.length;
        
        const accuracy = this.testQueue.length > 0 
            ? Math.round((this.testResults.correct / this.testQueue.length) * 100) 
            : 0;
        if (accuracyEl) accuracyEl.textContent = accuracy + '%';
        
        // 保存错题记录到本地（如果运行在 server.py 环境下）
        if (this.testResults.wrongDetails.length > 0) {
            this.saveWrongWordsToLocal(this.testResults.wrongDetails);
        }
        
        // 显示错误单词列表
        const wrongContainer = document.getElementById('wrongWordsContainer');
        const wrongList = document.getElementById('wrongWordsList');
        
        if (wrongContainer && wrongList) {
            if (this.testResults.wrongDetails.length > 0) {
                wrongContainer.style.display = 'block';
                wrongList.innerHTML = this.testResults.wrongDetails.map(item => `
                    <div style="padding: 5px 0; border-bottom: 1px dashed #eee;">
                        <span style="color: #2c3e50; font-weight: bold;">${item.target}</span> 
                        <span style="color: #95a5a6; font-size: 12px;">(误选: ${item.clicked})</span>
                    </div>
                `).join('');
            } else {
                wrongContainer.style.display = 'none';
                wrongList.innerHTML = '';
            }
        }

        if (this.srsFeedbackContainer && this.srsFeedbackList) {
            const details = Array.isArray(this.testResults.answerDetails) ? this.testResults.answerDetails : [];
            if (details.length > 0) {
                this.srsFeedbackContainer.style.display = 'block';
                this.srsFeedbackList.innerHTML = '';

                const byWord = new Map();
                details.forEach(d => {
                    if (!d || !d.target) return;
                    const key = String(d.target);
                    if (!byWord.has(key)) byWord.set(key, d);
                });

                this.pendingSrsReviews.clear();

                Array.from(byWord.values()).forEach(d => {
                    const word = String(d.target);
                    const defaultLabel = d.isCorrect ? '认识' : '忘记';
                    const defaultQuality = this.getQualityValueByLabel(defaultLabel);
                    this.pendingSrsReviews.set(word, defaultQuality);

                    const row = document.createElement('div');
                    row.className = 'srs-feedback-row';

                    const wordEl = document.createElement('div');
                    wordEl.className = 'srs-feedback-word';
                    wordEl.textContent = word;

                    const actions = document.createElement('div');
                    actions.className = 'srs-feedback-actions';

                    const labels = ['认识', '模糊', '忘记'];
                    labels.forEach(label => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'srs-feedback-btn';
                        btn.textContent = label;
                        if (label === defaultLabel) btn.classList.add('active');
                        btn.addEventListener('click', () => {
                            actions.querySelectorAll('.srs-feedback-btn').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            this.pendingSrsReviews.set(word, this.getQualityValueByLabel(label));
                        });
                        actions.appendChild(btn);
                    });

                    row.appendChild(wordEl);
                    row.appendChild(actions);
                    this.srsFeedbackList.appendChild(row);
                });
            } else {
                this.srsFeedbackContainer.style.display = 'none';
                this.srsFeedbackList.innerHTML = '';
                this.pendingSrsReviews.clear();
            }
        }
    }
    
    endTestMode() {
        this.testMode = false;
        this.testModal.style.display = 'none';
        this.hidePictureChoiceUI();
        if (this.srsFeedbackContainer) this.srsFeedbackContainer.style.display = 'none';
        if (this.srsFeedbackList) this.srsFeedbackList.innerHTML = '';
        this.pendingSrsReviews.clear();
        this.showLabels = true;
        this.updateButtonLabels();
        
        // 停止音频
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        
        // 清除所有高亮
        const buttons = this.wordButtons.querySelectorAll('.word-button');
        buttons.forEach(btn => {
            btn.classList.remove('playing', 'correct', 'wrong');
            btn.style.backgroundColor = '';
            btn.style.borderColor = '';
            btn.style.boxShadow = '';
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    updateButtonLabels() {
         const buttons = this.wordButtons.querySelectorAll('.word-button');
         buttons.forEach(button => {
             if (this.showLabels) {
                 button.textContent = button.dataset.label || button.dataset.word || '';
                 button.classList.remove('hidden-label'); // 辅助类
             } else {
                 button.textContent = '';
                 button.classList.add('hidden-label');
             }
         });
     }

     // 保存错题到本地服务器
     async saveWrongWordsToLocal(wrongDetails) {
         try {
             // 获取当前页码
             const pageId = this.pageConfig.pageNumber;
             
             debugLog('正在保存错题记录...', { pageId, count: wrongDetails.length });
             
             const response = await fetch('/api/save_wrong_words', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({
                     pageId: pageId,
                     wrongWords: wrongDetails
                 })
             });
 
             if (response.ok) {
                  const result = await response.json();
                  debugLog('错题保存成功:', result);
                  this.showError('错题记录已自动保存', 'success');
                  // 刷新侧边栏
                  this.loadWrongWords();
              } else {
                  // 如果是 404，说明可能没有通过 server.py 运行
                 if (response.status === 404) {
                     console.warn('保存失败：API未找到。请确保使用 server.py 启动服务。');
                 } else {
                     console.error('保存失败，状态码:', response.status);
                 }
             }
         } catch (error) {
             console.error('保存错题记录时发生错误:', error);
             // 静默失败，不打扰用户（除非是为了调试）
             // 可能是直接打开 HTML 文件而不是通过服务器访问
         }
     }
 }

// 椤甸潰鍔犺浇瀹屾垚鍚庡垵濮嬪寲搴旂敤
document.addEventListener('DOMContentLoaded', () => {
    debugLog('=== 页面初始化开始 ===');
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.innerHTML = '<p>正在初始化页面，请稍候…</p>';
    }

    // 检查页面配置管理器是否存在
    if (!window.pageConfigManager) {
        console.error('未找到页面配置管理器');
        if (loadingEl) {
            loadingEl.innerHTML = '<p style="color: red;">错误：页面配置管理器未加载</p>';
        }
        return;
    }

    try {
        // 从URL获取页面配置
        const pageConfig = window.pageConfigManager.getPageConfigFromURL();
        debugLog('获取到的页面配置:', pageConfig);

        if (!pageConfig) {
            console.error('无法获取页面配置');
            if (loadingEl) {
                loadingEl.innerHTML = '<p style="color: red;">错误：无法获取页面配置</p>';
            }
            return;
        }

        // 检查必要的文件路径
        debugLog('数据文件路径:', pageConfig.dataFile);
        debugLog('图片文件路径:', pageConfig.imageFile);

        // 初始化播放器
        debugLog(`开始初始化播放器（目标页：${pageConfig.pageNumber}）...`);
        new PDFWordAudioPlayer(pageConfig);

        // 初始化流程由播放器内部控制，此处提示仅供用户知晓
        if (loadingEl) {
            loadingEl.innerHTML = '<p>已开始加载数据与图片，加载完成后将自动隐藏…</p>';
        }
    } catch (error) {
        console.error('页面初始化失败', error);
        if (loadingEl) {
            loadingEl.innerHTML = `<p style="color: red;">初始化失败：${error.message}</p>`;
        }
    }
});















