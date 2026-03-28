"""
API request handlers extracted from server.py.

Each handler is a plain function taking (page_id, body_dict) -> response_dict,
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
    """Write JSON atomically via tempfile -> rename to prevent corruption."""
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
