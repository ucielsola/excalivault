# Dialog Pattern Rules

## Overview

Excalivault uses two distinct dialog patterns depending on the use case and complexity:

1. **DialogManager-managed dialogs** - Centralized state, type-safe, for confirmations
2. **Standalone dialogs** - Direct props, parent-managed state, for complex flows

---

## DialogManager-Managed Dialogs

### When to Use

- **Confirmation dialogs** (delete, overwrite, dangerous actions)
- **Simple single-step workflows**
- When you need **type safety** on dialog types
- When the dialog **should be accessible globally**

### Architecture

**Dialog Types** (`src/lib/stores/dialogStore.svelte.ts`):
```typescript
type DialogType = "overwrite" | "delete" | "delete_all";
```

**Dialog Config**:
```typescript
type DialogConfig = {
  type: DialogType;
  data?: {
    // Optional data for the dialog
    drawingName?: string;
    itemName?: string;
    itemType?: "drawing" | "folder";
    subfolderCount?: number;
    drawingCount?: number;
  };
  onConfirm: () => void;  // Confirmed action
  onCancel: () => void;   // Cancelled action
};
```

### Opening a Dialog

```typescript
// In store or component
async handleDeleteItem(id: string) {
  const item = store.items.find(i => i.id === id);
  dialogStore.open(
    "delete",
    this.confirmDelete.bind(this),
    () => this.cancelDelete(),
    {
      itemName: item.name,
      itemType: "drawing",
    },
  );
}

async confirmDelete(): Promise<void> {
  await store.delete(item.id);
  dialogStore.close();
}

cancelDelete(): void {
  dialogStore.close();
}
```

### Dialog Component Pattern

**Props Interface** (required):
```typescript
interface Props {
  open: boolean;              // Controlled by DialogManager
  onConfirm: () => void;     // Called when user confirms
  onCancel: () => void;      // Called when user cancels
}
```

**Optional** `handleOpenChange` for cleanup:
```typescript
<script lang="ts">
  import { dialogStore } from "$lib/stores";

  let { open, onConfirm, onCancel }: Props = $props();

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      dialogStore.close();  // Ensure store is synced
    }
  }
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent class="max-w-75">
    <!-- Dialog content -->
  </DialogContent>
</Dialog>
```

### DialogManager Integration

**`src/lib/components/excalivault/dialogs/DialogManager.svelte`**:
```svelte
{#if dialogStore.activeDialog}
  {#if dialogStore.activeDialog.type === "overwrite"}
    <OverwriteConfirmDialog
      open={true}
      drawingName={dialogStore.activeDialog.data?.drawingName ?? ""}
      onConfirm={dialogStore.activeDialog.onConfirm}
      onCancel={dialogStore.activeDialog.onCancel}
    />
  {:else if dialogStore.activeDialog.type === "delete"}
    <DeleteConfirmDialog
      open={true}
      itemName={dialogStore.activeDialog.data?.itemName ?? ""}
      itemType={dialogStore.activeDialog.data?.itemType ?? "drawing"}
      subfolderCount={dialogStore.activeDialog.data?.subfolderCount ?? 0}
      subfolderDrawingCount={dialogStore.activeDialog.data?.drawingCount ?? 0}
      onConfirm={dialogStore.activeDialog.onConfirm}
      onCancel={dialogStore.activeDialog.onCancel}
    />
  {/if}
{/if}
```

---

## Standalone Dialogs

### When to Use

- **Multi-step workflows** with local state
- **Reusable components** used in multiple places (not globally accessible)
- When dialog **needs complex internal state** not suited for centralized store
- **Inline panels** (SavePanel) that are part of main view

### Architecture

**Parent-managed state**:
```typescript
// Parent component
let dialogOpen = $state(false);

function handleOpen() {
  dialogOpen = true;
}

function handleClose() {
  dialogOpen = false;
}
```

**Dialog component**:
```typescript
interface Props {
  open: boolean;
  currentFolderId: string | null;
  onMove: (folderId: string | null) => void;
  onCancel: () => void;
}
```

### Example: FolderSelectDialog

