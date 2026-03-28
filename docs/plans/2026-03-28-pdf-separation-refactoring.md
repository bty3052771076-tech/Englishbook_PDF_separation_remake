# PDF Separation Project — Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `PDF_separation_comb` into a clean, modular, testable codebase in `remake/`, preserving all existing functionality while eliminating magic numbers, heavy nesting, code duplication, and missing infrastructure (logging, config, tests).

**Architecture:** The refactored project uses a layered architecture: `src/config/` → `src/core/` → `src/server/` → frontend. Core domain logic (SRS, audio matching, word extraction) is extracted into isolated classes with clear interfaces. The server becomes a thin orchestration layer over these modules.

**Tech Stack:** Python 3.9+, PyMuPDF (fitz), standard library (http.server, logging, json, pathlib), pytest for testing. Frontend: Vanilla HTML5 + CSS3 + JavaScript (unchanged pattern, cleaned up).

---

## Project Target Structure

```
remake/
├── src/
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py          # All constants, paths, magic numbers
│   ├── core/
│   │   ├── __init__.py
│   │   ├── srs_engine.py        # SuperMemo-2 SRS algorithm (extracted)
│   │   ├── audio_matcher.py     # Multi-strategy audio path resolution
│   │   └── word_extractor.py    # PDF word coordinate extraction
│   └── server/
│       ├── __init__.py
│       ├── api_handlers.py      # API endpoint handlers
│       └── http_server.py       # HTTP server setup + routing
├── tools/
│   ├── book_automation.py       # Interactive page config generator (refactored)
│   └── web_generator.py         # All-in-one PDF processing (refactored)
├── tests/
│   ├── conftest.py
│   ├── test_srs_engine.py
│   ├── test_audio_matcher.py
│   └── test_word_extractor.py
├── js/                          # Frontend (minimal changes)
│   ├── main.js
│   └── page-config.js
├── css/
│   └── style.css
├── images/                      # Generated page PNGs
├── extracted_words/             # Generated coordinate JSONs
├── all_sounds/                  # Audio (unchanged)
├── lists_output/                # Chapter word lists (unchanged)
├── wrong_words_record/          # SRS/error data (unchanged)
├── index.html
├── server.py                    # New entry point (thin, imports from src/)
├── requirements.txt
└── README.md
```

---

## Task 1: Initialize Project & Configuration Module

**Files:**
- Create: `E:\internship\PDF_seperation\remake\src\__init__.py`
- Create: `E:\internship\PDF_seperation\remake\src\config\__init__.py`
- Create: `E:\internship\PDF_seperation\remake\src\config\settings.py`
- Create: `E:\internship\PDF_seperation\remake\requirements.txt`

**Step 1: Create directory skeleton**

```bash
cd E:\internship\PDF_seperation\remake
mkdir -p src/config src/core src/server tools tests js css images extracted_words wrong_words_record
touch src/__init__.py src/config/__init__.py src/core/__init__.py src/server/__init__.py
```

**Step 2: Write `src/config/settings.py`**

All magic numbers and paths extracted from the original codebase:

```python
"""
Centralized configuration for the PDF Word Separation project.
All magic numbers, paths, and tuneable parameters live here.
"""
from pathlib import Path

# --- Project root ---
BASE_DIR = Path(__file__).parent.parent.parent  # remake/

# --- Directories ---
SOUNDS_DIR       = BASE_DIR / "all_sounds"
IMAGES_DIR       = BASE_DIR / "images"
LISTS_DIR        = BASE_DIR / "lists_output"
WORDS_DIR        = BASE_DIR / "extracted_words"
RECORDS_DIR      = BASE_DIR / "wrong_words_record"
JS_DIR           = BASE_DIR / "js"
PAGE_CONFIG_FILE = JS_DIR / "page-config.js"

# --- PDF Processing ---
PDF_FILE         = BASE_DIR / "English for Everyone Illustrated English Dictionary (--) (Z-Library)_comb.pdf"
ZOOM_FACTOR      = 2.0       # Rendering DPI multiplier for image export

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
# Base intervals in minutes: 5m, 30m, 12h, 1d, 2d, 4d, 7d, 15d, 30d, 60d
SRS_BASE_INTERVALS = [5, 30, 720, 1440, 2880, 5760, 10080, 21600, 43200, 86400]
SRS_MAX_STAGE      = len(SRS_BASE_INTERVALS) - 1
SRS_EASE_MIN       = 1.3
SRS_EASE_MAX       = 2.8
SRS_EASE_DEFAULT   = 2.5
SRS_REFERENCE_EF   = 2.5   # Used in interval scaling: minutes * (ef / reference_ef)

# --- SRS Quality levels ---
SRS_QUALITY_FORGOTTEN  = 1
SRS_QUALITY_HAZY       = 3
SRS_QUALITY_RECOGNIZED = 5

# --- Logging ---
LOG_LEVEL  = "INFO"
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
```

**Step 3: Create `requirements.txt`**

```
PyMuPDF>=1.23.0
pytest>=7.4.0
```

**Step 4: Verify structure**

```bash
python -c "from src.config.settings import BASE_DIR, SRS_BASE_INTERVALS; print('Config OK', BASE_DIR)"
```

Expected: `Config OK E:\internship\PDF_seperation\remake`

**Step 5: Commit**

```bash
git add src/ requirements.txt
git commit -m "feat: initialize remake project structure and centralized config"
```

---

## Task 2: Extract SRS Engine

**Files:**
- Create: `src/core/srs_engine.py`
- Create: `tests/test_srs_engine.py`
- Reference: original `server.py` lines containing `srs_` API handler

**Step 1: Write failing tests first**

