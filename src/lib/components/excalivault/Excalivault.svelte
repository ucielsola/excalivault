<script lang="ts">
  import { onMount } from "svelte";
  import { Replace, Save } from "@lucide/svelte";

  import { DeleteConfirmDialog, OverwriteConfirmDialog, SavePanel } from "$lib/components/excalivault/dialogs";
  import CurrentDrawing from "$lib/components/excalivault/CurrentDrawing.svelte";
  import Footer from "$lib/components/excalivault/Footer.svelte";
  import VaultNavigator from "$lib/components/excalivault/VaultNavigator.svelte";
  import * as ListView from "$lib/components/excalivault/list-view";
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
  <div bind:this={listRef} class="flex h-screen flex-col overflow-hidden">
    <ListView.Header />

    <div class="flex flex-1 flex-col overflow-hidden">
      <VaultNavigator />
    </div>

    <CurrentDrawing />

    {#if vaultList.savePanelOpen}
      <SavePanel />
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
      </div>
    {/if}

    <Footer />

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
