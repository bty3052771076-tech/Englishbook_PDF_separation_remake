"""
Multi-strategy audio path resolver.

Mirrors the audio-finding logic in the original main.js, ported to Python
so server-side audio validation and pre-flight checks are possible.

Strategies (tried in order):
    1. Direct match:  {word}_uk.mp3, {word}_us.mp3, {word}_usuk.mp3, {word}_main_uk.mp3
    2. Numbered:      {word}_1_uk.mp3, {word}_2_uk.mp3, {word}_3_uk.mp3
    3. First word:    for multi-word phrases, try matching on first word only
    4. Cross-section: scan all sections as last resort (optional)
"""
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, List

from src.config.settings import SOUNDS_DIR

logger = logging.getLogger(__name__)

# Suffix variants tried for each candidate stem
_SUFFIXES = ["_uk.mp3", "_us.mp3", "_usuk.mp3", "_main_uk.mp3"]


@dataclass
class AudioMatch:
    """Holds a resolved audio file path and the strategy that found it."""
    path: Path
    strategy: str  # Which strategy succeeded, for debugging


class AudioMatcher:
    """Resolves a vocabulary word to its audio file path using multiple fallback strategies."""

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
            AudioMatch with .path and .strategy set, or None if not found.
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

        Returns a list of (filename, strategy) tuples in priority order.
        """
        normalized = word.lower().replace(" ", "_").replace("-", "_")
        candidates = []

        # Strategy 1: direct suffix combinations (uk, us, usuk, main_uk)
        for suffix in _SUFFIXES:
            candidates.append((f"{normalized}{suffix}", "direct"))

        # Strategy 2: numbered variants (e.g., tear_1_uk.mp3 for disambiguation)
        for n in range(1, 4):
            for suf in ["_uk.mp3", "_us.mp3"]:
                candidates.append((f"{normalized}_{n}{suf}", "numbered"))

        # Strategy 3: multi-word phrase → try first word alone
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
                    logger.debug(
                        "Cross-section fallback found '%s' in %s", word, section_dir.name
                    )
                    return AudioMatch(path=target, strategy="cross_section")
        return None
