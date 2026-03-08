<script lang="ts">
  import type { FolderData } from "$lib/types";
  import { FolderX } from "@lucide/svelte";
  import { folders } from "$lib/stores";
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import FolderSelectItem from "./FolderSelectItem.svelte";

  interface Props {
    open: boolean;
    currentFolderId: string | null;
    onMove: (folderId: string | null) => void;
    onCancel: () => void;
  }

  let { open, currentFolderId, onMove, onCancel }: Props = $props();

  let selectedFolderId = $state<string | null>(currentFolderId);

  let expandedFolderIds = $state<string[]>([]);

  let rootFolders = $derived(folders.getFolderChildren(null));

  function expandPathToCurrentFolder(folderId: string | null) {
    expandedFolderIds = [];
    if (!folderId) return;

    const path = folders.getFolderPath(folderId);
    for (const folder of path) {
      if (folder.id !== folderId) {
        expandedFolderIds.push(folder.id);
      }
    }
  }

  $effect(() => {
    if (open) {
      selectedFolderId = currentFolderId;
      expandPathToCurrentFolder(currentFolderId);
    }
  });

  function handleToggle(folderId: string) {
    if (expandedFolderIds.includes(folderId)) {
      expandedFolderIds = expandedFolderIds.filter((id) => id !== folderId);
    } else {
      expandedFolderIds = [...expandedFolderIds, folderId];
    }
  }

  function handleSelect(folderId: string | null) {
    selectedFolderId = folderId;
  }

  function handleMove() {
    onMove(selectedFolderId);
  }
</script>

<Dialog {open}>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>Move to folder</DialogTitle>
      <DialogDescription>
        Select a folder to move this drawing to.
      </DialogDescription>
    </DialogHeader>

    <div class="max-h-96 overflow-y-auto">
      <div
        class="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors cursor-pointer {selectedFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}"
        onclick={() => handleSelect(null)}
      >
        <div class="h-5 w-5 shrink-0" style="margin-left: 0px;"></div>
        <FolderX size={14} class="text-muted-foreground shrink-0" />
        <span class="truncate text-xs font-medium">Unfiled</span>
      </div>

      <div class="space-y-1">
        {#each rootFolders as folder (folder.id)}
          <FolderSelectItem
            {folder}
            level={0}
            {selectedFolderId}
            expandedFolders={new Set(expandedFolderIds)}
            onToggle={handleToggle}
            onSelect={handleSelect}
          />
        {/each}
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onclick={onCancel}>Cancel</Button>
      <Button onclick={handleMove}>Move</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
