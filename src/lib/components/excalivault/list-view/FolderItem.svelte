<script lang="ts">
import FolderItemDisplay from "$lib/components/excalivault/list-view/FolderItemDisplay.svelte";
import FolderItemRename from "$lib/components/excalivault/list-view/FolderItemRename.svelte";
import FolderItemActions from "$lib/components/excalivault/list-view/FolderItemActions.svelte";
import FolderCreation from "$lib/components/excalivault/list-view/FolderCreation.svelte";
import VaultListItem from "$lib/components/excalivault/list-view/VaultListItem.svelte";
  import { folders, vaultActions, vaultList } from "$lib/stores";
import { type FolderData } from "$lib/types";
import FolderItem from "./FolderItem.svelte";

interface Props {
  folder: FolderData;
  level?: number;
}

let { folder, level = 0 }: Props = $props();

let isExpanded = $derived(vaultList.expandedFolders.has(folder.id));
let isSelected = $derived(vaultList.currentFolderId === folder.id);
let isRenaming = $derived(vaultList.renamingId === folder.id);
let folderDrawings = $derived(vaultList.drawingsInFolder(folder.id));
let childFolders = $derived(folders.getFolderChildren(folder.id));
let isCreatingSubfolder = $derived(vaultList.creatingSubfolderId === folder.id);
let hasContent = $derived(folderDrawings.length > 0 || childFolders.length > 0);
let totalDrawingsCount = $derived(folders.getTotalDrawingsCount(folder.id));
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
              vaultActions.handleRenameFolder(folder.id, v)}
            onCancel={() => vaultActions.cancelRename()}
          />
        {:else}
          <FolderItemDisplay
            {folder}
            {level}
            {isExpanded}
            {isSelected}
            drawingsCount={totalDrawingsCount}
            {hasContent}
            onToggle={() => vaultActions.toggleFolder(folder.id)}
            onSelect={() => vaultActions.handleFolderClick(folder.id)}
          />
        {/if}
      </div>

      {#if !isRenaming}
        <FolderItemActions
          isRoot={folder.isRoot}
          onCreateSubfolder={() => {
            folders.expandFolder(folder.id);
            vaultList.creatingSubfolderId = folder.id;
          }}
          onRename={() => vaultActions.startRename(folder.id)}
          onDelete={() => vaultActions.handleDeleteFolder(folder.id)}
          onChangeColor={(color) =>
            vaultActions.handleChangeFolderColor(folder.id, color)}
          onChangeIcon={(icon) => folders.updateFolderIcon(folder.id, icon)}
        />
      {/if}
    </div>
  </div>

  {#if isExpanded}
    {#if childFolders.length > 0}
      {#each childFolders as childFolder (childFolder.id)}
        <FolderItem folder={childFolder} level={level + 1} />
      {/each}
    {/if}

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
  {/if}

  {#if isCreatingSubfolder}
    <div class="border-border/50 bg-secondary/10 border-b" style="padding-left: {level * 14}px;" onkeydown={(e) => e.stopPropagation()} onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center gap-2 px-4 py-2.5">
        <div class="h-5 w-5 shrink-0"></div>
        <FolderCreation
          onConfirm={(name, color, icon) => {
            vaultActions.handleCreateSubFolder(folder.id, name, color, icon);
          }}
          onCancel={() => {
            vaultList.creatingSubfolderId = null;
          }}
        />
      </div>
    </div>
  {/if}
</div>
