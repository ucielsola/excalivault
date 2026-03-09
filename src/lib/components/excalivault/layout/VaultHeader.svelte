<script lang="ts">
  import { slide } from "svelte/transition";
  import { ChevronLeft, Settings } from "@lucide/svelte";

  import { VaultLogo } from "$lib/components/excalivault/shared";
  import { Button } from "$lib/components/ui/button";
  import { drawings, viewStore } from "$lib/stores";

  const totalCount = $derived(drawings.list.length);
  const canGoBack = $derived(viewStore.canGoBack());
</script>

<div class="border-border flex items-center justify-between border-b px-4 py-4">
  <div class="flex h-8 items-center overflow-hidden">
    {#if canGoBack}
      <div transition:slide={{ duration: 200, axis: "x" }} class="pr-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onclick={() => viewStore.goBack()}
        >
          <ChevronLeft size={14} />
        </Button>
      </div>
    {/if}
    <VaultLogo size="small" />
  </div>
  <div class="flex items-center gap-1.5">
    <button
      class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded-md transition-colors"
      title="Settings"
      onclick={() => viewStore.navigateTo("settings")}
    >
      <Settings size={13} />
    </button>
    <span
      class="text-primary bg-primary/10 flex h-5 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold"
    >
      {totalCount}
    </span>
  </div>
</div>
