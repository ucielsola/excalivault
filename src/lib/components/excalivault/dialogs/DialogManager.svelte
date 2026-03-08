<script lang="ts">
  import { dialogStore } from "$lib/stores";
  import DeleteAllConfirmDialog from "$lib/components/excalivault/dialogs/DeleteAllConfirmDialog.svelte";
  import {
    DeleteConfirmDialog,
    OverwriteConfirmDialog,
  } from "./index";
</script>

{#if dialogStore.activeDialog}
  {#if dialogStore.activeDialog.type === "overwrite"}
    {#key dialogStore.activeDialog.id}
      <OverwriteConfirmDialog
        open={true}
        drawingName={dialogStore.activeDialog.data?.drawingName ?? ""}
        onConfirm={dialogStore.activeDialog.onConfirm}
        onCancel={dialogStore.activeDialog.onCancel}
      />
    {/key}
  {:else if dialogStore.activeDialog.type === "delete"}
    {#key dialogStore.activeDialog.id}
      <DeleteConfirmDialog
        open={true}
        itemName={dialogStore.activeDialog.data?.itemName ?? ""}
        itemType={dialogStore.activeDialog.data?.itemType ?? "drawing"}
        subfolderCount={dialogStore.activeDialog.data?.subfolderCount ?? 0}
        subfolderDrawingCount={
          dialogStore.activeDialog.data?.drawingCount ?? 0
        }
        onConfirm={dialogStore.activeDialog.onConfirm}
        onCancel={dialogStore.activeDialog.onCancel}
      />
    {/key}
  {:else if dialogStore.activeDialog.type === "delete_all"}
    {#key dialogStore.activeDialog.id}
      <DeleteAllConfirmDialog
        open={true}
        onConfirm={dialogStore.activeDialog.onConfirm}
        onCancel={dialogStore.activeDialog.onCancel}
      />
    {/key}
  {/if}
{/if}
