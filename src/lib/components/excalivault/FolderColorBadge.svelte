<script lang="ts">
  import FolderOpen from "@lucide/svelte/icons/folder-open";

  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  let {
    color,
    name = "",
    size = 14,
  }: { color: string; name?: string; size?: number } = $props();
  const badgeClass = $derived(getFolderBadgeClass(color));
</script>

<span
  class="{badgeClass} inline-flex items-center gap-1 rounded px-1 py-px text-[9px] font-medium transition-colors"
>
  {#if name}
    <FolderOpen {size} />
  {/if}
  {name}
</span>
