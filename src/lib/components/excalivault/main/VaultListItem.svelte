<script lang="ts">
  import {
    CopyPlus,
    FileText,
    FolderInput,
    Pencil,
    Trash2,
  } from "@lucide/svelte";
  import InlineInput from "$lib/components/excalivault/shared/InlineInput.svelte";
  import VaultListItemActions from "$lib/components/excalivault/main/VaultListItemActions.svelte";
  import { drawings, vaultActions, vaultList } from "$lib/stores";
  import { type DrawingData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";
  import { folders } from "$lib/stores";

  interface Props {
    drawing: DrawingData;
    indent?: boolean;
    showFolderBadge?: boolean;
  }

  let { drawing, indent = false, showFolderBadge = false }: Props = $props();

  let isRenaming = $derived(vaultList.renamingId === drawing.id);
  let isActive = $derived(drawings.activeDrawingId === drawing.id);

  let folderName = $derived(
    drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.name
      : undefined,
  );
  let folderColor = $derived(
    drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.color
      : undefined,
  );
</script>

<div class={indent ? "pl-8" : ""}>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative flex items-center gap-2 border-b px-4 py-2.5 transition-colors {isActive ? 'bg-primary/5' : ''}"
  >
    <div class="min-w-0 flex-1">
      {#if isRenaming}
        <InlineInput
          initial={drawing.name}
          onConfirm={(name) => vaultActions.handleRenameDrawing(drawing.id, name)}
          onCancel={() => vaultActions.cancelRename()}
        />
        {:else}
          <button
            onclick={() => vaultActions.handleOpen(drawing)}
            class="text-foreground hover:text-primary flex w-full items-center gap-2 text-left"
          >
            <FileText size={14} class="text-muted-foreground shrink-0" />
            <span class="truncate text-xs font-medium">{drawing.name}</span>
            <span class="text-muted-foreground/50 shrink-0 font-mono text-[9px]">
              {vaultList.formatDate(drawing.updatedAt)}
            </span>
            {#if showFolderBadge && folderName && folderColor}
              <span
                class={getFolderBadgeClass(folderColor) + " shrink-0 rounded px-1.5 font-mono text-[9px]"}
              >
                {folderName}
              </span>
            {/if}
            {#if isActive}
              <span class="relative flex h-2 w-2 shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            {/if}
          </button>
        {/if}
    </div>

    {#if !isRenaming}
      <VaultListItemActions {drawing} />
    {/if}
  </div>
</div>
