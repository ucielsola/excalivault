<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import XIcon from "@lucide/svelte/icons/x";

  import { Button } from "$lib/components/ui/button";

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
    <div
      class="bg-background/80 relative flex flex-1 flex-col items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        class="border-border bg-card w-full max-w-[300px] rounded-lg border shadow-2xl"
      >
        <div class="flex items-start justify-between p-4 pb-2">
          <div class="flex items-center gap-2.5">
            <div
              class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md"
            >
              <AlertTriangleIcon size={16} class="text-primary" />
            </div>
            <div>
              <h3 class="text-foreground text-sm font-semibold">
                Open drawing?
              </h3>
            </div>
          </div>
          <button
            onclick={() => {
              showOverlay = false;
              onCancel();
            }}
            class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded transition-colors"
          >
            <XIcon size={14} />
          </button>
        </div>

        <div class="px-4 py-2">
          <p class="text-muted-foreground text-xs leading-relaxed">
            Loading
            <span class="text-foreground font-medium">"{drawingName}"</span>
            will
            <span class="text-destructive font-semibold">overwrite</span>
            your current canvas.
          </p>
          <div
            class="border-primary/20 bg-primary/5 mt-3 flex items-start gap-2 rounded-md border px-2.5 py-2"
          >
            <AlertTriangleIcon size={12} class="text-primary mt-0.5 shrink-0" />
            <p class="text-muted-foreground text-[10px] leading-relaxed">
              All tabs sharing Excalidraw localStorage will be affected.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-4 py-3">
          <Button variant="outline" onclick={handleCancel}>Cancel</Button>
          <Button onclick={onConfirm}>Open & Replace</Button>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex h-full flex-col">
      <div
        class="border-border flex items-center justify-between border-b px-4 py-3"
      >
        <VaultLogo size="small" />
      </div>
      <div class="flex flex-1 items-center justify-center p-6">
        <button
          onclick={() => (showOverlay = true)}
          class="text-primary hover:text-primary/80 text-xs underline underline-offset-2 transition-colors"
        >
          Show dialog again
        </button>
      </div>
    </div>
  {/if}
</div>
