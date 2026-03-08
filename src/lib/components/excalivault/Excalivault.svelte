<script lang="ts">
  import { Replace, Save } from "@lucide/svelte";

  import AlertContainer from "$lib/components/excalivault/AlertContainer.svelte";
  import CurrentDrawing from "$lib/components/excalivault/CurrentDrawing.svelte";
  import {
    DialogManager,
    SavePanel,
  } from "$lib/components/excalivault/dialogs";
  import ExcalivaultContainer from "$lib/components/excalivault/ExcalivaultContainer.svelte";
  import Footer from "$lib/components/excalivault/Footer.svelte";
  import Settings from "$lib/components/excalivault/Settings.svelte";
  import * as ListView from "$lib/components/excalivault/list-view";
  import VaultLayout from "$lib/components/excalivault/VaultLayout.svelte";
  import VaultNavigator from "$lib/components/excalivault/VaultNavigator.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "$lib/components/ui/tooltip";
  import { drawings, vaultActions, vaultList, viewStore } from "$lib/stores";
</script>

<AlertContainer />
<DialogManager />

<ExcalivaultContainer>
  {#snippet children(setListRef)}
    <VaultLayout>
      <div use:setListRef class="flex h-screen flex-col overflow-hidden">
        {#if viewStore.currentView === "main"}
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
                class="border-border/50 flex items-center justify-between border-b px-4 py-2.5"
              >
                <div class="flex items-center gap-2">
                  {#if !drawings.activeDrawingId || drawings.hasUnsavedChanges}
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          onclick={() => vaultActions.handleSave()}
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
                        onclick={() => vaultActions.handleSaveAsNewCopy()}
                        class="h-7 px-3 text-[11px] font-medium"
                      >
                        <Replace size={12} />
                        Save As
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      >Create a new copy of current drawing</TooltipContent
                    >
                  </Tooltip>
                </div>
                {#if drawings.hasUnsavedChanges}
                  <div
                    class="text-destructive bg-destructive/5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
                  >
                    <span class="bg-destructive h-1.5 w-1.5 rounded-full"></span>
                    Unsaved changes
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <Footer />
        {:else if viewStore.currentView === "settings"}
          <ListView.Header />
          <div class="flex-1 overflow-auto">
            <Settings />
          </div>
        {:else}
        {/if}
      </div>
    </VaultLayout>
  {/snippet}
</ExcalivaultContainer>