```python
# tests/test_srs_engine.py
import pytest
from datetime import datetime
from src.core.srs_engine import SRSEngine, SRSItem

@pytest.fixture
def engine():
    return SRSEngine()

def test_new_item_has_defaults(engine):
    item = engine.new_item("hello")
    assert item.word == "hello"
    assert item.stage == 0
    assert item.ef == pytest.approx(2.5)
    assert item.total_reviews == 0

def test_recognized_advances_stage(engine):
    item = engine.new_item("hello")
    updated = engine.record_review(item, quality=5)
    assert updated.stage == 1
    assert updated.total_reviews == 1
    assert updated.success_count == 1

def test_forgotten_resets_stage(engine):
    item = engine.new_item("hello")
    item.stage = 4
    updated = engine.record_review(item, quality=1)
    assert updated.stage == 0

def test_ease_factor_clamped(engine):
    item = engine.new_item("hello")
    # Keep reviewing as forgotten - EF should not drop below SRS_EASE_MIN
    for _ in range(10):
        item = engine.record_review(item, quality=1)
    assert item.ef >= 1.3

def test_next_due_set_after_review(engine):
    item = engine.new_item("hello")
    before = datetime.now()
    updated = engine.record_review(item, quality=5)
    assert updated.next_due_time > before

def test_due_today_includes_overdue(engine):
    item = engine.new_item("hello")
    item.next_due_time = datetime(2000, 1, 1)  # Long in the past
    assert engine.is_due_now(item) is True

def test_serialize_deserialize_roundtrip(engine):
    item = engine.new_item("tear duct")
    item = engine.record_review(item, quality=5)
    data = engine.to_dict(item)
    restored = engine.from_dict(data)
    assert restored.word == item.word
    assert restored.stage == item.stage
    assert abs(restored.ef - item.ef) < 0.001
```

**Step 2: Run tests — expect all FAIL**

```bash
cd E:\internship\PDF_seperation\remake
pytest tests/test_srs_engine.py -v
```

Expected: `FAILED (ImportError: No module named 'src.core.srs_engine')`

**Step 3: Implement `src/core/srs_engine.py`**

```python
"""
SuperMemo 2 Spaced Repetition Engine.

Extracted from the original server.py SRS API handler.
All algorithm parameters are read from src.config.settings.
"""
import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

from src.config.settings import (
    SRS_BASE_INTERVALS, SRS_MAX_STAGE, SRS_EASE_MIN, SRS_EASE_MAX,
    SRS_EASE_DEFAULT, SRS_REFERENCE_EF,
    SRS_QUALITY_FORGOTTEN, SRS_QUALITY_HAZY, SRS_QUALITY_RECOGNIZED,
)

logger = logging.getLogger(__name__)


@dataclass
class SRSItem:
    """Represents a single vocabulary word's SRS state."""
    word: str
    stage: int = 0                           # 0-9 proficiency level
    ef: float = SRS_EASE_DEFAULT             # Ease factor
    total_reviews: int = 0
    success_count: int = 0
    last_quality: int = 0
    last_review_time: Optional[datetime] = None
    next_due_time: Optional[datetime] = None


class SRSEngine:
    """
    Implements SuperMemo 2 algorithm for scheduling vocabulary reviews.

    Quality levels:
        1 = Forgotten  → reset stage to 0
        3 = Hazy       → maintain or downgrade
        5 = Recognized → advance stage
    """

    def new_item(self, word: str) -> SRSItem:
        """Create a fresh SRS item for a word with default values."""
        return SRSItem(word=word)

    def record_review(self, item: SRSItem, quality: int) -> SRSItem:
        """
        Update item state after a review session.

        Args:
            item:    The current SRS state for a word.
            quality: Review quality (1=forgotten, 3=hazy, 5=recognized).

        Returns:
            Updated SRSItem with new stage, EF, and next due time.
        """
        # Clamp quality to known levels
        if quality not in (SRS_QUALITY_FORGOTTEN, SRS_QUALITY_HAZY, SRS_QUALITY_RECOGNIZED):
            logger.warning("Unexpected quality value %d; clamping to nearest.", quality)
            quality = min(SRS_QUALITY_RECOGNIZED, max(SRS_QUALITY_FORGOTTEN, quality))

        item.total_reviews += 1
        item.last_quality = quality
        item.last_review_time = datetime.now()

        # --- Stage update ---
        if quality >= SRS_QUALITY_RECOGNIZED:
            item.success_count += 1
            item.stage = min(item.stage + 1, SRS_MAX_STAGE)
        elif quality < SRS_QUALITY_HAZY:
            item.stage = 0  # Forgotten → full reset
        else:
            # Hazy: downgrade if not at the beginning
            if item.stage >= 2:
                item.stage = max(0, item.stage - 1)

        # --- Ease factor update (SM-2 formula) ---
        item.ef += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        item.ef = max(SRS_EASE_MIN, min(SRS_EASE_MAX, item.ef))

        # --- Schedule next review ---
        minutes = SRS_BASE_INTERVALS[item.stage]
        if item.stage >= 2:
            minutes = int(minutes * (item.ef / SRS_REFERENCE_EF))
        item.next_due_time = datetime.now() + timedelta(minutes=minutes)

        logger.debug(
            "Reviewed '%s': quality=%d stage=%d ef=%.2f next_in=%dm",
            item.word, quality, item.stage, item.ef, minutes
        )
        return item

    def is_due_now(self, item: SRSItem) -> bool:
        """Return True if this item is due for review right now."""
        if item.next_due_time is None:
            return True
        return datetime.now() >= item.next_due_time

    def to_dict(self, item: SRSItem) -> dict:
        """Serialize SRSItem to a JSON-compatible dict."""
        return {
            "word": item.word,
            "stage": item.stage,
            "ef": round(item.ef, 4),
            "total_reviews": item.total_reviews,
            "success_count": item.success_count,
            "last_quality": item.last_quality,
            "last_review_time": item.last_review_time.isoformat() if item.last_review_time else None,
            "next_due_time": item.next_due_time.isoformat() if item.next_due_time else None,
        }

    def from_dict(self, data: dict) -> SRSItem:
        """Deserialize an SRSItem from a JSON dict (e.g., loaded from srs_progress_pageN.json)."""
        def _parse_dt(s):
            return datetime.fromisoformat(s) if s else None

        return SRSItem(
            word=data["word"],
            stage=data.get("stage", 0),
            ef=data.get("ef", SRS_EASE_DEFAULT),
            total_reviews=data.get("total_reviews", 0),
            success_count=data.get("success_count", 0),
            last_quality=data.get("last_quality", 0),
            last_review_time=_parse_dt(data.get("last_review_time")),
            next_due_time=_parse_dt(data.get("next_due_time")),
        )
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_srs_engine.py -v
```

