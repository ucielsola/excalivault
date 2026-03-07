<script lang="ts">
  import { onMount } from "svelte";
  import { Plus, Replace, Save } from "@lucide/svelte";

  import DeleteConfirmDialog from "$lib/components/excalivault/DeleteConfirmDialog.svelte";
  import FolderCreation from "$lib/components/excalivault/FolderCreation.svelte";
  import OverwriteConfirmDialog from "$lib/components/excalivault/OverwriteConfirmDialog.svelte";
  import * as VaultList from "$lib/components/excalivault/VaultList";
  import WelcomeScreen from "$lib/components/excalivault/WelcomeScreen.svelte";
  import { drawings, folders, vaultList } from "$lib/stores";

  let listRef = $state<HTMLDivElement | null>(null);

  let isEmptyVault = $derived(
    drawings.list.length === 0 && folders.folders.length === 0,
  );

  onMount(async () => {
    drawings.loadDrawings();
    folders.loadFolders();
  });

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

{#if isEmptyVault}
  <WelcomeScreen />
{:else}
  <div bind:this={listRef} class="flex h-full flex-col">
    <VaultList.Header />

    <VaultList.SearchBar />

    <div class="flex-1 overflow-y-auto">
      {#if vaultList.creatingFolder}
        <div class="border-border/50 border-b px-4 py-2.5">
          <FolderCreation
            onConfirm={(name, color) => vaultList.handleCreateFolder(name, color)}
            onCancel={() => (vaultList.creatingFolder = false)}
          />
        </div>
      {/if}

      <VaultList.FolderList />

      <VaultList.EmptyState type="folder" />
      <VaultList.EmptyState type="search" />
    </div>

    {#if vaultList.savePanelOpen}
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

    {#if vaultList.confirmOpenOpen && vaultList.selectedDrawing}
      <OverwriteConfirmDialog
        open={vaultList.confirmOpenOpen}
        drawingName={vaultList.selectedDrawing.name}
        onConfirm={() => vaultList.confirmOpen()}
        onCancel={() => vaultList.cancelOpen()}
      />
    {/if}

    {#if vaultList.deleteConfirmOpen && (vaultList.selectedDrawing || vaultList.selectedFolder)}
      <DeleteConfirmDialog
        open={vaultList.deleteConfirmOpen}
        itemName={vaultList.selectedDrawing?.name ??
          vaultList.selectedFolder?.name ??
          ""}
        itemType={vaultList.selectedDrawing ? "drawing" : "folder"}
        subfolderCount={vaultList.deletingFolderSubfolderCount}
        subfolderDrawingCount={vaultList.deletingFolderDrawingCount}
        onConfirm={() =>
          vaultList.selectedDrawing
            ? vaultList.confirmDelete()
            : vaultList.confirmDeleteFolder()}
        onCancel={() =>
          vaultList.selectedDrawing
            ? vaultList.cancelDelete()
            : vaultList.cancelDeleteFolder()}
      />
    {/if}
  </div>
{/if}
