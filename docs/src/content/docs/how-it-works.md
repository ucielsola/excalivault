---
title: How It Works
description: Understanding Excalivault's architecture and data flow
---

# How It Works

Excalivault is a Chrome extension that helps you save and organize Excalidraw drawings. Here's how the pieces fit together:

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│     Side Panel (Vault Interface)                         │
│     - Browse folders                                     │
│     - View drawings with thumbnails                      │
│     - Save current Excalidraw drawing                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│     Background Service Worker                           │
│     - Manages storage operations                        │
│     - Coordinates between content scripts and UI        │
│     - Handles folder/drawing CRUD operations             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│     Browser Storage (chrome.storage.local)              │
│     - Stores drawings (elements, appState, thumbnails)   │
│     - Stores folders (nested structure)                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│     Excalidraw Content Script                           │
│     - Injects/extracts data from Excalidraw.com        │
│     - Bridges extension storage and Excalidraw         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Saving a Drawing

1. You create a drawing on [excalidraw.com](https://excalidraw.com)
2. Click "Save to Vault" in the side panel
3. The background script:
   - Reads data from Excalidraw's localStorage
   - Captures a 80x80 thumbnail
   - Stores everything in `chrome.storage.local`
4. The drawing appears in your vault with a thumbnail

### Loading a Drawing

1. Click on a saved drawing in the vault
2. The extension:
   - Stores drawing data in temporary storage
   - Opens a new tab to excalidraw.com
   - The content script injects the data back into Excalidraw
   - Your drawing is restored!

## Data Structure

**Folder:**
```typescript
{
  id: string;              // Unique ID
  name: string;            // Folder title
  parentId: string | null; // Parent folder (null for root)
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
}
```

**Drawing:**
```typescript
{
  id: string;              // Unique ID
  folderId: string | null; // Parent folder
  name: string;            // Drawing title
  elements: string;        // JSON of Excalidraw elements
  appState: string;        // JSON of Excalidraw app state
  imageBase64?: string;    // 80x80 thumbnail (PNG)
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
}
```

## Tech Stack

- **WXT** - Web extension framework
- **Svelte 5** - Reactive UI with runes
- **TypeScript** - Type safety
- **Tailwind 4** - Utility-first CSS
- **DaisyUI** - Component library

## Privacy & Security

- ✅ All data stored locally in your browser
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Works offline (once Excalidraw is loaded)

:::placeholder
Architecture diagram showing data flow
:::
