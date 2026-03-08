<script lang="ts">
  import { File, Image as ImageIcon } from "@lucide/svelte";
  import { drawings, browserTab } from "$lib/stores";

  let activeDrawing = $derived(drawings.list.find(d => d.id === drawings.activeDrawingId));
  let currentThumbnail = $derived(browserTab.currentThumbnail);
</script>

{#if activeDrawing}
  <div class="border-border border-b px-4 py-2.5">
    <div class="mb-2 flex items-center gap-2">
      <File size={12} class="text-muted-foreground" />
      <span class="text-foreground font-mono text-xs font-semibold">
        {activeDrawing.name}
      </span>
    </div>
    {#if currentThumbnail}
      <div class="bg-muted/30 flex items-center justify-center rounded overflow-hidden" style="aspect-ratio: 16 / 9;">
        <img src={currentThumbnail} alt="Drawing thumbnail" class="h-full w-full object-contain" />
      </div>
    {:else}
      <div class="bg-muted/30 flex items-center justify-center rounded" style="aspect-ratio: 16 / 9;">
        <ImageIcon size={32} class="text-muted-foreground/30" />
      </div>
    {/if}
  </div>
{:else}
  <div class="border-border border-b px-4 py-2.5">
    <span class="text-muted-foreground/50 font-mono text-[10px]">No drawing loaded</span>
  </div>
{/if}