Expected: `7 passed`

**Step 5: Commit**

```bash
git add src/core/srs_engine.py tests/test_srs_engine.py
git commit -m "feat: extract SRS engine with full test coverage"
```

---

## Task 3: Extract Audio Matcher

**Files:**
- Create: `src/core/audio_matcher.py`
- Create: `tests/test_audio_matcher.py`
- Reference: `js/main.js` audio matching strategies + `pdf_word_extractor.py` alias loading

**Step 1: Write failing tests**

```python
# tests/test_audio_matcher.py
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from src.core.audio_matcher import AudioMatcher, AudioMatch

def test_exact_uk_match(tmp_path):
    # Create fake audio directory
    section_dir = tmp_path / "1.1"
    section_dir.mkdir()
    (section_dir / "hello_uk.mp3").touch()

    matcher = AudioMatcher(sounds_root=tmp_path)
    result = matcher.find_audio("hello", sections=["1.1"])
    assert result is not None
    assert "hello_uk.mp3" in str(result.path)

def test_multi_word_phrase_match(tmp_path):
    section_dir = tmp_path / "1.2"
    section_dir.mkdir()
    (section_dir / "tear_duct_uk.mp3").touch()

    matcher = AudioMatcher(sounds_root=tmp_path)
    result = matcher.find_audio("tear duct", sections=["1.2"])
    assert result is not None

def test_returns_none_for_missing_word(tmp_path):
    (tmp_path / "1.1").mkdir()
    matcher = AudioMatcher(sounds_root=tmp_path)
    result = matcher.find_audio("nonexistent_word_xyz", sections=["1.1"])
    assert result is None

def test_cross_section_fallback(tmp_path):
    # Word not in primary section, but exists in another
    (tmp_path / "1.1").mkdir()
    sec2 = tmp_path / "1.2"
    sec2.mkdir()
    (sec2 / "skull_uk.mp3").touch()

    matcher = AudioMatcher(sounds_root=tmp_path)
    result = matcher.find_audio("skull", sections=["1.1"], fallback_cross_section=True)
    assert result is not None
```

**Step 2: Run tests — expect FAIL (ImportError)**

```bash
pytest tests/test_audio_matcher.py -v
```

**Step 3: Implement `src/core/audio_matcher.py`**

```python
"""
Multi-strategy audio path resolver.

Mirrors the audio-finding logic in the original main.js, ported to Python
so server-side audio validation and pre-flight checks are possible.

Strategies (tried in order):
    1. Direct match:  {word}_uk.mp3, {word}_us.mp3, {word}_usuk.mp3
    2. Normalized:    lowercase, spaces→underscores
    3. Numbered:      {word}_1_uk.mp3, {word}_2_uk.mp3
    4. Cross-section: scan all sections as last resort (optional)
"""
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, List

from src.config.settings import SOUNDS_DIR

logger = logging.getLogger(__name__)

_SUFFIXES = ["_uk.mp3", "_us.mp3", "_usuk.mp3", "_main_uk.mp3"]


@dataclass
class AudioMatch:
    path: Path
    strategy: str   # Which strategy succeeded, for debugging


class AudioMatcher:
    """Resolves a vocabulary word to its audio file path."""

    def __init__(self, sounds_root: Optional[Path] = None):
        self.sounds_root = sounds_root or SOUNDS_DIR

    def find_audio(
        self,
        word: str,
        sections: List[str],
        fallback_cross_section: bool = False,
    ) -> Optional[AudioMatch]:
        """
        Find the audio file for a word across the given sections.

        Args:
            word:                   The vocabulary word (e.g. "tear duct").
            sections:               List of section IDs to search (e.g. ["1.1", "1.2"]).
            fallback_cross_section: If True, scan all sections if primary search fails.

        Returns:
            AudioMatch with .path set, or None if not found.
        """
        candidates = self._generate_candidates(word)

        for section in sections:
            section_dir = self.sounds_root / section
            if not section_dir.is_dir():
                logger.warning("Section directory missing: %s", section_dir)
                continue

            for filename, strategy in candidates:
                target = section_dir / filename
                if target.exists():
                    logger.debug("Found audio '%s' via %s in %s", word, strategy, section)
                    return AudioMatch(path=target, strategy=strategy)

        if fallback_cross_section:
            return self._cross_section_search(word, candidates)

        logger.debug("No audio found for '%s' in sections %s", word, sections)
        return None

    def _generate_candidates(self, word: str) -> List[tuple]:
        """
        Generate (filename, strategy_name) pairs to try for a word.
        """
        normalized = word.lower().replace(" ", "_").replace("-", "_")
        candidates = []

        # Strategy 1: direct suffix combinations
        for suffix in _SUFFIXES:
            candidates.append((f"{normalized}{suffix}", "direct"))

        # Strategy 2: numbered variants (e.g., tear_1_uk.mp3)
        for n in range(1, 4):
            for suf in ["_uk.mp3", "_us.mp3"]:
                candidates.append((f"{normalized}_{n}{suf}", "numbered"))

        # Strategy 3: multi-word phrase — try first word only
        parts = normalized.split("_")
        if len(parts) > 1:
            first = parts[0]
            for suffix in _SUFFIXES:
                candidates.append((f"{first}{suffix}", "first_word"))

        return candidates

    def _cross_section_search(self, word: str, candidates: List[tuple]) -> Optional[AudioMatch]:
        """Scan all subdirectories in sounds_root as last-resort fallback."""
        if not self.sounds_root.is_dir():
            return None
        for section_dir in sorted(self.sounds_root.iterdir()):
            if not section_dir.is_dir():
                continue
            for filename, _ in candidates:
                target = section_dir / filename
                if target.exists():
                    logger.debug("Cross-section fallback found '%s' in %s", word, section_dir.name)
                    return AudioMatch(path=target, strategy="cross_section")
        return None
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_audio_matcher.py -v
```

