# Excalivault

Personal vault for storing Excalidraws - Chrome extension built with WXT, Svelte 5, Tailwind 4, and DaisyUI.

## Tech Stack

- **WXT** - Web extension framework
- **Svelte 5** - Reactive UI framework with runes
- **TypeScript** - Type safety
- **Tailwind 4** - Utility-first CSS
- **DaisyUI** - Tailwind component library

## Setup

```bash
pnpm install
```

## Development

```bash
# Chrome (default)
pnpm dev

# Firefox
pnpm dev:firefox
```

## Build

```bash
# Chrome
pnpm build

# Firefox
pnpm build:firefox

# Create zip package
pnpm zip
```

## Using Just (recommended)

```bash
just install   # pnpm install
just dev       # pnpm dev
just build     # pnpm build
just status     # git status
just test       # build + load instructions
```

## Project Structure

```
src/
├── entrypoints/
│   ├── popup/          # Extension popup UI
│   ├── options/         # Options/settings page
│   ├── background.ts    # Background service worker
│   └── content.ts      # Content scripts
├── lib/               # Shared components
├── assets/            # Compiled assets
├── public/            # Static files (icons, etc.)
└── app.css            # Global styles (Tailwind)
```

## Loading Extension

1. Run `pnpm build`
2. Open `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select `.output/chrome-mv3/`