**Parent (SavePanel)**:
```svelte
<script>
  let folderSelectOpen = $state(false);

  function handleFolderSelect(folderId: string | null) {
    vaultList.saveFolderId = folderId;
    folderSelectOpen = false;
  }
</script>

<FolderSelectDialog
  open={folderSelectOpen}
  currentFolderId={saveFolderId}
  onMove={handleFolderSelect}
  onCancel={() => folderSelectOpen = false}
/>
```

**Dialog component**:
```svelte
<script lang="ts">
  let { open, currentFolderId, onMove, onCancel }: Props = $props();

  let selectedFolderId = $state<string | null>(currentFolderId);

  function handleMove() {
    onMove(selectedFolderId);
  }
</script>

<Dialog {open}>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>Move to folder</DialogTitle>
    </DialogHeader>

    <!-- Folder selection UI -->

    <DialogFooter>
      <Button variant="outline" onclick={onCancel}>Cancel</Button>
      <Button onclick={handleMove}>Move</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Panels (Non-Dialog Overlays)

### When to Use

- **Inline interfaces** that slide up/fade in
- **Persistent UI elements** that are part of main view
- **Complex forms** that need more space than a modal provides

### Example: SavePanel

**Not a dialog** - it's a panel controlled by `vaultList.savePanelOpen`:

```svelte
{#if vaultList.savePanelOpen}
  <div class="bg-card border-primary/20 border-t">
    <!-- Panel content -->
  </div>
{/if}
```

---

## Common Dialog Patterns

### 1. Confirmation Dialog (Type-to-Confirm)

**Use case**: Dangerous actions requiring explicit confirmation

```svelte
<script>
  let confirmText = $state("");
  const CONFIRM_TEXT = "EXCALIVAULT";

  let canConfirm = $derived(
    confirmText.trim() === CONFIRM_TEXT,
  );

  async function handleConfirm() {
    await onConfirm();
    // Show success state
    phase = "deleted";
    setTimeout(() => onCancel(), 3000);
  }
</script>

<div class="space-y-3">
  <DialogDescription>
    This will permanently delete all your drawings and folders.
  </DialogDescription>

  <div class="bg-destructive/5 border-destructive/20 rounded-md border p-3">
    <p class="text-destructive text-[11px] font-medium">
      Type to confirm: <span class="font-mono">{CONFIRM_TEXT}</span>
    </p>
  </div>

  <div class="space-y-1.5">
    <label for="confirm-input">Type {CONFIRM_TEXT} to continue</label>
    <input
      id="confirm-input"
      type="text"
      bind:value={confirmText}
      placeholder={CONFIRM_TEXT}
    />
  </div>
</div>

<DialogFooter>
  <Button variant="outline" onclick={onCancel}>Cancel</Button>
  <Button variant="destructive" onclick={handleConfirm} disabled={!canConfirm}>
    Delete all data
  </Button>
</DialogFooter>
```

### 2. Input Dialog

**Use case**: User needs to provide data (name, title, etc.)

```svelte
<script>
  let name = $state("");
  let initialName = $derived(drawingTitle || "");

  $effect(() => {
    if (!name && initialName) {
      name = initialName;  // Auto-fill on open
    }
  });

  async function handleSave() {
    if (!name.trim()) return;
    isSaving = true;
    await onSave(name);
    isSaving = false;
  }
</script>

<div class="flex flex-col gap-1.5">
  <Label for="name-input">Name</Label>
  <Input
    id="name-input"
    bind:value={name}
    placeholder="e.g. Architecture Diagram"
    onkeydown={(e) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") onCancel();
    }}
  />
</div>
```

### 3. Multi-Phase Dialog

**Use case**: Show different states (confirming → processing → done)

```svelte
<script>
  let phase = $state<"confirm" | "deleted">("confirm");

  async function handleConfirm() {
    await onConfirm();
    phase = "deleted";
    setTimeout(() => onCancel(), 3000);
  }
</script>

