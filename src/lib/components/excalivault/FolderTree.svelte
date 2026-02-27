<script lang="ts">
  import { Folder } from "@lucide/svelte";

  import { type FolderData } from "$lib/types";

  interface Props {
    folders: FolderData[];
    selectedFolderId: string | null;
    onFolderSelect: (id: string | null) => void;
    parentId: string | null;
    depth: number;
  }

  const { folders, selectedFolderId, onFolderSelect, parentId, depth }: Props =
    $props();

  const children = $derived(folders.filter((f) => f.parentId === parentId));
</script>

{#each children as folder (folder.id)}
  <button
    class="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-left {selectedFolderId ===
    folder.id
      ? 'bg-accent'
      : ''}"
    style="padding-left: {depth * 16 + 8}px"
    onclick={() => onFolderSelect(folder.id)}
  >
    <Folder class="text-muted-foreground h-4 w-4" />
    <span class="flex-1 truncate">{folder.name}</span>
  </button>
  <svelte:self
    {folders}
    {selectedFolderId}
    {onFolderSelect}
    parentId={folder.id}
    depth={depth + 1}
  />
{/each}
