"""Tests for WordExtractor and WordEntry."""
import pytest
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
