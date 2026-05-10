# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bible Flow is a Chrome Extension (Manifest V3) that provides instant Hindi and English Bible verse lookup through a dropdown selector interface. Users select Testament → Book → Chapter → Verses, then copy selected verses to clipboard.

## Bible Versions

- **Hindi:** BSI (Bible Society of India) Version
- **English:** TLV (Tree of Life Version)

## Running the Extension

To test locally:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `bible-flow/` directory
4. The extension icon appears in the toolbar; click it to open the popup

No build step required — this is a pure static extension with no bundler.

## Architecture

**Data Flow:**
- `bible.json` contains the complete Hindi Bible (embedded in extension)
- Falls back to `bolls.life` API when local data fails or has empty chapters
- Chapter data is cached in memory via `state.chapterCache`

**UI Flow:**
1. User selects Testament → enables Book dropdown
2. User selects Book → populates Chapter dropdown
3. User selects Chapter → loads and renders verses from local JSON or API
4. User selects verses → auto-copies to clipboard (if enabled)
5. Recent copies stored in `localStorage` history

**Key Files:**
- `popup.js` — Main logic (9 sections: Config, Book Data, State, DOM, Utils, Data Loading, Dropdown Functions, Event Handlers, Init)
- `popup.html` — Extension popup UI with selectors and verse list
- `styles.css` — Glassmorphism design system with CSS variables for theming
- `bible.json` — Hindi Bible data (Book → Chapter → Verse structure)

**Verse ID Format:** Verse IDs use `BBCCVVV` format (e.g., `50004001` = Book 50, Chapter 4, Verse 1)

## Configuration

Edit `CONFIG` object in `popup.js` to modify:
- `LOCAL_BIBLE_PATH` — Path to embedded Bible data
- `API_BASE` — External API fallback endpoint
- `API_TRANSLATIONS` — Translation codes to try as fallback
- `MAX_HISTORY` — Number of recent copies to remember
- `COPY_BADGE_MS` — Duration of "Copied!" notification

## Features

- Dark/Light theme toggle (persisted in localStorage)
- Auto-copy on verse selection (toggleable)
- Recent copies history with click-to-restore
- API fallback when local data is incomplete
- Dual-language book names (Hindi + English)