Expected: `4 passed`

**Step 5: Commit**

```bash
git add src/core/audio_matcher.py tests/test_audio_matcher.py
git commit -m "feat: extract AudioMatcher with multi-strategy resolution and tests"
```

---

## Task 4: Refactor Word Extractor

**Files:**
- Create: `src/core/word_extractor.py`
- Create: `tests/test_word_extractor.py`
- Reference: `pdf_word_extractor.py` (original, 64.5 KB)

**Goal:** Eliminate 7-level nesting by decomposing into focused functions. Extract magic numbers. Keep algorithm identical.

**Step 1: Write tests for the public interface**

```python
# tests/test_word_extractor.py
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch
from src.core.word_extractor import WordExtractor, WordEntry

def test_word_entry_has_expected_fields():
    entry = WordEntry(
        word="eye", x0=100, y0=200, x1=140, y1=220,
        font_size=10, section="1.1", number=3, is_title=False, is_multi_word=False
    )
    assert entry.width == pytest.approx(40.0)
    assert entry.height == pytest.approx(20.0)

def test_multi_word_detection():
    entry = WordEntry(
        word="tear duct", x0=0, y0=0, x1=50, y1=10,
        font_size=8, section="1.3", number=1, is_title=False, is_multi_word=True
    )
    assert entry.is_multi_word is True

def test_to_dict_serialization():
    entry = WordEntry(
        word="skull", x0=10, y0=20, x1=40, y1=35,
        font_size=9, section="2.1", number=5, is_title=False, is_multi_word=False
    )
    d = entry.to_dict()
    assert d["word"] == "skull"
    assert d["x0"] == 10
    assert "width" in d
    assert "height" in d
```

**Step 2: Run tests — expect FAIL (ImportError)**

```bash
pytest tests/test_word_extractor.py -v
```

**Step 3: Implement `src/core/word_extractor.py`**

Core design: break the original monolithic `extract_and_save_words_multi_section` into:
- `load_word_list()` — parse chapter vocabulary file
- `load_section_aliases()` — build word→aliases map from audio filenames
- `find_phrases()` — locate multi-word expressions on a PDF page
- `find_single_words()` — locate single words with anchor scoring
- `select_best_candidate()` — anchor-based disambiguation
- `extract_page_words()` — orchestrator (replaces main nested function)

