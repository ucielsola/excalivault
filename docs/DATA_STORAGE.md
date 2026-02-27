# Data Storage Architecture

## Data Structure

Drawings and folders stored in `browser.storage.local` with a one-to-many relationship (one folder can have many drawings).

### Folder Structure

```typescript
{
  id: string; // Unique folder ID (format: `folder:{timestamp}-{random}`)
  name: string; // Folder title
  parentId: string | null; // ID of parent folder (null for root-level folders)
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}
```

### Drawing Structure

```typescript
{
  id: string;                    // Unique drawing ID (format: `drawing:{timestamp}-{random}`)
  folderId: string | null;       // ID of parent folder (null for root-level drawings)
  name: string;                  // Drawing title
  elements: string;              // JSON string of Excalidraw elements
  appState: string;              // JSON string of Excalidraw app state
  versionFiles: string;          // Version info (from localStorage)
  versionDataState: string;      // Version data state (from localStorage)
  imageBase64?: string;          // 80x80 thumbnail (PNG, data URI)
  viewBackgroundColor?: string;  // Canvas background color
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
}
```

## Storage Keys

- `excalivault_folders` - Array of all folders
- `excalivault_drawings` - Array of all drawings
- `excalivault_drawing_to_inject` - Temporary storage for opening saved drawings

## Save Flow

1. **Extract from Excalidraw** (content script, `background.ts:144-194`)
   - Reads from Excalidraw's localStorage:
     - `excalidraw` → `elements`
     - `excalidraw-state` → `appState`
     - `version-files` → `versionFiles`
     - `version-dataState` → `versionDataState`
   - Captures 80x80 thumbnail via canvas screenshot
   - Generates ID if new drawing

2. **Persist** (`background.ts:75-119`)
   - Checks `excalivault_drawings` array in `browser.storage.local`
   - Updates existing or pushes new entry
   - Sets `updatedAt` timestamp (preserves `createdAt` for updates)
   - Optional: assign `folderId` to place drawing in specific folder

## Folder Management

**Create:** Generate folder ID with `folder:` prefix and `parentId` for hierarchy

**Update:** Rename folder by updating name and `updatedAt` timestamp

**Delete:** Cascade delete - removes folder and all drawings with matching `folderId`

**Move:** Update drawing's `folderId` to new folder ID or `null` for root

## Load Flow

**List workspace:** Read both `excalivault_folders` and `excalivault_drawings` from storage → return both arrays

**Open drawing:**

1. Store data in `excalivault_drawing_to_inject` key
2. Open new tab to `https://excalidraw.com/`
3. Content script (`excalidraw-content/index.ts`) injects data back to Excalidraw's localStorage
4. Reloads page to load drawing

## Data Migration

On first load, existing drawings are automatically migrated:

- Adds `folderId: null` to all pre-existing drawings
- Creates `excalivault_folders` array if missing

## Message Protocol

Communication via `browser.runtime.sendMessage()`:

| Message            | Payload                                           | Response                                                            |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| `GET_WORKSPACE`    | none                                              | `{ folders: FolderData[], drawings: DrawingData[] }`                |
| `SAVE_DRAWING`     | `SaveDrawingData` (includes optional `folderId`)  | `{ success: true, drawings: DrawingData[] }`                        |
| `DELETE_DRAWING`   | `{ id: string }`                                  | `{ success: true, drawings: DrawingData[] }`                        |
| `GET_DRAWING_DATA` | none                                              | `{ id, title, elements, appState, imageBase64 }`                    |
| `OPEN_DRAWING`     | `OpenDrawingMessage`                              | `{ success: true }`                                                 |
| `CREATE_FOLDER`    | `{ name: string, parentId?: string \| null }`     | `{ success: true, folders: FolderData[] }`                          |
| `UPDATE_FOLDER`    | `{ id: string, name: string }`                    | `{ success: true, folders: FolderData[] }`                          |
| `DELETE_FOLDER`    | `{ id: string }`                                  | `{ success: true, folders: FolderData[], drawings: DrawingData[] }` |
| `MOVE_DRAWING`     | `{ drawingId: string, folderId: string \| null }` | `{ success: true, drawings: DrawingData[] }`                        |

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│     Side Panel (VaultList.svelte & Folders.svelte.ts) │
│                             ↓                       │
│   Data Services (drawingService.ts & folderService.ts) │
│                             ↓ (browser.runtime.sendMessage)
│             Background Script (background.ts)           │
│                             ↓ (browser.storage.local)   │
│                    Extension Storage                    │
└─────────────────────────────────────────────────────────┘
```

Content scripts (`excalidraw-content/index.ts`) continue to handle Excalidraw localStorage bridging and are unaware of folder architecture.
