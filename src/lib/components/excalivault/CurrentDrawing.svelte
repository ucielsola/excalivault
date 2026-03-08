<script lang="ts">
  import { File } from "@lucide/svelte";
  import { vaultList } from "$lib/stores";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";

  let selectedDrawing = $derived(vaultList.selectedDrawing);
</script>

{#if selectedDrawing}
  <div class="border-border flex items-center justify-between border-b px-4 py-2.5">
    <div class="flex items-center gap-2">
      <File size={12} class="text-muted-foreground" />
      <span class="text-foreground font-mono text-xs font-semibold">
        {selectedDrawing.name}
      </span>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onclick={() => {}}>Open</DropdownMenuItem>
        <DropdownMenuItem onclick={() => {}}>Rename</DropdownMenuItem>
        <DropdownMenuItem onclick={() => {}}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
{:else}
  <div class="border-border border-b px-4 py-2.5">
    <span class="text-muted-foreground/50 font-mono text-[10px]">Current Drawing placeholder</span>
  </div>
{/if}
