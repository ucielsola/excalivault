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
  import { drawings, vaultActions } from "$lib/stores";
  import { type DrawingData } from "$lib/types";

  interface Props {
    drawing: DrawingData;
  }

  let { drawing }: Props = $props();

  let isMoveDialogOpen = $state(false);

  function handleOpenMoveDialog() {
    isMoveDialogOpen = true;
  }

  function handleCloseMoveDialog() {
    isMoveDialogOpen = false;
  }

  function handleMoveToFolder(folderId: string | null) {
    drawings.moveDrawing(drawing.id, folderId);
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
    <DropdownMenuItem onclick={() => vaultActions.handleDuplicateDrawing(drawing.id)}>
      <CopyPlus size={11} />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuItem onclick={() => vaultActions.startRename(drawing.id)}>
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
      onclick={() => vaultActions.handleDelete(drawing.id)}
    >
      <Trash2 size={11} />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<FolderSelectDialog
  open={isMoveDialogOpen}
  currentFolderId={drawing.folderId}
  onMove={handleMoveToFolder}
  onCancel={handleCloseMoveDialog}
  allowNullSelection={false}
/>
