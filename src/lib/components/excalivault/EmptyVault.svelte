<script lang="ts">
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import SaveIcon from "@lucide/svelte/icons/save";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import VaultLogo from "./VaultLogo.svelte";
  import SaveCurrent from "./SaveCurrent.svelte";
  import browser from "webextension-polyfill";

  let { 
    onSave = (_name: string) => Promise.resolve(),
    isOnExcalidraw = false,
    loading = false,
    drawingTitle = ""
  }: { 
    onSave: (name: string) => Promise<void>;
    isOnExcalidraw: boolean;
    loading: boolean;
    drawingTitle?: string;
  } = $props();

  let saveDialogOpen = $state(false);

  function handleOpenSaveDialog() {
    saveDialogOpen = true;
  }

  function handleCancelSave() {
    saveDialogOpen = false;
  }

  async function handleSave(name: string) {
    await onSave(name);
    saveDialogOpen = false;
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-border px-4 py-3">
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">v1.0</Badge>
  </div>

  <div class="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <div class="relative">
      <div class="absolute -inset-4 rounded-full bg-primary/5"></div>
      <div class="absolute -inset-8 rounded-full bg-primary/[0.02]"></div>
      <div class="relative flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-secondary">
        <ShieldIcon size={28} class="text-muted-foreground/30" strokeWidth={1.5}></ShieldIcon>
      </div>
    </div>

    <div class="text-center">
      <h3 class="text-sm font-semibold text-foreground">Your vault is empty</h3>
      <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
        Open an Excalidraw canvas and save it here to get started.
      </p>
    </div>

    {#if loading}
      <Button variant="outline" disabled class="gap-2">
        <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
        Checking...
      </Button>
    {:else if isOnExcalidraw}
      <Button variant="default" class="gap-2" onclick={handleOpenSaveDialog}>
        <SaveIcon size={14} />
        Save to Vault
      </Button>
    {:else}
      <Button variant="outline" class="gap-2" onclick={() => browser.tabs.create({ url: "https://excalidraw.com/" })}>
        <FolderOpenIcon size={14} />
        Open Excalidraw
      </Button>
    {/if}
  </div>

  <div class="border-t border-border px-4 py-2">
    <p class="text-center font-mono text-[10px] text-muted-foreground/50">
      0 drawings in vault
    </p>
  </div>

  <SaveCurrent 
    open={saveDialogOpen} 
    {drawingTitle} 
    onSave={handleSave} 
    onCancel={handleCancelSave} 
  />
</div>
