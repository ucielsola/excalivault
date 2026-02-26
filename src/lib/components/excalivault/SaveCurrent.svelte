<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import SaveIcon from "@lucide/svelte/icons/save";

  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  import VaultLogo from "./VaultLogo.svelte";

  let {
    open = false,
    drawingTitle = "",
    onSave = (_name: string) => Promise.resolve(),
    onCancel = () => {},
  }: {
    open: boolean;
    drawingTitle?: string;
    onSave: (name: string) => Promise<void>;
    onCancel: () => void;
  } = $props();

  let isSaving = $state(false);
  let saved = $state(false);

  let name = $state("");
  let initialName = $derived(drawingTitle || "");

  $effect(() => {
    if (!name && initialName) {
      name = initialName;
    }
  });

  async function handleSave() {
    if (!name.trim()) return;
    isSaving = true;
    await onSave(name);
    isSaving = false;
    saved = true;
    setTimeout(() => (saved = false), 2000);
    name = "";
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
  </div>

  <Dialog {open}>
    <DialogContent class="max-w-[300px]">
      <DialogHeader>
        <div class="flex items-center gap-2.5">
          <div
            class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md"
          >
            <SaveIcon size={16} class="text-primary" />
          </div>
          <DialogTitle>Save to vault</DialogTitle>
        </div>
      </DialogHeader>

      <div class="space-y-3">
        <DialogDescription>
          Save your current canvas to the vault for later access.
        </DialogDescription>

        <div class="flex flex-col gap-1.5">
          <Label
            for="drawing-name"
            class="text-muted-foreground text-xs font-medium"
            >Drawing name</Label
          >
          <Input
            id="drawing-name"
            bind:value={name}
            placeholder="e.g. Architecture Diagram"
            class="font-mono text-xs"
          />
        </div>

        <div
          class="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-md border px-2.5 py-2"
        >
          <AlertTriangleIcon size={12} class="text-primary mt-0.5 shrink-0" />
          <p class="text-muted-foreground text-[10px] leading-relaxed">
            Drawings share <span class="text-foreground font-medium"
              >localStorage</span
            > across all Excalidraw tabs.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onclick={onCancel}>Cancel</Button>
        <Button onclick={handleSave} disabled={!name.trim() || isSaving}>
          {#if isSaving}
            <div
              class="border-primary-foreground/30 border-t-primary-foreground mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2"
            ></div>
            Saving...
          {:else if saved}
            <svg viewBox="0 0 16 16" fill="none" class="mr-2 h-3.5 w-3.5">
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Saved!
          {:else}
            <SaveIcon size={14} class="mr-2" />
            Save
          {/if}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
