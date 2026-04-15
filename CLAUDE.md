# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Scrape-Go** is a Chrome browser extension for scraping social media and e-commerce data. Currently supports scraping Xiaohongshu (小红书) notes. Built with WXT framework, React + shadcn/ui for UI, Tailwind CSS for styling, and TypeScript throughout.

## Key Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm zip              # Package extension as zip (Chrome)
pnpm zip:firefox      # Package extension as zip (Firefox)
pnpm test             # Run tests with Vitest
pnpm test:ui          # Run tests with Vitest UI
pnpm test:run         # Run tests once and exit
pnpm compile          # TypeScript type checking (no emit)
```

Adding new shadcn/ui components:
```bash
pnpm dlx shadcn@latest add <component-name> --cwd . --path src/components/ui
```

## Architecture

### Extension Entry Points (WXT)

- **`src/entrypoints/background.ts`** — Background service worker. Handles `onInstalled` (initializes default settings), `action.onClicked` (opens side panel), and message routing between content scripts and storage. Listens for `SCRAPED_DATA`, `GET_SETTINGS`, `UPDATE_SETTINGS` message types.
- **`src/entrypoints/content/index.ts`** — Content script injected on `*.xiaohongshu.com/*`. Injects floating "采集"/"下载" buttons on the page. Listens for `SCRAPE_PAGE` messages from sidepanel/background, scrapes page DOM, and sends results to background via `browser.runtime.sendMessage`.
- **`src/entrypoints/sidepanel/App.tsx`** — Browser side panel UI. Displays scraped data cards, provides buttons to scrape current page, refresh data, export JSON, and clear all data. Communicates with content script via `browser.tabs.sendMessage`.
- **`src/entrypoints/options/App.tsx`** — Full settings/options page with sidebar navigation. Manages scraping, storage, notification settings, data import/export, help, and about sections. Uses `sonner` for toast notifications.

### Data Flow

1. User clicks "采集" button (in page or sidepanel)
2. `SCRAPE_PAGE` message sent to content script via `browser.tabs.sendMessage`
3. Content script scrapes DOM → builds `ScrapedData` object
4. Content script sends `SCRAPED_DATA` to background via `browser.runtime.sendMessage`
5. Background saves to `browser.storage.local`, deduplicates by `data.id` + `platform`
6. Sidepanel reads from `browser.storage.local` to display data

### Key Directories

| Path | Purpose |
|------|---------|
| `src/entrypoints/` | WXT entry points (background, content, sidepanel, options) |
| `src/scrapers/` | Scraper classes (e.g. `XiaohongshuScraper`) — static utility methods |
| `src/components/ui/` | shadcn/ui components (button, card, dialog, form, etc.) |
| `src/components/` | Shared components (e.g. `ThemeSwitcher`) |
| `src/hooks/` | React custom hooks (e.g. `useTheme`) |
| `src/types/` | TypeScript interfaces and default values |
| `src/lib/` | Utility functions (`cn` for className merging) |
| `src/entrypoints/options/components/` | Options page sub-components (Sidebar, Settings panels, etc.) |
| `src/entrypoints/options/lib/` | Options page helpers (settings storage, export, etc.) |

### Type System

All types defined in `src/types/index.ts`:
- `XiaohongshuNote` — scraped note data structure
- `ScrapedData` — wrapper with platform, url, timestamp, data payload
- `ScrapingSettings`, `StorageSettings`, `NotificationSettings` — settings interfaces
- `Settings` — top-level settings object combining all three
- `DataStats` — data statistics (counts, storage used)
- `Platform` — union type: `'xiaohongshu' | 'douyin' | 'kuaishou' | 'bilibili' | 'weibo' | 'taobao'`

### Storage Keys

All persisted via `browser.storage.local`:
- `settings` — `Settings` object
- `dataStats` — `DataStats` object
- `scrapedData` — array of `ScrapedData` objects

Settings helpers live in `src/entrypoints/options/lib/settings.ts`.

### Manifest Permissions

`storage`, `activeTab`, `tabs`, `scripting`, `sidePanel` with host permissions for `*.xiaohongshu.com/*` and `*.xhslink.com/*`.

## Adding a New Scraper

1. Create `src/scrapers/<platform>.ts` with a scraper class
2. Export it from `src/scrapers/index.ts`
3. Add the platform to the `Platform` type in `src/types/index.ts`
4. Update `src/entrypoints/content/index.ts` to match the new domain (`matches` array) and add scraping logic
5. Update sidepanel `App.tsx` to render the new platform's data cards