```python
"""
Word coordinate extractor for PDF pages.

Refactored from pdf_word_extractor.py:
- Magic numbers → src.config.settings
- 7-level nesting → focused helper functions
- Duplicate alias parsing → single parse_aliases()
- Cleaner separation: load → find → score → save
"""
import json
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Dict, Optional, Tuple

import fitz  # PyMuPDF

from src.config.settings import (
    TITLE_TOP_Y_MAX, TITLE_TARGET_Y_OFFSET, PHRASE_MATCH_PROXIMITY,
    WORD_BOX_EXPANSION, SAME_LINE_Y_TOL,
    LINE_BREAK_Y_TOL_MIN, LINE_BREAK_Y_TOL_MAX, LINE_BREAK_X_TOL,
    LISTS_DIR, SOUNDS_DIR, WORDS_DIR,
)

logger = logging.getLogger(__name__)


@dataclass
class WordEntry:
    """Represents a single word's position on a PDF page."""
    word: str
    x0: float
    y0: float
    x1: float
    y1: float
    font_size: float
    section: str
    number: int
    is_title: bool
    is_multi_word: bool

    @property
    def width(self) -> float:
        return self.x1 - self.x0

    @property
    def height(self) -> float:
        return self.y1 - self.y0

    def to_dict(self) -> dict:
        return {
            "word": self.word,
            "x0": round(self.x0, 2),
            "y0": round(self.y0, 2),
            "x1": round(self.x1, 2),
            "y1": round(self.y1, 2),
            "width": round(self.width, 2),
            "height": round(self.height, 2),
            "font_size": round(self.font_size, 2),
            "section": self.section,
            "number": self.number,
            "is_title": self.is_title,
            "is_multi_word": self.is_multi_word,
        }


class WordExtractor:
    """
    Extracts word bounding boxes from a PDF page for a given section.

    Usage:
        extractor = WordExtractor(pdf_path="book.pdf")
        words = extractor.extract_page(page_num=7, sections=["1.1", "1.2"])
        extractor.save(words, page_num=7)
    """

    def __init__(self, pdf_path: Path):
        self.pdf_path = Path(pdf_path)
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        self._doc = fitz.open(str(pdf_path))

    def extract_page(self, page_num: int, sections: List[str]) -> List[WordEntry]:
        """
        Extract all target word positions from a single PDF page.

        Args:
            page_num: 1-based PDF page number.
            sections: List of section IDs (e.g. ["1.1", "1.2"]).

        Returns:
            List of WordEntry objects sorted by (section, number).
        """
        page_index = page_num - 1
        if page_index < 0 or page_index >= len(self._doc):
            raise ValueError(f"Page {page_num} out of range (doc has {len(self._doc)} pages)")

        page = self._doc[page_index]
        pdf_words = page.get_text("words")  # [(x0, y0, x1, y1, word, block, line, word_idx)]

        results: List[WordEntry] = []
        for section in sections:
            word_list = self._load_word_list(section)
            aliases = self._load_section_aliases(section)
            entries = self._extract_section_words(pdf_words, word_list, aliases, section)
            results.extend(entries)

        return results

    def save(self, words: List[WordEntry], page_num: int, output_dir: Optional[Path] = None) -> Path:
        """Save word entries as JSON to extracted_words/extracted_words_pageN.json."""
        out_dir = Path(output_dir) if output_dir else WORDS_DIR
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"extracted_words_page{page_num}.json"

        data = [w.to_dict() for w in words]
        out_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        logger.info("Saved %d words to %s", len(data), out_file)
        return out_file

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_word_list(self, section: str) -> List[Tuple[int, str]]:
        """Parse lists_output/list_{section}.txt → [(number, word), ...]."""
        list_file = LISTS_DIR / f"list_{section}.txt"
        if not list_file.exists():
            logger.warning("Word list missing: %s", list_file)
            return []

        entries = []
        for line in list_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            parts = line.split(" ", 1)
            if len(parts) == 2 and parts[0].isdigit():
                entries.append((int(parts[0]), parts[1].strip()))
        return entries

    def _load_section_aliases(self, section: str) -> Dict[str, List[str]]:
        """
        Build word→aliases map from audio filenames in all_sounds/{section}/.

        Example: "tear_duct_uk.mp3" → word "tear duct" has alias "tear_duct".
        """
        section_dir = SOUNDS_DIR / section
        aliases: Dict[str, List[str]] = {}
        if not section_dir.is_dir():
            return aliases

        for f in section_dir.glob("*.mp3"):
            stem = f.stem  # e.g. "tear_duct_uk"
            # Strip known suffixes
            for suffix in ("_uk", "_us", "_usuk", "_main_uk", "_main_us"):
                if stem.endswith(suffix):
                    stem = stem[: -len(suffix)]
                    break
            word = stem.replace("_", " ")
            aliases.setdefault(word, []).append(stem)

        return aliases

    def _extract_section_words(
        self,
        pdf_words: list,
        word_list: List[Tuple[int, str]],
        aliases: Dict[str, List[str]],
        section: str,
    ) -> List[WordEntry]:
        """Process all words in a section, handling phrases then singles."""
        results = []
        found_phrase_boxes: List[Tuple[float, float, float, float]] = []

        # First pass: find multi-word phrases
        for number, word in word_list:
            if " " not in word:
                continue
            entry = self._find_phrase(pdf_words, word, section, number)
            if entry:
                results.append(entry)
                found_phrase_boxes.append((entry.x0, entry.y0, entry.x1, entry.y1))

        # Build quick lookup for positioning anchors
        phrase_words = {e.word for e in results}

        # Second pass: single words
        for i, (number, word) in enumerate(word_list):
            if word in phrase_words:
                continue
            neighbors = [
                word_list[i - 1][1] if i > 0 else None,
                word_list[i + 1][1] if i < len(word_list) - 1 else None,
            ]
            entry = self._find_single_word(
                pdf_words, word, aliases.get(word, []),
                section, number, neighbors, found_phrase_boxes
            )
            if entry:
                results.append(entry)

        results.sort(key=lambda e: (e.section, e.number))
        return results

    def _find_phrase(
        self, pdf_words: list, phrase: str, section: str, number: int
    ) -> Optional[WordEntry]:
        """Locate a multi-word phrase on the page using proximity matching."""
        parts = phrase.lower().split()
        if not parts:
            return None

        # Find all occurrences of first word
        first_candidates = [
            w for w in pdf_words if w[4].lower() == parts[0]
        ]

        for start_word in first_candidates:
            matched = [start_word]
            last = start_word

            for part in parts[1:]:
                next_word = self._find_next_in_phrase(pdf_words, last, part)
                if next_word is None:
                    break
                matched.append(next_word)
                last = next_word

            if len(matched) == len(parts):
                # Compute merged bounding box
                x0 = min(w[0] for w in matched)
                y0 = min(w[1] for w in matched)
                x1 = max(w[2] for w in matched)
                y1 = max(w[3] for w in matched)
                is_title = y0 < TITLE_TOP_Y_MAX
                if is_title:
                    y0 += TITLE_TARGET_Y_OFFSET

                return WordEntry(
                    word=phrase, x0=x0, y0=y0, x1=x1, y1=y1,
                    font_size=matched[0][3] - matched[0][1],
                    section=section, number=number,
                    is_title=is_title, is_multi_word=True,
                )
        return None

    def _find_next_in_phrase(self, pdf_words: list, prev: tuple, target: str) -> Optional[tuple]:
        """Find the next word in a phrase after `prev`, using proximity rules."""
        px0, py0, px1, py1 = prev[0], prev[1], prev[2], prev[3]

        for w in pdf_words:
            if w[4].lower() != target:
                continue
            wx0, wy0 = w[0], w[1]
            x_dist = wx0 - px1
            y_dist = abs(wy0 - py0)

            same_line = y_dist <= SAME_LINE_Y_TOL and -10 <= x_dist <= PHRASE_MATCH_PROXIMITY
            line_break = (
                LINE_BREAK_Y_TOL_MIN < y_dist <= LINE_BREAK_Y_TOL_MAX
                and abs(wx0 - px0) <= LINE_BREAK_X_TOL
            )
            if same_line or line_break:
                return w
        return None

    def _find_single_word(
        self,
        pdf_words: list,
        word: str,
        aliases: List[str],
        section: str,
        number: int,
        neighbors: List[Optional[str]],
        occupied_boxes: List[Tuple[float, float, float, float]],
    ) -> Optional[WordEntry]:
        """Find a single word using alias variants and anchor scoring."""
        targets = {word.lower()} | {a.replace("_", " ").lower() for a in aliases}

        candidates = [
            w for w in pdf_words
            if w[4].lower() in targets and not self._overlaps_any(w, occupied_boxes)
        ]

        if not candidates:
            return None

        best = self._select_best_candidate(candidates, neighbors, pdf_words)
        x0, y0, x1, y1 = best[0], best[1], best[2], best[3]

        # Expand box slightly when aliases were merged
        if aliases:
            x0 -= WORD_BOX_EXPANSION
            x1 += WORD_BOX_EXPANSION

        is_title = y0 < TITLE_TOP_Y_MAX
        if is_title:
            y0 += TITLE_TARGET_Y_OFFSET

        return WordEntry(
            word=word, x0=x0, y0=y0, x1=x1, y1=y1,
            font_size=best[3] - best[1],
            section=section, number=number,
            is_title=is_title, is_multi_word=False,
        )

    def _select_best_candidate(
        self, candidates: list, neighbors: List[Optional[str]], all_pdf_words: list
    ) -> tuple:
        """
        Choose the best word candidate by scoring proximity to neighboring words.
        Falls back to topmost-leftmost candidate if no neighbors found.
        """
        if len(candidates) == 1:
            return candidates[0]

        # Build neighbor anchor positions
        anchors = []
        for neighbor in neighbors:
            if neighbor is None:
                continue
            for w in all_pdf_words:
                if w[4].lower() == neighbor.lower():
                    anchors.append(((w[0] + w[2]) / 2, (w[1] + w[3]) / 2))
                    break

        if not anchors:
            # No anchors: pick topmost then leftmost
            return min(candidates, key=lambda w: (w[1], w[0]))

        def anchor_score(cand):
            cx, cy = (cand[0] + cand[2]) / 2, (cand[1] + cand[3]) / 2
            return min((cx - ax) ** 2 + (cy - ay) ** 2 for ax, ay in anchors)

        return min(candidates, key=anchor_score)

    def _overlaps_any(self, word_tuple: tuple, boxes: List[Tuple]) -> bool:
        """Return True if a PDF word rect overlaps any of the given bounding boxes."""
        wx0, wy0, wx1, wy1 = word_tuple[0], word_tuple[1], word_tuple[2], word_tuple[3]
        for bx0, by0, bx1, by1 in boxes:
            if wx0 < bx1 and wx1 > bx0 and wy0 < by1 and wy1 > by0:
                return True
        return False
```

