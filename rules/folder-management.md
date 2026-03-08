# Folder Management Rules

## Root Folder Architecture

Excalivault uses a **single immutable root folder** as the foundation of the folder hierarchy.

### Root Folder Properties

**Hardcoded ID:** `root-folder-00000000-0000-0000-0000-000000000000`
- Prevents "ghost root" problem when syncing from multiple sources
- Acts as unique identifier for upsert operations

**Immutable:** Cannot be deleted or have siblings
- Protected at both UI and backend levels
- Acts as single entry point for all drawings

**Customizable:** Can be renamed, change color/icon
- User can personalize appearance without breaking architecture
- `isRoot: true` flag identifies it system-wide

### Auto-Creation

When app loads with no folders (GET_WORKSPACE handler):
```typescript
const ROOT_FOLDER_ID = "root-folder-00000000-0000-0000-0000-000000000000";

if (!existingRoot) {
  const rootFolder = {
    id: ROOT_FOLDER_ID,
    name: "My Drawings",
    parentId: null,
    color: "#10b981",
    icon: undefined,
    createdAt: now,
    updatedAt: now,
    isRoot: true,
  };
  typedFolders.push(rootFolder);
  await saveFolders(typedFolders);
}
```

## Uniqueness Rules

### No Duplicate Names at Same Level

Folders must have unique names within their parent (siblings):

```typescript
const hasDuplicate = typedFolders.some(
  (f) => f.parentId === targetParentId && f.name === payload.name,
);

if (hasDuplicate) {
  return {
    success: false,
    error: "A folder with this name already exists at this level",
  };
}
```

**UI Handling:**
- Check duplicates before showing success state
- Show error message: "A folder with this name already exists at this level"
- Revert optimistic update on failure

## No Siblings to Root

**Frontend Layer (folders.svelte.ts):**
```typescript
if (parentId === null && hasRootFolder) {
  const rootFolder = this.#folders.find((f) => f.isRoot);
  if (rootFolder) {
    parentId = rootFolder.id;
    this.expandFolder(rootFolder.id);
  }
}
```

**Backend Layer (background.ts):**
```typescript
if (targetParentId === null && typedFolders.some((f) => f.isRoot)) {
  return {
    success: false,
    error: "Cannot create top-level folders. Create folders inside root folder instead.",
  };
}
```

**Behavior:**
- If no folder selected when clicking "New Folder" → Creates under root
- Root auto-expands to show new folder
- Error message if attempting top-level creation

## Move Operations

### Move to Null Redirects to Root

When moving drawings to "Unfiled" (null folder):
```typescript
if (payload.folderId === null && typedFolders.some((f) => f.isRoot)) {
  const rootFolder = typedFolders.find((f) => f.id === ROOT_FOLDER_ID);
  if (rootFolder) {
    payload.folderId = rootFolder.id as string;
  }
}
```

**Result:** Drawings are always moved to root folder, not "Unfiled" state

### Root Cannot Be Moved

Root folder is immovable by definition (parentId is always null). No additional checks needed.

## Delete Protection

### UI Layer (FolderItemActions.svelte)

Hide delete button for root folder:
```svelte
{#if !isRoot}
  <DropdownMenuSeparator />
  <DropdownMenuItem class="text-destructive" onclick={onDelete}>
    <Trash2 size={11} />
    Delete folder
  </DropdownMenuItem>
{/if}
```

### Backend Layer (background.ts)

```typescript
const folderToDelete = typedFolders.find((f) => f.id === payload.id);
if (folderToDelete?.isRoot) {
  return {
    success: false,
    error: "Cannot delete root folder",
  };
}
```

### Store Layer (folders.svelte.ts)

```typescript
if (folder.isRoot) {
  this.#error = "Cannot delete root folder";
  return;
}
```

## Error Response Types

Both `CreateFolderResponse` and `DeleteFolderResponse` include optional `error` field:

```typescript
type CreateFolderResponse = {
  success: boolean;
  folders: FolderData[];
  error?: string;
};

type DeleteFolderResponse = {
  success: boolean;
  folders: FolderData[];
  drawings: DrawingData[];
  deletedSubfolderCount?: number;
  deletedDrawingCount?: number;
  error?: string;
};
```

**Store Handling:**
```typescript
const response = await folderService.createFolder(...);
if (!response.success) {
  this.#folders = this.#folders.filter((f) => f.id !== tempId);
  this.#error = response.error ?? "Failed to create folder";
  return;
}
```

## Storage Migration

No migration needed for existing data:
- `isRoot` is optional in `FolderData` interface
- Existing folders without `isRoot` field are treated as normal folders
- Root folder is created on next `GET_WORKSPACE` call if it doesn't exist

## Validation Checklist

When implementing folder-related features:

- [ ] Check for duplicate names at same level (CREATE_FOLDER)
- [ ] Prevent top-level folder creation when root exists
- [ ] Auto-assign root as parent when parentId is null
- [ ] Hide delete button for root folders in UI
- [ ] Block root deletion in backend
- [ ] Redirect move-to-null to root folder
- [ ] Expand root folder when creating child from "New Folder" button
- [ ] Use hardcoded ROOT_FOLDER_ID for consistency
