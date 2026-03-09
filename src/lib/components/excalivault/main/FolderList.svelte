<script lang="ts">
  import { fade } from "svelte/transition";

  import FolderItem from "$lib/components/excalivault/main/FolderItem.svelte";
  import VaultListItem from "$lib/components/excalivault/main/VaultListItem.svelte";
  import { vaultList } from "$lib/stores";

  let rootFolders = $derived(vaultList.rootFolders);
  let rootDrawings = $derived(vaultList.rootDrawings);
  let isSearching = $derived(vaultList.isSearching);
</script>

{#if !isSearching}
  {#each rootFolders as folder (folder.id)}
    <div transition:fade|local>
      <FolderItem {folder} />
    </div>
  {/each}

  {#if rootDrawings.length > 0 && rootFolders.length > 0}
    <div class="px-4 py-1.5">
      <span
        class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
      >
        Unfiled
      </span>
    </div>
  {/if}
{/if}

{#if isSearching}
  <div class="px-4 py-1.5">
    <span
      class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
    >
      Results for "{vaultList.search}"
    </span>
  </div>
{/if}

{#each isSearching ? vaultList.filteredDrawings : rootDrawings as drawing (drawing.id)}
  <div transition:fade|local>
    <VaultListItem {drawing} indent={false} showFolderBadge={isSearching} />
  </div>
{/each}
