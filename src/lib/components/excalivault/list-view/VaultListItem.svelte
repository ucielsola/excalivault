<script lang="ts">
  import VaultListItemActions from "$lib/components/excalivault/list-view/VaultListItemActions.svelte";
  import VaultListItemDisplay from "$lib/components/excalivault/list-view/VaultListItemDisplay.svelte";
  import VaultListItemMove from "$lib/components/excalivault/list-view/VaultListItemMove.svelte";
  import VaultListItemRename from "$lib/components/excalivault/list-view/VaultListItemRename.svelte";
  import { vaultList } from "$lib/stores";
  import { type DrawingData } from "$lib/types";

  interface Props {
    drawing: DrawingData;
    indent?: boolean;
    showFolderBadge?: boolean;
  }

  let { drawing, indent = false, showFolderBadge = false }: Props = $props();

  let isRenaming = $derived(vaultList.renamingId === drawing.id);
  let isMoving = $derived(vaultList.moveTarget === drawing.id);
</script>

<div class={indent ? "pl-12" : ""}>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative flex items-center gap-2 border-b px-4 py-2.5 transition-colors"
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
          onOpen={() => vaultList.handleOpen(drawing)}
        />
      {/if}
    </div>

    {#if isMoving}
      <VaultListItemMove
        onMove={(folderId) => vaultList.confirmMoveDrawing(folderId)}
        onCancel={() => vaultList.cancelMoveDrawing()}
      />
    {:else if !isRenaming}
      <VaultListItemActions
        onDuplicate={() => vaultList.handleDuplicateDrawing(drawing.id)}
        onStartRename={() => vaultList.startRename(drawing.id)}
        onStartMove={() => vaultList.startMove(drawing.id)}
        onDelete={() => vaultList.handleDelete(drawing.id)}
      />
    {/if}
  </div>
</div>
