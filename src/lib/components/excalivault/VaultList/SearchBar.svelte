<script lang="ts">
  import { Search, X } from "@lucide/svelte";
  import { vaultList } from "$lib/stores";
</script>

<div class="border-border border-b px-4 py-2.5">
  <div
    class="border-border bg-input flex items-center gap-2 rounded-md border px-2.5 py-1.5"
  >
    <Search size={13} class="text-muted-foreground/50" />
    <input
      type="text"
      placeholder="Search vault..."
      bind:value={vaultList.search}
      class="text-foreground placeholder:text-muted-foreground/40 w-full bg-transparent font-mono text-xs focus:outline-none"
    />
    {#if vaultList.search}
      <button
        onclick={() => (vaultList.search = "")}
        class="text-muted-foreground/50 hover:text-foreground"
      >
        <X size={12} />
      </button>
    {/if}
  </div>
</div>
