<script lang="ts">
  import type { Snippet } from "svelte";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import SaveIcon from "@lucide/svelte/icons/save";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import browser from "webextension-polyfill";

  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { browserTab, drawings } from "$lib/stores";

  import SaveCurrent from "./SaveCurrent.svelte";
  import VaultLogo from "./VaultLogo.svelte";

  let {
    children,
    header,
    footer,
  }: {
    children?: Snippet;
    header?: Snippet;
    footer?: Snippet;
  } = $props();

  let saveDialogOpen = $state(false);
  let currentDrawingTitle = $state("");

  $effect(() => {
    if (browserTab.isExcalidraw && !browserTab.loading) {
      getCurrentDrawingTitle();
    }
  });

  async function getCurrentDrawingTitle() {
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (currentData?.title) {
        currentDrawingTitle = currentData.title;
      }
    } catch (error) {
      console.error("Failed to get current drawing title:", error);
    }
  }

  function handleOpenSaveDialog() {
    saveDialogOpen = true;
  }

  function handleCancelSave() {
    saveDialogOpen = false;
  }

  async function handleSave(name: string) {
    const currentData = await drawings.getCurrentDrawingData();
    if (!currentData?.id) {
      return;
    }

    await drawings.saveDrawing({
      id: currentData.id,
      name,
      elements: currentData.elements,
      appState: currentData.appState,
      versionFiles: "",
      versionDataState: "",
    });

    saveDialogOpen = false;
  }
</script>

{#snippet defaultHeader()}
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">v1.0</Badge>
  </div>
{/snippet}

{#snippet defaultContent()}
  <div class="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <div class="relative">
      <div class="bg-primary/5 absolute -inset-4 rounded-full"></div>
      <div class="bg-primary/2 absolute -inset-8 rounded-full"></div>
      <div
        class="border-border bg-secondary relative flex h-16 w-16 items-center justify-center rounded-xl border border-dashed"
      >
        <ShieldIcon size={28} class="text-muted-foreground/30" strokeWidth={1.5}
        ></ShieldIcon>
      </div>
    </div>

    <div class="text-center">
      <h3 class="text-foreground text-sm font-semibold">Your vault is empty</h3>
      <p class="text-muted-foreground mt-1 text-xs leading-relaxed">
        Open an Excalidraw canvas and save it here to get started.
      </p>
    </div>

    {#if browserTab.loading}
      <Button variant="outline" disabled class="gap-2">
        <div
          class="border-muted-foreground/30 border-t-muted-foreground h-3.5 w-3.5 animate-spin rounded-full border-2"
        ></div>
        Checking...
      </Button>
    {:else if browserTab.isExcalidraw}
      <Button variant="default" class="gap-2" onclick={handleOpenSaveDialog}>
        <SaveIcon size={14} />
        Save to Vault
      </Button>
    {:else}
      <Button
        variant="outline"
        class="gap-2"
        onclick={() => browser.tabs.create({ url: "https://excalidraw.com/" })}
      >
        <FolderOpenIcon size={14} />
        Open Excalidraw
      </Button>
    {/if}
  </div>
{/snippet}

{#snippet defaultFooter()}
  <div class="border-border border-t px-4 py-2">
    <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
      {drawings.list.length} drawings in vault
    </p>
  </div>
{/snippet}

<div class="flex h-full flex-col">
  {#if header}
    {@render header()}
  {:else}
    {@render defaultHeader()}
  {/if}

  {#if children}
    {@render children()}
  {:else}
    {@render defaultContent()}
  {/if}

  {#if footer}
    {@render footer()}
  {:else}
    {@render defaultFooter()}
  {/if}
</div>

<SaveCurrent
  open={saveDialogOpen}
  drawingTitle={currentDrawingTitle}
  onSave={handleSave}
  onCancel={handleCancelSave}
/>
