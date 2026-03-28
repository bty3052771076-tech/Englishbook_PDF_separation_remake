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
