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
    # 持续"遗忘"，EF 不能低于 SRS_EASE_MIN=1.3
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
    item.next_due_time = datetime(2000, 1, 1)  # 很早以前
    assert engine.is_due_now(item) is True


def test_serialize_deserialize_roundtrip(engine):
    item = engine.new_item("tear duct")
    item = engine.record_review(item, quality=5)
    data = engine.to_dict(item)
    restored = engine.from_dict(data)
    assert restored.word == item.word
    assert restored.stage == item.stage
    assert abs(restored.ef - item.ef) < 0.001