{#if phase === "confirm"}
  <!-- Confirmation UI -->
{:else if phase === "deleted"}
  <!-- Success UI -->
{/if}
```

---

## Anti-Patterns

### ❌ Don't: Add Outer Wrappers with Headers

**Problem**: Creates duplicate headers when dialog opens

```svelte
<!-- BAD -->
<div class="flex h-full flex-col">
  <div class="border-border ...">
    <VaultLogo size="small" />
  </div>

  {#if open}
    <Dialog {open}>
      <!-- Content -->
    </Dialog>
  {/if}
</div>
```

**Solution**: Dialog should be self-contained

```svelte
<!-- GOOD -->
{#if open}
  <Dialog {open}>
    <DialogContent>
      <!-- Content -->
    </DialogContent>
  </Dialog>
{/if}
```

### ❌ Don't: Call `dialogStore.close()` in `onConfirm`

**Problem**: Parent should control dialog lifecycle

```typescript
// BAD
async confirmDelete(): Promise<void> {
  await store.delete(item.id);
  dialogStore.close();  // Don't do this
}
```

**Solution**: DialogManager or parent controls closing

```typescript
// GOOD
async confirmDelete(): Promise<void> {
  await store.delete(item.id);
  // DialogManager will close when phase changes
  phase = "deleted";
  setTimeout(() => {
    dialogStore.close();  // Or parent's onCancel
  }, 3000);
}
```

### ❌ Don't: Mix Patterns Unnecessarily

**Problem**: Simple confirmations don't need standalone dialogs

```svelte
<!-- BAD: Confirmation dialog using standalone pattern -->
<script>
  let confirmDialogOpen = $state(false);
</script>

{#if confirmDialogOpen}
  <SomeStandaloneConfirmDialog />
{/if}
```

**Solution**: Use DialogManager for simple confirmations

```typescript
// GOOD: Use dialogStore
dialogStore.open("delete", onConfirm, onCancel, { itemName });
```

---

## Best Practices

1. **Consistent Props Interface** - All DialogManager dialogs use `{ open, onConfirm, onCancel }`

2. **Type Safety** - Add new dialog types to `DialogType` enum in `dialogStore.svelte.ts`

3. **Keyboard Support** - Always handle Enter (confirm) and Escape (cancel) in input dialogs

4. **Loading States** - Show loading indicators for async operations:
   ```svelte
   <Button onclick={handleSave} disabled={!name.trim() || isSaving}>
     {#if isSaving}
       <div class="animate-spin ..."></div>
       Saving...
     {:else}
       Save
     {/if}
   </Button>
   ```

5. **Success Feedback** - Show confirmation state before closing:
   ```svelte
   {#if phase === "deleted"}
     <CheckCircle class="text-green-500" />
     <p>All data deleted.</p>
   {/if}
   ```

6. **No Outer Wrappers** - Dialogs should be self-contained inside `{#if open}` block

7. **DialogManager First** - Use DialogManager for all confirmations, use standalone only when truly needed

8. **Consistent Styling** - Use Dialog components from `src/lib/components/ui/dialog/`
   - `DialogContent` for proper spacing and overflow
   - `DialogHeader` for consistent header layout
   - `DialogFooter` for button alignment

---

## File Location

All dialog components live in: `src/lib/components/excalivault/dialogs/`

**DialogManager-managed dialogs**:
- `DeleteConfirmDialog.svelte`
- `OverwriteConfirmDialog.svelte`
- `DeleteAllConfirmDialog.svelte`

**Standalone dialogs**:
- `FolderSelectDialog.svelte`
- `SaveCurrent.svelte` (used by WelcomeScreen)

**Panels**:
- `SavePanel.svelte`

**Utilities**:
- `KeyboardEventHandler.svelte` - Not a dialog, keyboard shortcut helper
- `DialogManager.svelte` - Central dialog router

---

## Quick Reference

| Pattern | Use Case | Example | State Management |
|----------|------------|----------|------------------|
| DialogManager | Simple confirmations, type-safe | DeleteConfirmDialog | `dialogStore.activeDialog` |
| Standalone | Multi-step, reusable, complex | FolderSelectDialog | Parent component state |
| Panel | Inline UI, main view part | SavePanel | Store state (`vaultList.savePanelOpen`) |
