<script lang="ts">
  import { FolderOpen, Plus, Replace, Save } from "@lucide/svelte";

  import ConfirmOpen from "$lib/components/excalivault/ConfirmOpen.svelte";
  import DeleteConfirm from "$lib/components/excalivault/DeleteConfirm.svelte";
  import InlineInput from "$lib/components/excalivault/InlineInput.svelte";
  import * as VaultList from "$lib/components/excalivault/VaultList";
  import { drawings, folders, vaultList } from "$lib/stores";
  import { COLOR_VALUES, getFolderBadgeClass } from "$lib/utils/folderColors";

  let listRef = $state<HTMLDivElement | null>(null);

  let creatingFolder = $derived(vaultList.creatingFolder);
  let savePanelOpen = $derived(vaultList.savePanelOpen);
  let selectedDrawing = $derived(vaultList.selectedDrawing);
  let confirmOpenOpen = $derived(vaultList.confirmOpenOpen);
  let deleteConfirmOpen = $derived(vaultList.deleteConfirmOpen);

  $effect(() => {
    if (vaultList.saveMode === "new" && vaultList.savePanelOpen) {
      vaultList.newCopyInputRef?.focus();
    }
  });

  $effect(() => {
    function handleClick(e: MouseEvent) {
      if (listRef && !listRef.contains(e.target as Node)) {
        vaultList.menuOpenId = null;
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  });
</script>

<div bind:this={listRef} class="flex h-full flex-col">
  <VaultList.Header />

  <VaultList.SearchBar />

  <div class="flex-1 overflow-y-auto">
    {#if creatingFolder}
      <div class="border-border/50 border-b px-4 py-2.5">
        <div class="flex items-center gap-2">
          <FolderOpen
            size={14}
            class={getFolderBadgeClass(
              COLOR_VALUES[folders.folders.length % COLOR_VALUES.length],
            )}
          />
          <div class="flex-1">
            <InlineInput
              placeholder="Folder name..."
              onConfirm={(name: string) => vaultList.handleCreateFolder(name)}
              onCancel={() => (vaultList.creatingFolder = false)}
            />
          </div>
        </div>
      </div>
    {/if}

    <VaultList.FolderList />

    <VaultList.EmptyState type="folder" />
    <VaultList.EmptyState type="search" />
  </div>

  {#if savePanelOpen}
    <VaultList.SavePanel />
  {:else}
    <div class="border-border border-t">
      <div
        class="border-border/50 flex items-center gap-2 border-b px-4 py-2.5"
      >
        <button
          onclick={() => vaultList.openSavePanel("new")}
          class="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-all hover:brightness-110"
        >
          <Save size={12} />
          Save new copy
        </button>
        <button
          onclick={() => vaultList.openSavePanel("overwrite")}
          class="bg-secondary text-foreground hover:border-primary/30 hover:bg-secondary/80 border-border flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[11px] font-medium transition-colors"
        >
          <Replace size={12} />
          Overwrite
        </button>
      </div>
      <div class="flex items-center justify-between px-4 py-2">
        <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
          {drawings.list.length} drawings · {folders.folders.length} folders
        </p>
        <button
          onclick={() => (vaultList.creatingFolder = true)}
          class="text-muted-foreground/60 hover:bg-secondary hover:text-foreground flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
        >
          <Plus size={10} />
          Folder
        </button>
      </div>
    </div>
  {/if}

  {#if confirmOpenOpen && selectedDrawing}
    <ConfirmOpen
      open={confirmOpenOpen}
      drawingName={selectedDrawing.name}
      onConfirm={() => vaultList.confirmOpen()}
      onCancel={() => vaultList.cancelOpen()}
    />
  {/if}

  {#if deleteConfirmOpen && selectedDrawing}
    <DeleteConfirm
      open={deleteConfirmOpen}
      drawingName={selectedDrawing.name}
      onConfirm={() => vaultList.confirmDelete()}
      onCancel={() => vaultList.cancelDelete()}
    />
  {/if}
</div>
