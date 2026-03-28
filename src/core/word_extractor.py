"""
Word coordinate extractor for PDF pages.

Refactored from pdf_word_extractor.py:
- Magic numbers → src.config.settings
- 7-level nesting → focused helper functions
- Duplicate alias parsing → single _load_section_aliases()
- Cleaner separation: load → find → score → save
"""
import json
import logging
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
    """Represents a single word's bounding box and metadata on a PDF page."""
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
    Extracts word bounding boxes from a PDF page for given section(s).

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
            raise ValueError(
                f"Page {page_num} out of range (doc has {len(self._doc)} pages)"
            )

        page = self._doc[page_index]
        # Each element: (x0, y0, x1, y1, word, block_no, line_no, word_no)
        pdf_words = page.get_text("words")

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
    # Private helpers: loading
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

        Example: "tear_duct_uk.mp3" → word "tear duct" gets alias stem "tear_duct".
        """
        section_dir = SOUNDS_DIR / section
        aliases: Dict[str, List[str]] = {}
        if not section_dir.is_dir():
            return aliases

        for f in section_dir.glob("*.mp3"):
            stem = f.stem  # e.g. "tear_duct_uk"
            # Strip known pronunciation suffixes to get the base stem
            for suffix in ("_uk", "_us", "_usuk", "_main_uk", "_main_us"):
                if stem.endswith(suffix):
                    stem = stem[: -len(suffix)]
                    break
            word = stem.replace("_", " ")
            aliases.setdefault(word, []).append(stem)

        return aliases

    # ------------------------------------------------------------------
    # Private helpers: extraction
    # ------------------------------------------------------------------

    def _extract_section_words(
        self,
        pdf_words: list,
        word_list: List[Tuple[int, str]],
        aliases: Dict[str, List[str]],
        section: str,
    ) -> List[WordEntry]:
        """Two-pass extraction: phrases first, then single words."""
        results = []
        found_phrase_boxes: List[Tuple[float, float, float, float]] = []

        # First pass: find multi-word phrases (must be done before singles
        # so their positions can be excluded from single-word search)
        for number, word in word_list:
            if " " not in word:
                continue
            entry = self._find_phrase(pdf_words, word, section, number)
            if entry:
                results.append(entry)
                found_phrase_boxes.append((entry.x0, entry.y0, entry.x1, entry.y1))

        phrase_words = {e.word for e in results}

        # Second pass: single words with anchor-based disambiguation
        for i, (number, word) in enumerate(word_list):
            if word in phrase_words:
                continue
            neighbors = [
                word_list[i - 1][1] if i > 0 else None,
                word_list[i + 1][1] if i < len(word_list) - 1 else None,
            ]
            entry = self._find_single_word(
                pdf_words, word, aliases.get(word, []),
                section, number, neighbors, found_phrase_boxes,
            )
            if entry:
                results.append(entry)

        results.sort(key=lambda e: (e.section, e.number))
        return results

    def _find_phrase(
        self, pdf_words: list, phrase: str, section: str, number: int
    ) -> Optional[WordEntry]:
        """Locate a multi-word phrase using proximity matching."""
        parts = phrase.lower().split()
        if not parts:
            return None

        # Find all occurrences of the first word as anchor candidates
        first_candidates = [w for w in pdf_words if w[4].lower() == parts[0]]

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
                # Merge all matched word boxes into one bounding box
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
        """Find the next word in a phrase following `prev`, using proximity rules."""
        px0, py0, px1 = prev[0], prev[1], prev[2]

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

        # Expand box slightly when aliases are used (audio stem may differ from display text)
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
        Pick the best candidate by proximity to neighboring words.
        Falls back to topmost-leftmost if no neighbors are located on the page.
        """
        if len(candidates) == 1:
            return candidates[0]

        # Collect center positions of neighbors that appear on this page
        anchors = []
        for neighbor in neighbors:
            if neighbor is None:
                continue
            for w in all_pdf_words:
                if w[4].lower() == neighbor.lower():
                    anchors.append(((w[0] + w[2]) / 2, (w[1] + w[3]) / 2))
                    break

        if not anchors:
            # No anchor found: choose topmost, then leftmost
            return min(candidates, key=lambda w: (w[1], w[0]))

        def anchor_score(cand):
            cx = (cand[0] + cand[2]) / 2
            cy = (cand[1] + cand[3]) / 2
            return min((cx - ax) ** 2 + (cy - ay) ** 2 for ax, ay in anchors)

        return min(candidates, key=anchor_score)

    def _overlaps_any(self, word_tuple: tuple, boxes: List[Tuple]) -> bool:
        """Return True if the word rect overlaps any of the given bounding boxes."""
        wx0, wy0, wx1, wy1 = word_tuple[0], word_tuple[1], word_tuple[2], word_tuple[3]
        for bx0, by0, bx1, by1 in boxes:
            if wx0 < bx1 and wx1 > bx0 and wy0 < by1 and wy1 > by0:
                return True
        return False
