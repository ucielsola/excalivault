<script lang="ts">
  import { dialogStore } from "$lib/stores";
  import {
    DeleteConfirmDialog,
    OverwriteConfirmDialog,
  } from "./index";
</script>

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
      subfolderDrawingCount={
        dialogStore.activeDialog.data?.drawingCount ?? 0
      }
      onConfirm={dialogStore.activeDialog.onConfirm}
      onCancel={dialogStore.activeDialog.onCancel}
    />
  {/if}
{/if}
