<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { drawings } from "$lib/stores";
  import { type DrawingData } from "$lib/types";

  import ConfirmOpen from "./ConfirmOpen.svelte";
  import DeleteConfirm from "./DeleteConfirm.svelte";
  import SearchInput from "./SearchInput.svelte";
  import VaultListItem from "./VaultListItem.svelte";
  import VaultLogo from "./VaultLogo.svelte";

  let menuOpenId = $state<string | null>(null);
  let selectedDrawing = $state<DrawingData | null>(null);
  let confirmOpenOpen = $state(false);
  let deleteConfirmOpen = $state(false);

  function formatDate(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return "Just now";
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function handleDropdownMenu(id: string, open: boolean) {
    menuOpenId = open ? id : null;
  }

  function handleOpen(drawing: DrawingData) {
    selectedDrawing = drawing;
    confirmOpenOpen = true;
  }

  async function confirmOpen() {
    if (!selectedDrawing) return;

    await drawings.openDrawing(selectedDrawing);

    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function cancelOpen() {
    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function handleDelete(id: string) {
    const drawing = drawings.list.find((d) => d.id === id);
    if (!drawing) return;

    selectedDrawing = drawing;
    deleteConfirmOpen = true;
  }

  async function confirmDelete() {
    if (!selectedDrawing) return;

    await drawings.deleteDrawing(selectedDrawing.id);
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }

  function cancelDelete() {
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
    <Badge
      variant="secondary"
      class="text-primary flex h-5 w-5 items-center justify-center font-mono text-[10px] font-bold"
    >
      {drawings.list.length}
    </Badge>
  </div>

  <div class="border-border border-b px-4 py-2.5">
    <SearchInput />
  </div>

  <div class="flex-1 overflow-y-auto">
    {#each drawings.filteredList as drawing (drawing.id)}
      <VaultListItem
        drawing={drawing}
        menuOpenId={menuOpenId}
        formatDate={formatDate}
        onOpen={() => handleOpen(drawing)}
        onDelete={() => handleDelete(drawing.id)}
        onDropdownMenuChange={(open) => handleDropdownMenu(drawing.id, open)}
      />
    {/each}
  </div>

  <div class="border-border border-t px-4 py-2">
    <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
      {drawings.list.length} drawings in vault
    </p>
  </div>

  {#if confirmOpenOpen && selectedDrawing}
    <ConfirmOpen
      open={confirmOpenOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmOpen}
      onCancel={cancelOpen}
    />
  {/if}

  {#if deleteConfirmOpen && selectedDrawing}
    <DeleteConfirm
      open={deleteConfirmOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
    />
  {/if}
</div>
