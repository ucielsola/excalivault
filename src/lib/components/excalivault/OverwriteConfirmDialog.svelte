<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";

  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";

  import VaultLogo from "./VaultLogo.svelte";

  let {
    open = false,
    drawingName = "",
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    open: boolean;
    drawingName: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let showOverlay = $state(true);

  function handleCancel() {
    showOverlay = false;
    onCancel();
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
  </div>

  {#if open && showOverlay}
    <Dialog {open}>
      <DialogContent class="max-w-75">
        <DialogHeader>
          <div class="flex items-center gap-2.5">
            <div
              class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md"
            >
              <AlertTriangleIcon size={16} class="text-primary" />
            </div>
            <DialogTitle>Open drawing?</DialogTitle>
          </div>
        </DialogHeader>

        <div class="space-y-3">
          <DialogDescription>
            Loading
            <span class="text-foreground font-medium">"{drawingName}"</span>
            will
            <span class="text-destructive font-semibold">overwrite</span>
            your current canvas.
          </DialogDescription>

          <div
            class="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-md border px-2.5 py-2"
          >
            <AlertTriangleIcon size={12} class="text-primary mt-0.5 shrink-0" />
            <p class="text-muted-foreground text-[10px] leading-relaxed">
              All tabs sharing Excalidraw localStorage will be affected.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onclick={handleCancel}>Cancel</Button>
          <Button onclick={onConfirm}>Open & Replace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  {:else}
    <div class="flex flex-1 items-center justify-center p-6">
      <button
        onclick={() => (showOverlay = true)}
        class="text-primary hover:text-primary/80 text-xs underline underline-offset-2 transition-colors"
      >
        Show dialog again
      </button>
    </div>
  {/if}
</div>
