<script lang="ts">
  import {
    CopyPlus,
    EllipsisVertical,
    FolderInput,
    Pencil,
    Trash2,
  } from "@lucide/svelte";

  import { FolderSelectDialog } from "$lib/components/excalivault/dialogs";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { drawings } from "$lib/stores";

  interface Props {
    onDuplicate: () => void;
    onStartRename: () => void;
    onDelete: () => void;
    drawingId: string;
    currentFolderId: string | null;
  }

  let {
    onDuplicate,
    onStartRename,
    onDelete,
    drawingId,
    currentFolderId,
  }: Props = $props();

  let isMoveDialogOpen = $state(false);

  function handleOpenMoveDialog() {
    isMoveDialogOpen = true;
  }

  function handleCloseMoveDialog() {
    isMoveDialogOpen = false;
  }

  function handleMoveToFolder(folderId: string | null) {
    drawings.moveDrawing(drawingId, folderId);
    isMoveDialogOpen = false;
  }
</script>

<DropdownMenu>
  <DropdownMenuTrigger>
    <button
      class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
    >
      <EllipsisVertical size={12} />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent class="w-40" align="end">
    <DropdownMenuItem onclick={onDuplicate}>
      <CopyPlus size={11} />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuItem onclick={onStartRename}>
      <Pencil size={11} />
      Rename
    </DropdownMenuItem>
    <DropdownMenuItem onclick={handleOpenMoveDialog}>
      <FolderInput size={11} />
      Move to folder
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      class="text-destructive focus:text-destructive"
      onclick={onDelete}
    >
      <Trash2 size={11} />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<FolderSelectDialog
  open={isMoveDialogOpen}
  {currentFolderId}
  onMove={handleMoveToFolder}
  onCancel={handleCloseMoveDialog}
/>