**Step 4: Run tests — expect PASS**

```bash
pytest tests/test_word_extractor.py -v
```

Expected: `3 passed`

**Step 5: Commit**

```bash
git add src/core/word_extractor.py tests/test_word_extractor.py
git commit -m "feat: refactor WordExtractor - eliminate nesting and magic numbers"
```

---

## Task 5: Refactor Server — API Handlers

**Files:**
- Create: `src/server/api_handlers.py`
- Create: `src/server/http_server.py`
- Reference: original `server.py` (15.7 KB)

**Step 1: Implement `src/server/api_handlers.py`**

```python
"""
API request handlers extracted from server.py.

Each handler is a plain function taking (page_id, body_dict) → response_dict,
making them testable without an HTTP context.
"""
import json
import logging
import tempfile
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from src.config.settings import RECORDS_DIR
from src.core.srs_engine import SRSEngine, SRSItem

logger = logging.getLogger(__name__)
_srs = SRSEngine()


# --- File I/O helpers ---

def _read_json(path: Path) -> dict:
    """Read JSON file safely; return empty dict on missing/corrupt file."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _write_json_atomic(path: Path, data: dict) -> None:
    """Write JSON atomically via tempfile → rename to prevent corruption."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", dir=path.parent, suffix=".tmp",
            delete=False, encoding="utf-8"
        ) as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            tmp = f.name
        os.replace(tmp, path)
    except Exception:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
        raise


# --- Wrong words API ---

def save_wrong_words(page_id: str, records: dict) -> dict:
    """Merge new error records into wrong_words_pageN.json."""
    path = RECORDS_DIR / f"wrong_words_page{page_id}.json"
    data = _read_json(path) or {
        "page_id": page_id,
        "records": {},
    }
    data["last_update"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["records"].update(records)
    _write_json_atomic(path, data)
    logger.info("Saved wrong words for page %s (%d records)", page_id, len(records))
    return {"status": "ok", "page_id": page_id}


def get_wrong_words(page_id: str) -> dict:
    """Return error records for a page."""
    path = RECORDS_DIR / f"wrong_words_page{page_id}.json"
    return _read_json(path)


# --- SRS API ---

def srs_record(page_id: str, word: str, quality: int) -> dict:
    """Record a review result and update SRS progress."""
    path = RECORDS_DIR / f"srs_progress_page{page_id}.json"
    data = _read_json(path) or {"page_id": page_id, "version": 1, "items": {}}

    raw = data["items"].get(word, {"word": word})
    item = _srs.from_dict(raw) if "stage" in raw else _srs.new_item(word)
    item = _srs.record_review(item, quality)

    data["items"][word] = _srs.to_dict(item)
    data["last_update"] = datetime.now().isoformat()
    _write_json_atomic(path, data)

    return {"status": "ok", "word": word, "stage": item.stage, "ef": item.ef}


def srs_get_today(page_id: str) -> dict:
    """Return list of words due for review today."""
    path = RECORDS_DIR / f"srs_progress_page{page_id}.json"
    data = _read_json(path)
    items = data.get("items", {})

    due = [
        _srs.to_dict(_srs.from_dict(v))
        for v in items.values()
        if _srs.is_due_now(_srs.from_dict(v))
    ]
    return {"page_id": page_id, "due_count": len(due), "due_words": due}


def srs_get_all(page_id: str) -> dict:
    """Return complete SRS progress for a page."""
    path = RECORDS_DIR / f"srs_progress_page{page_id}.json"
    return _read_json(path)
```

**Step 2: Implement `src/server/http_server.py`**

