<script lang="ts">
  import { ChevronLeft, Settings } from "@lucide/svelte";
  import { drawings, viewStore } from "$lib/stores";
  import { VaultLogo } from "$lib/components/excalivault/shared";
  import { Button } from "$lib/components/ui/button";

  const totalCount = $derived(drawings.list.length);
  const canGoBack = $derived(viewStore.canGoBack());
</script>

<div class="border-border flex items-center justify-between border-b px-4 py-3">
  <div class="flex items-center gap-2">
    {#if canGoBack}
      <Button
        variant="ghost"
        size="icon-sm"
        onclick={() => viewStore.goBack()}
      >
        <ChevronLeft size={14} />
      </Button>
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
