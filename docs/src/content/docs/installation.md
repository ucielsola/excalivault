---
title: Installation
description: How to install and set up Excalivault Chrome extension
---

# Installation

## Chrome Web Store

Excalivault is available on the [Chrome Web Store](#).

## Manual Installation

For development or to use the latest version:

1. **Download the extension**:
   ```bash
   pnpm build
   # The extension will be in .output/chrome-mv3/
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions`
   - Enable **Developer Mode**
   - Click **Load unpacked**
   - Select the `.output/chrome-mv3/` folder

3. **Grant Permissions**:
   - Excalivault requires access to:
     - `storage` - For saving drawings and folders
     - `sidePanel` - For the vault interface
     - `activeTab` - For accessing Excalidraw pages

## After Installation

Once installed:

1. Open the side panel by clicking the Excalivault icon
2. Navigate to [excalidraw.com](https://excalidraw.com)
3. Create a drawing
4. Click "Save to Vault" in the side panel

## Screenshots

:::placeholder
Main vault interface with folders and drawings
:::

:::placeholder
Saving a drawing from Excalidraw
:::