```python
"""
HTTP server: static file serving + JSON API routing.

Routing table:
    POST /api/save_wrong_words  → api_handlers.save_wrong_words
    GET  /api/get_wrong_words   → api_handlers.get_wrong_words
    POST /api/srs/record        → api_handlers.srs_record
    GET  /api/srs/today         → api_handlers.srs_get_today
    GET  /api/srs/get           → api_handlers.srs_get_all
    *    (everything else)      → static files from BASE_DIR
"""
import json
import logging
import socketserver
from http.server import SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from src.config.settings import BASE_DIR, PORT_RANGE_START, PORT_RANGE_END
from src.server import api_handlers

logger = logging.getLogger(__name__)


class PDFAppHandler(SimpleHTTPRequestHandler):
    """HTTP handler for the PDF Word Separation app."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, fmt, *args):
        logger.debug(fmt, *args)

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        page_id = params.get("pageId", [None])[0]

        route_map = {
            "/api/get_wrong_words": lambda: api_handlers.get_wrong_words(page_id),
            "/api/srs/today":       lambda: api_handlers.srs_get_today(page_id),
            "/api/srs/get":         lambda: api_handlers.srs_get_all(page_id),
        }

        handler = route_map.get(parsed.path)
        if handler:
            self._send_json(handler())
        else:
            super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        parsed = urlparse(self.path)

        if parsed.path == "/api/save_wrong_words":
            result = api_handlers.save_wrong_words(body.get("pageId"), body.get("records", {}))
            self._send_json(result)
        elif parsed.path == "/api/srs/record":
            result = api_handlers.srs_record(body["pageId"], body["word"], body["quality"])
            self._send_json(result)
        else:
            self.send_error(404)

    def _send_json(self, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def create_server() -> tuple:
    """Find a free port and create the server instance."""
    for port in range(PORT_RANGE_START, PORT_RANGE_END):
        try:
            server = ThreadingServer(("", port), PDFAppHandler)
            return server, port
        except OSError:
            continue
    raise RuntimeError(f"No free port found in range {PORT_RANGE_START}-{PORT_RANGE_END}")
```

**Step 3: Create thin entry point `server.py`**

```python
"""
Entry point: start the PDF Word Separation web server.
"""
import logging
from src.config.settings import LOG_LEVEL, LOG_FORMAT
from src.server.http_server import create_server

logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    server, port = create_server()
    logger.info("Server running at http://localhost:%d", port)
    logger.info("Open in browser: http://localhost:%d/?page=7", port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped.")
```

**Step 4: Smoke test**

```bash
cd E:\internship\PDF_seperation\remake
python server.py
# Should print: Server running at http://localhost:8000
# Ctrl+C to stop
```

**Step 5: Commit**

```bash
git add src/server/ server.py
git commit -m "feat: refactor server into thin entry point + api_handlers + http_server"
```

---

## Task 6: Refactor book_automation.py

**Files:**
- Create: `tools/book_automation.py`
- Reference: original `book_automation.py` (22.7 KB)

**Key change:** Replace regex-based JS parsing with reading/writing a JSON intermediate (`page_config_data.json`) and generating JS from that. This eliminates fragile multi-pattern fallback regex.

**Step 1: Design data model**

```json
{
  "pages": {
    "7": {
      "pageNumber": 7,
      "sections": ["1.1", "1.2"],
      "dataFile": "extracted_words/extracted_words_page7.json",
      "imageFile": "images/page7.png",
      "title": "Human Body",
      "description": "Body vocabulary",
      "primarySection": "1.1"
    }
  },
  "sectionToPageMap": {
    "1.1": 7,
    "1.2": 7
  }
}
```

**Step 2: Implement `tools/book_automation.py`**

```python
"""
Interactive page configuration manager.

Refactored from the original book_automation.py:
- JSON as source of truth (no more regex-based JS parsing)
- JS file is generated output, not input
- Cleaner interactive prompts with validation
"""
import json
import logging
import sys
from pathlib import Path

from src.config.settings import (
    BASE_DIR, SOUNDS_DIR, JS_DIR, PAGE_CONFIG_FILE, LOG_LEVEL, LOG_FORMAT
)

logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

CONFIG_DATA_FILE = BASE_DIR / "page_config_data.json"


def load_config() -> dict:
    if CONFIG_DATA_FILE.exists():
        return json.loads(CONFIG_DATA_FILE.read_text(encoding="utf-8"))
    return {"pages": {}, "sectionToPageMap": {}}


def save_config(config: dict) -> None:
    CONFIG_DATA_FILE.write_text(
        json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def get_available_sections() -> list:
    """List section IDs found in all_sounds/."""
    if not SOUNDS_DIR.is_dir():
        return []
    return sorted(d.name for d in SOUNDS_DIR.iterdir() if d.is_dir())


def prompt_sections(available: list) -> list:
    """Interactively prompt user to pick sections."""
    print("\nAvailable sections:", ", ".join(available))
    raw = input("Enter sections for this page (comma-separated, e.g. 1.1,1.2): ").strip()
    sections = [s.strip() for s in raw.split(",") if s.strip()]
    invalid = [s for s in sections if s not in available]
    if invalid:
        print(f"Warning: sections not found in all_sounds/: {invalid}")
    return sections


def add_page(config: dict) -> dict:
    """Interactively add a new page configuration."""
    page_num = input("PDF page number (integer): ").strip()
    if not page_num.isdigit():
        print("Invalid page number.")
        return config

    available = get_available_sections()
    sections = prompt_sections(available)
    if not sections:
        print("No sections selected.")
        return config

    title = input("Page title (e.g. 'Human Body'): ").strip()
    description = input("Page description (optional): ").strip()
    primary = sections[0]

    config["pages"][page_num] = {
        "pageNumber": int(page_num),
        "sections": sections,
        "dataFile": f"extracted_words/extracted_words_page{page_num}.json",
        "imageFile": f"images/page{page_num}.png",
        "title": title,
        "description": description,
        "primarySection": primary,
    }
    for sec in sections:
        config["sectionToPageMap"][sec] = int(page_num)

    return config


def generate_js(config: dict) -> str:
    """Generate the page-config.js content from the JSON config dict."""
    pages_js = json.dumps(config["pages"], ensure_ascii=False, indent=4)
    section_map_js = json.dumps(config["sectionToPageMap"], ensure_ascii=False, indent=4)

    return f"""// AUTO-GENERATED by tools/book_automation.py — do not edit manually
// Edit page_config_data.json and re-run tools/book_automation.py instead
class PageConfigManager {{
    pageConfigs = {pages_js};
    sectionToPageMap = {section_map_js};

    getPageConfig(pageOrSection) {{
        if (typeof pageOrSection === 'number') return this.pageConfigs[pageOrSection];
        const page = this.sectionToPageMap[pageOrSection];
        return page !== undefined ? this.pageConfigs[page] : null;
    }}

    getAllPageConfigs() {{
        return Object.values(this.pageConfigs);
    }}
}}
const pageConfigManager = new PageConfigManager();
"""


def main():
    config = load_config()
    print(f"Loaded config: {len(config['pages'])} pages")

    while True:
        print("\n[a] Add page  [g] Generate JS  [q] Quit")
        choice = input("> ").strip().lower()
        if choice == "a":
            config = add_page(config)
            save_config(config)
            print("Config saved.")
        elif choice == "g":
            js = generate_js(config)
            # Backup existing file
            if PAGE_CONFIG_FILE.exists():
                backup = PAGE_CONFIG_FILE.with_suffix(".js.bak")
                backup.write_text(PAGE_CONFIG_FILE.read_text(encoding="utf-8"), encoding="utf-8")
            PAGE_CONFIG_FILE.write_text(js, encoding="utf-8")
            print(f"Generated: {PAGE_CONFIG_FILE}")
        elif choice == "q":
            break


if __name__ == "__main__":
    main()
```

