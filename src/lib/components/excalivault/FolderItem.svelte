<script lang="ts">
  import {
    Folder,
    FolderOpen,
    MoreVertical,
    Pencil,
    Trash2,
  } from "@lucide/svelte";

  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { type DrawingData, type FolderData } from "$lib/types";

  interface Props {
    folder: FolderData;
    drawings: DrawingData[];
    expanded: boolean;
    onToggle: (id: string) => void;
    onSelect: (folderId: string | null) => void;
    onEdit: (folder: FolderData) => void;
    onDelete: (folder: FolderData) => void;
  }

  const {
    folder,
    drawings,
    expanded,
    onToggle,
    onSelect,
    onEdit,
    onDelete,
  }: Props = $props();

  let menuOpen = $state(false);

  const childFolders = $derived(
    drawings.filter((d) => d.folderId === folder.id).length,
  );

  function handleToggle(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    onToggle(folder.id);
  }

  function handleSelect(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    onSelect(folder.id);
  }
</script>

<div
  class="hover:bg-accent group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
  onclick={handleSelect}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(e);
    }
  }}
  role="button"
  tabindex="0"
>
  <button
    class="text-muted-foreground hover:text-foreground flex-shrink-0"
    onclick={handleToggle}
    aria-label={expanded ? "Collapse folder" : "Expand folder"}
  >
    {#if expanded}
      <FolderOpen class="h-4 w-4" />
    {:else}
      <Folder class="h-4 w-4" />
    {/if}
  </button>

  <span class="flex-1 truncate">{folder.name}</span>

  <span class="text-muted-foreground text-xs">{childFolders}</span>

  <DropdownMenu.Root bind:open={menuOpen}>
    <DropdownMenu.Trigger
      class="hover:bg-muted rounded p-0.5 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
      onclick={(e) => e.stopPropagation()}
    >
      <MoreVertical class="h-4 w-4" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item
        onclick={() => {
          menuOpen = false;
          onEdit(folder);
        }}
      >
        <Pencil class="mr-2 h-4 w-4" />
        Rename
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        class="text-destructive focus:text-destructive"
        onclick={() => {
          menuOpen = false;
          onDelete(folder);
        }}
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
