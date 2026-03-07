<script lang="ts">
  import { FolderOpen, Search } from "@lucide/svelte";
  import { vaultList } from "$lib/stores";

  type EmptyType = "folder" | "search";

  interface Props {
    type: EmptyType;
  }

  let { type }: Props = $props();

  let isSearching = $derived(vaultList.isSearching);
  let currentFolderId = $derived(vaultList.currentFolderId);
  let filteredDrawings = $derived(vaultList.filteredDrawings);
</script>

{#if type === "folder" && currentFolderId && vaultList.rootDrawings.length === 0 && !isSearching}
  <div class="flex flex-col items-center gap-2 p-8">
    <FolderOpen size={20} class="text-muted-foreground/30" />
    <p class="text-muted-foreground/60 text-[11px]">This folder is empty</p>
  </div>
{/if}

{#if type === "search" && isSearching && filteredDrawings.length === 0}
  <div class="flex flex-col items-center gap-2 p-8">
    <Search size={20} class="text-muted-foreground/30" />
    <p class="text-muted-foreground/60 text-[11px]">
      No drawings match your search
    </p>
  </div>
{/if}
