<script lang="ts">
  import { Folder } from "@lucide/svelte";

  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { type FolderData } from "$lib/types";

  import FolderTree from "./FolderTree.svelte";

  interface Props {
    open: boolean;
    folders: FolderData[];
    currentFolderId: string | null;
    onConfirm: (folderId: string | null) => void;
    onCancel: () => void;
  }

  const {
    open,
    folders,
    currentFolderId,
    onConfirm,
    onCancel,
  }: Props = $props();

  let selectedFolderId = $state(currentFolderId);

  function handleConfirm() {
    onConfirm(selectedFolderId);
  }

  function handleCancel() {
    selectedFolderId = currentFolderId;
    onCancel();
  }

  function handleFolderSelect(folderId: string | null) {
    selectedFolderId = folderId;
  }
</script>

<Dialog.Root {open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Move Drawing</Dialog.Title>
      <Dialog.Description>
        Select a folder to move this drawing to.
      </Dialog.Description>
    </Dialog.Header>

    <div class="py-4">
      <button
        class="hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-left {selectedFolderId ===
          null
            ? 'bg-accent'
            : ''}"
        onclick={() => handleFolderSelect(null)}
      >
        <Folder class="text-muted-foreground h-4 w-4" />
        <span class="flex-1">Root</span>
        {#if selectedFolderId === null}
          <Badge variant="secondary" class="h-5">Current</Badge>
        {/if}
      </button>

      <div class="mt-2">
        <FolderTree
          {folders}
          {selectedFolderId}
          onFolderSelect={handleFolderSelect}
          parentId={null}
          depth={0}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={handleCancel}>Cancel</Button>
      <Button onclick={handleConfirm}>Move</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
