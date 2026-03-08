# Stack
- Svelte 5 + TypeScript
- WXT (Web Extension Framework)
- Tailwind CSS v4
- Chrome Extension API (webextension-polyfill)
- Browser Storage API

# Architecture
Chrome Extension with 3 entrypoints:

1. **Background Script** (`background.ts`): Service worker handling storage and message routing
2. **Content Script** (`excalidraw-content/`): Injected into excalidraw.com, monitors canvas changes
3. **Side Panel** (`sidepanel/`): Svelte app UI for managing drawings/folders

# Data Flow

**Save Drawing:**
1. Content script detects changes (pointerup/keyup) → Background `DRAWING_CHANGED` message
2. Side panel requests data → Background runs `executeScript` → Reads Excalidraw localStorage
3. Side panel sends `SAVE_DRAWING` → Background writes to `browser.storage.local`
4. Storage keys: `excalivault_drawings`, `excalivault_folders`

**Open Drawing:**
1. Side panel sends `OPEN_DRAWING` with drawing data → Background sets `excalivault_drawing_to_inject`
2. Background opens excalidraw.com tab → Content script injects data into Excalidraw localStorage
3. Page reloads → Excalidraw loads the drawing

**State Management:**
- Svelte stores (`drawings`, `folders`, `vaultActions`, `dialogStore`, etc.)
- `drawingService` wraps runtime messaging
- Content hash (`contentHash`) tracks drawing changes for unsaved detection

# Key Types
- `DrawingData`: id, name, elements (JSON string), appState, folderId, timestamps
- `FolderData`: id, name, parentId, color, icon, timestamps
- `MessageType` enum: Message types for runtime communication

# Coding Rules
See `/rules/` for architectural patterns and coding standards:
- [State Management](./rules/state-management.md) - Store pattern, service layer usage
- [File Structure](./rules/file-structure.md) - src/lib/ organization, naming conventions
