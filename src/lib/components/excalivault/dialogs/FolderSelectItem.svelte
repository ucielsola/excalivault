<script lang="ts">
  import type { FolderData } from "$lib/types";
  import { ChevronDown, ChevronRight, FolderOpen } from "@lucide/svelte";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";
  import { folders } from "$lib/stores";
  import FolderSelectItemSelf from "./FolderSelectItem.svelte";

  interface Props {
    folder: FolderData;
    level: number;
    selectedFolderId: string | null;
    expandedFolders: Set<string>;
    onToggle: (folderId: string) => void;
    onSelect: (folderId: string | null) => void;
  }

  let {
    folder,
    level,
    selectedFolderId,
    expandedFolders,
    onToggle,
    onSelect,
  }: Props = $props();

  let isExpanded = $derived(expandedFolders.has(folder.id));
  let isSelected = $derived(selectedFolderId === folder.id);
  let folderBadgeClass = $derived(getFolderBadgeClass(folder.color));
  let childFolders = $derived(folders.getFolderChildren(folder.id));
</script>

<div class="space-y-1">
  <div
    class="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors cursor-pointer {isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}"
    onclick={() => onSelect(folder.id)}
  >
    {#if childFolders.length > 0}
      <button
        onclick={(e) => {
          e.stopPropagation();
          onToggle(folder.id);
        }}
        class="text-muted-foreground/50 hover:text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
        style="margin-left: {level * 16}px;"
      >
        {#if isExpanded}
          <ChevronDown size={12} />
        {:else}
          <ChevronRight size={12} />
        {/if}
      </button>
    {:else}
      <div class="h-5 w-5 shrink-0" style="margin-left: {level * 16}px;"></div>
    {/if}

    <FolderOpen size={14} class={folderBadgeClass + " shrink-0"} />

    <span class="truncate text-xs font-medium">{folder.name}</span>
  </div>

  {#if isExpanded && childFolders.length > 0}
    <div class="ml-4 space-y-1">
      {#each childFolders as childFolder (childFolder.id)}
        <FolderSelectItemSelf
          folder={childFolder}
          level={level + 1}
          {selectedFolderId}
          {expandedFolders}
          {onToggle}
          {onSelect}
        />
      {/each}
    </div>
  {/if}
</div>
