"""Tests for AudioMatcher multi-strategy audio resolution."""
import pytest
from pathlib import Path
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
