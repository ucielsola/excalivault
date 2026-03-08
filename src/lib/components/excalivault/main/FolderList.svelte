<script lang="ts">
  import { vaultList } from "$lib/stores";
  import FolderItem from "$lib/components/excalivault/main/FolderItem.svelte";
  import VaultListItem from "$lib/components/excalivault/main/VaultListItem.svelte";

let rootFolders = $derived(vaultList.rootFolders);
let rootDrawings = $derived(vaultList.rootDrawings);
let isSearching = $derived(vaultList.isSearching);
</script>

{#if !isSearching}
  {#each rootFolders as folder (folder.id)}
    <FolderItem {folder} />
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
  <VaultListItem
    {drawing}
    indent={false}
    showFolderBadge={isSearching}
  />
{/each}
