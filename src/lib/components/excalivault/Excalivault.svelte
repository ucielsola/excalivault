<script lang="ts">
  import { onMount } from "svelte";
  import { Replace, Save } from "@lucide/svelte";

  import { DeleteConfirmDialog, OverwriteConfirmDialog, SavePanel } from "$lib/components/excalivault/dialogs";
  import AlertContainer from "$lib/components/AlertContainer.svelte";
  import CurrentDrawing from "$lib/components/excalivault/CurrentDrawing.svelte";
  import Footer from "$lib/components/excalivault/Footer.svelte";
  import VaultNavigator from "$lib/components/excalivault/VaultNavigator.svelte";
  import * as ListView from "$lib/components/excalivault/list-view";
  import WelcomeScreen from "$lib/components/excalivault/WelcomeScreen.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Tooltip, TooltipContent, TooltipTrigger } from "$lib/components/ui/tooltip";
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

    <AlertContainer />

      {#if vaultList.savePanelOpen}
      <SavePanel />
      {:else}
      <div class="border-border border-t">
        <div
          class="border-border/50 flex items-center justify-between border-b px-4 py-2.5"
        >
          <div class="flex items-center gap-2">
            {#if !drawings.activeDrawingId || drawings.hasUnsavedChanges}
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onclick={() => vaultList.handleSave()}
                    class="bg-primary text-primary-foreground h-7 px-3 text-[11px] font-semibold"
                  >
                    <Save size={12} />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {#if !drawings.activeDrawingId}
                    Create new drawing
                  {:else}
                    Save changes to current drawing
                  {/if}
                </TooltipContent>
              </Tooltip>
            {:else}
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    disabled
                    class="bg-primary text-primary-foreground h-7 px-3 text-[11px] font-semibold"
                  >
                    <Save size={12} />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>No changes to save</TooltipContent>
              </Tooltip>
            {/if}
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  onclick={() => vaultList.handleSaveAsNewCopy()}
                  class="h-7 px-3 text-[11px] font-medium"
                >
                  <Replace size={12} />
                  Save as new copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new copy of current drawing</TooltipContent>
            </Tooltip>
          </div>
          {#if drawings.hasUnsavedChanges}
            <div
              class="text-destructive bg-destructive/10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-destructive"></span>
              Unsaved changes
            </div>
          {/if}
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
