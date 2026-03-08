<script lang="ts">
  import VaultListItemActions from "$lib/components/excalivault/list-view/VaultListItemActions.svelte";
  import VaultListItemDisplay from "$lib/components/excalivault/list-view/VaultListItemDisplay.svelte";
  import VaultListItemRename from "$lib/components/excalivault/list-view/VaultListItemRename.svelte";
  import { drawings, vaultList } from "$lib/stores";
  import { type DrawingData } from "$lib/types";

  interface Props {
    drawing: DrawingData;
    indent?: boolean;
    showFolderBadge?: boolean;
  }

let { drawing, indent = false, showFolderBadge = false }: Props = $props();

let isRenaming = $derived(vaultList.renamingId === drawing.id);
let isActive = $derived(drawings.activeDrawingId === drawing.id);
</script>

<div class={indent ? "pl-8" : ""}>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative flex items-center gap-2 border-b px-4 py-2.5 transition-colors {isActive ? 'bg-primary/5' : ''}"
  >
    <div class="min-w-0 flex-1">
      {#if isRenaming}
        <VaultListItemRename
          initial={drawing.name}
          onConfirm={(name) => vaultList.handleRenameDrawing(drawing.id, name)}
          onCancel={() => vaultList.cancelRename()}
        />
        {:else}
          <VaultListItemDisplay
            {drawing}
            formatDate={vaultList.formatDate}
            {showFolderBadge}
            {isActive}
            onOpen={() => vaultList.handleOpen(drawing)}
          />
        {/if}
    </div>

    {#if !isRenaming}
      <VaultListItemActions
        onDuplicate={() => vaultList.handleDuplicateDrawing(drawing.id)}
        onStartRename={() => vaultList.startRename(drawing.id)}
        onDelete={() => vaultList.handleDelete(drawing.id)}
        drawingId={drawing.id}
        currentFolderId={drawing.folderId}
      />
    {/if}
  </div>
</div>
