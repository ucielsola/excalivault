<script lang="ts">
  import { FolderOpen, Search } from "@lucide/svelte";
  import { vaultList, folders } from "$lib/stores";
  import FolderItem from "./FolderItem.svelte";
  import VaultListItem from "../VaultListItem.svelte";

  let rootFolders = $derived(vaultList.rootFolders);
  let rootDrawings = $derived(vaultList.rootDrawings);
  let isSearching = $derived(vaultList.isSearching);
  let currentFolderId = $derived(vaultList.currentFolderId);
</script>

{#if !currentFolderId && !isSearching}
  {#each rootFolders as folder (folder.id)}
    <FolderItem {folder} />
  {/each}

  {#if rootDrawings.length > 0 && rootFolders.length > 0}
    <div class="px-4 py-1.5">
      <span
        class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
      >
        Unfiled
      </span>
    </div>
  {/if}
{/if}

{#if isSearching}
  <div class="px-4 py-1.5">
    <span
      class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
    >
      Results for "{vaultList.search}"
    </span>
  </div>
{/if}

{#each isSearching ? vaultList.filteredDrawings : rootDrawings as drawing (drawing.id)}
  <VaultListItem
    {drawing}
    indent={false}
    isRenaming={vaultList.renamingId === drawing.id}
    moveTarget={vaultList.moveTarget}
    folders={folders.folders}
    formatDate={vaultList.formatDate}
    showFolderBadge={isSearching}
    folderName={isSearching && drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.name
      : undefined}
    folderColor={isSearching && drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.color
      : undefined}
    onOpen={() => vaultList.handleOpen(drawing)}
    onDelete={() => vaultList.handleDelete(drawing.id)}
    onRename={(name: string) => vaultList.handleRenameDrawing(drawing.id, name)}
    onStartRename={() => {
      vaultList.renamingId = drawing.id;
    }}
    onCancelRename={() => (vaultList.renamingId = null)}
    onDuplicate={() => vaultList.handleDuplicateDrawing(drawing.id)}
    onStartMove={() => {
      vaultList.moveTarget = drawing.id;
    }}
    onMove={vaultList.confirmMoveDrawing}
    onCancelMove={vaultList.cancelMoveDrawing}
  />
{/each}
