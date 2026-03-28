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

Expected: 14 passed (SRS engine × 7, AudioMatcher × 4, WordExtractor × 3)

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
              src/core/word_extractor.py
```

Data is persisted in `wrong_words_record/` as JSON files.
Configuration lives in `page_config_data.json` (source of truth for `js/page-config.js`).

## Refactoring Goals Achieved

- **Magic numbers eliminated**: all thresholds live in `src/config/settings.py`
- **7-level nesting removed**: `word_extractor.py` uses focused helper methods
- **Fragile regex parsing replaced**: `book_automation.py` reads/writes JSON directly
- **SM-2 algorithm isolated**: `srs_engine.py` is a standalone testable class
- **14 unit tests added**: covering all core domain logic
- **Structured logging**: every module uses `logging.getLogger(__name__)`
