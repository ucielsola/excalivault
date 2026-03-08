<script lang="ts">
  import IconRenderer from './IconRenderer.svelte';
  import { ICON_CATEGORIES, POPULAR_ICONS } from '$lib/utils/folderIcons';

  interface Props {
    onSelect: (iconName: string) => void;
    onClose: () => void;
  }

  let { onSelect, onClose }: Props = $props();

  let searchQuery = $state("");
  let selectedCategory = $state("all");

  $effect(() => {
    filterIcons();
  });

  let filteredIcons = $state<readonly string[]>([]);

  function filterIcons() {
    let icons = selectedCategory === "all"
      ? POPULAR_ICONS
      : ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES];

    if (!searchQuery) {
      filteredIcons = icons;
      return;
    }

    filteredIcons = icons.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function handleIconClick(iconName: string) {
    onSelect(iconName);
    onClose();
  }
</script>

<div class="flex flex-col gap-3">
  <div class="flex gap-2">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search icons..."
      class="border-input bg-background flex-1 rounded border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
    />

    <select bind:value={selectedCategory} class="border-input bg-background rounded border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
      <option value="all">All</option>
      {#each Object.keys(ICON_CATEGORIES) as category (category)}
        <option value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
      {/each}
    </select>
  </div>

  <div
    class="overflow-y-auto grid grid-cols-5 gap-2"
    style="max-height: 250px;"
  >
    {#each filteredIcons as iconName (iconName)}
      <button
        onclick={() => handleIconClick(iconName)}
        class="hover:bg-secondary/50 flex aspect-square items-center justify-center rounded border transition-colors"
        title={iconName}
      >
        <IconRenderer name={iconName} size={16} />
      </button>
    {/each}

    {#if filteredIcons.length === 0}
      <div class="col-span-5 flex items-center justify-center text-muted-foreground text-xs py-8">
        No icons found
      </div>
    {/if}
  </div>
</div>