**Step 3: Commit**

```bash
git add tools/book_automation.py
git commit -m "feat: refactor book_automation - replace regex JS parsing with JSON+generate"
```

---

## Task 7: Copy Static Assets & Frontend

**Files:**
- Copy: `index.html`, `css/style.css`, `js/main.js`, `js/page-config.js`
- No changes to main.js or style.css (preserve functionality)

**Step 1: Copy files from original project**

```bash
cp E:\internship\PDF_seperation\PDF_separation_comb\index.html E:\internship\PDF_seperation\remake\
cp E:\internship\PDF_seperation\PDF_separation_comb\css\style.css E:\internship\PDF_seperation\remake\css\
cp E:\internship\PDF_seperation\PDF_separation_comb\js\main.js E:\internship\PDF_seperation\remake\js\
cp E:\internship\PDF_seperation\PDF_separation_comb\js\page-config.js E:\internship\PDF_seperation\remake\js\
```

**Step 2: Copy data assets (not PDF, not audio — those stay in place)**

```bash
# Copy lists and any existing extracted words
cp -r E:\internship\PDF_seperation\PDF_separation_comb\lists_output\ E:\internship\PDF_seperation\remake\lists_output\
# Copy existing extracted word JSONs if any
cp -r E:\internship\PDF_seperation\PDF_separation_comb\extracted_words\ E:\internship\PDF_seperation\remake\extracted_words\ 2>/dev/null || true
```

**Step 3: Update `index.html` server URL if needed**

The HTML file uses relative paths, so no changes needed.

**Step 4: Commit**

```bash
git add index.html css/ js/ lists_output/ extracted_words/
git commit -m "chore: copy static frontend assets and data from original project"
```

---

## Task 8: Integrate and Smoke Test

**Step 1: Run all unit tests**

```bash
cd E:\internship\PDF_seperation\remake
pytest tests/ -v
```

Expected: All green.

**Step 2: Start server and verify**

```bash
python server.py
```

Open browser: `http://localhost:8000`

Verify:
- [ ] Page loads without JS errors
- [ ] Word buttons appear on PDF image
- [ ] Clicking a word plays audio (if audio files symlinked/copied)
- [ ] API endpoints respond: `GET /api/get_wrong_words?pageId=7`

**Step 3: Test SRS API manually**

```bash
curl -X POST http://localhost:8000/api/srs/record \
  -H "Content-Type: application/json" \
  -d '{"pageId":"7","word":"skull","quality":5}'
# Expected: {"status":"ok","word":"skull","stage":1,...}

curl http://localhost:8000/api/srs/today?pageId=7
# Expected: {"page_id":"7","due_count":0,...}
```

**Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: complete refactoring - all modules integrated and tested"
```

---

## Task 9: Write README and Final Documentation

**Files:**
- Create: `remake/README.md`

```markdown
# PDF Word Separation — Refactored

Interactive English vocabulary learning system backed by PDF page images,
audio playback, and spaced repetition (SM-2 algorithm).

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python server.py
   ```

3. Open `http://localhost:8000/?page=7` in your browser.

## Project Structure

| Path | Description |
|---|---|
| `src/config/settings.py` | All constants and file paths |
| `src/core/srs_engine.py` | SM-2 spaced repetition algorithm |
| `src/core/audio_matcher.py` | Multi-strategy audio path resolver |
| `src/core/word_extractor.py` | PDF word coordinate extraction |
| `src/server/api_handlers.py` | Business logic for JSON API |
| `src/server/http_server.py` | HTTP routing and static file serving |
| `tools/book_automation.py` | Interactive page config generator |
| `server.py` | Server entry point |

## Running Tests

```bash
pytest tests/ -v
```

## Adding a New Page

```bash
python tools/book_automation.py
# Follow prompts → generates js/page-config.js automatically
```

## Architecture

```
Browser → server.py → src/server/http_server.py
                    ↓ (API routes)
              src/server/api_handlers.py
                    ↓ (domain logic)
              src/core/srs_engine.py
              src/core/audio_matcher.py
```

Data is persisted in `wrong_words_record/` as JSON files.
Configuration lives in `page_config_data.json` (source of truth for page-config.js).
```

**Commit:**

```bash
git add README.md
git commit -m "docs: add refactored project README with architecture overview"
```

---

## Checklist

- [ ] Task 1: Config module + project skeleton
- [ ] Task 2: SRS engine extracted with tests (7 tests)
- [ ] Task 3: AudioMatcher extracted with tests (4 tests)
- [ ] Task 4: WordExtractor refactored with tests (3 tests)
- [ ] Task 5: Server refactored (api_handlers + http_server + server.py)
- [ ] Task 6: book_automation.py replaced with JSON-based version
- [ ] Task 7: Static assets copied
- [ ] Task 8: Integration smoke test passes
- [ ] Task 9: README written

**Total tests: 14 unit tests + manual smoke test**
