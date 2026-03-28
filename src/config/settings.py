"""
Centralized configuration for the PDF Word Separation project.
All magic numbers, paths, and tuneable parameters live here.
"""
from pathlib import Path
import os

# --- Project root ---
BASE_DIR = Path(__file__).parent.parent.parent  # remake/
# 校验 BASE_DIR 推导正确（应包含 docs/ 或 src/ 目录）
assert (BASE_DIR / "src").is_dir(), (
    f"BASE_DIR 推导错误: {BASE_DIR}，预期为 remake/ 根目录"
)

# --- Directories ---
SOUNDS_DIR       = BASE_DIR / "all_sounds"
IMAGES_DIR       = BASE_DIR / "images"
LISTS_DIR        = BASE_DIR / "lists_output"
WORDS_DIR        = BASE_DIR / "extracted_words"
RECORDS_DIR      = BASE_DIR / "wrong_words_record"
JS_DIR           = BASE_DIR / "js"
PAGE_CONFIG_FILE = JS_DIR / "page-config.js"

# --- PDF Processing ---
_pdf_default = BASE_DIR / "English for Everyone Illustrated English Dictionary (--) (Z-Library)_comb.pdf"
PDF_FILE = Path(os.environ.get("PDF_SEPARATION_FILE", str(_pdf_default)))
ZOOM_FACTOR = 2.0       # Rendering DPI multiplier for image export

# --- Word Extraction: coordinate thresholds (pixels, pre-zoom) ---
TITLE_TOP_Y_MAX        = 55.0    # Words above this Y are treated as page titles
TITLE_TARGET_Y_OFFSET  = -28.0   # Shift applied to title button Y position
PHRASE_MATCH_PROXIMITY = 260     # Max X-distance for multi-word phrase continuation
WORD_BOX_EXPANSION     = 0.8     # Expand word bounding box (px) when aliases merged
SAME_LINE_Y_TOL        = 5.0     # Max Y-diff to consider two words on same line
LINE_BREAK_Y_TOL_MIN   = 5.0     # Min Y-diff indicating a line break
LINE_BREAK_Y_TOL_MAX   = 20.0    # Max Y-diff for line-break continuation
LINE_BREAK_X_TOL       = 80.0    # Max X-diff for line-break word alignment

# --- Server ---
PORT_RANGE_START = 8000
PORT_RANGE_END   = 8020

# --- SRS Algorithm (SuperMemo 2) ---
# Base intervals in minutes: 5min, 30min, 720(12h), 1440(1d), 2880(2d), 5760(4d), 10080(7d), 21600(15d), 43200(30d), 86400(60d)
SRS_BASE_INTERVALS = [5, 30, 720, 1440, 2880, 5760, 10080, 21600, 43200, 86400]
SRS_MAX_STAGE      = len(SRS_BASE_INTERVALS) - 1
SRS_EASE_MIN       = 1.3
SRS_EASE_MAX       = 2.8
SRS_EASE_DEFAULT   = 2.5
SRS_REFERENCE_EF   = 2.5   # Used in interval scaling: minutes * (ef / reference_ef)

# --- SRS Quality levels (SuperMemo2 simplified, only 3 discrete values used) ---
# Full SM-2 range is 0-5; we use 1/3/5 as: forgotten/hazy/recognized
SRS_QUALITY_FORGOTTEN  = 1
SRS_QUALITY_HAZY       = 3
SRS_QUALITY_RECOGNIZED = 5

# --- Logging ---
LOG_LEVEL  = "INFO"
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
