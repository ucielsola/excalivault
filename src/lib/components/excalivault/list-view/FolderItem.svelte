<script lang="ts">
import FolderItemDisplay from "$lib/components/excalivault/list-view/FolderItemDisplay.svelte";
import FolderItemRename from "$lib/components/excalivault/list-view/FolderItemRename.svelte";
import FolderItemActions from "$lib/components/excalivault/list-view/FolderItemActions.svelte";
import FolderCreation from "$lib/components/excalivault/list-view/FolderCreation.svelte";
import VaultListItem from "$lib/components/excalivault/list-view/VaultListItem.svelte";
import { folders, vaultList } from "$lib/stores";
import { type FolderData } from "$lib/types";
import FolderItem from "./FolderItem.svelte";

interface Props {
  folder: FolderData;
  level?: number;
}

let { folder, level = 0 }: Props = $props();

let isExpanded = $derived(vaultList.expandedFolders.has(folder.id));
let isRenaming = $derived(vaultList.renamingId === folder.id);
let folderDrawings = $derived(vaultList.drawingsInFolder(folder.id));
let childFolders = $derived(folders.getFolderChildren(folder.id));
let isCreatingSubfolder = $derived(vaultList.creatingSubfolderId === folder.id);
</script>

<div>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
  >
    <div class="flex items-center gap-2 px-4 py-2.5">
      <div class="min-w-0 flex-1">
        {#if isRenaming}
          <FolderItemRename
            initial={folder.name}
            onConfirm={(v: string) =>
              vaultList.handleRenameFolder(folder.id, v)}
            onCancel={() => vaultList.cancelRename()}
          />
        {:else}
          <FolderItemDisplay
            {folder}
            {level}
            {isExpanded}
            drawingsCount={folderDrawings.length}
            onToggle={() => vaultList.toggleFolder(folder.id)}
            onSelect={() => vaultList.handleSelectFolder(folder.id)}
          />
        {/if}
      </div>

      {#if !isRenaming}
        <FolderItemActions
          onCreateSubfolder={() => {
            folders.toggleFolder(folder.id);
            vaultList.creatingSubfolderId = folder.id;
          }}
          onRename={() => vaultList.startRename(folder.id)}
          onDelete={() => vaultList.handleDeleteFolder(folder.id)}
          onChangeColor={(color) =>
            vaultList.handleChangeFolderColor(folder.id, color)}
        />
      {/if}
    </div>
  </div>

  {#if isExpanded}
    {#if folderDrawings.length > 0}
      <div class="border-border/30 bg-secondary/20 border-b">
        {#each folderDrawings as drawing (drawing.id)}
          <VaultListItem
            {drawing}
            indent={true}
            showFolderBadge={false}
          />
        {/each}
      </div>
    {/if}

    {#if childFolders.length > 0}
      {#each childFolders as childFolder (childFolder.id)}
        <FolderItem folder={childFolder} level={level + 1} />
      {/each}
    {/if}
  {/if}

  {#if isCreatingSubfolder}
    <div class="border-border/50 bg-secondary/10 border-b" style="padding-left: {level * 20}px;">
      <div class="flex items-center gap-2 px-4 py-2.5">
        <div class="h-5 w-5 shrink-0"></div>
        <FolderCreation
          onConfirm={(name, color) => {
            vaultList.handleCreateSubFolder(folder.id, name, color);
          }}
          onCancel={() => {
            vaultList.creatingSubfolderId = null;
          }}
        />
      </div>
    </div>
  {/if}
</div>
