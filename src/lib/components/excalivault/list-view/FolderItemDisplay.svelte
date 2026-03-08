<script lang="ts">
  import { ChevronDown, ChevronRight } from "@lucide/svelte";
  import IconRenderer from "$lib/components/ui/IconRenderer.svelte";
  import { type FolderData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  interface Props {
    folder: FolderData;
    level: number;
    isExpanded: boolean;
    drawingsCount: number;
    hasContent: boolean;
    onToggle: () => void;
    onSelect: () => void;
  }

  let {
    folder,
    level,
    isExpanded,
    drawingsCount,
    hasContent,
    onToggle,
    onSelect,
  }: Props = $props();

  let folderBadgeClass = $derived(getFolderBadgeClass(folder.color));
</script>

<div class="flex items-center gap-2">
  {#if hasContent}
    <button
      onclick={onToggle}
      class="text-muted-foreground/50 hover:bg-secondary hover:text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors pl-1"
      style="margin-left: {level * 14 - 14}px;"
    >
      {#if isExpanded}
        <ChevronDown size={12} />
      {:else}
        <ChevronRight size={12} />
      {/if}
    </button>
  {:else}
    <div
      class="h-5 w-5 shrink-0"
      style="margin-left: {level * 14 - 14}px;"
    ></div>
  {/if}

  <button
    onclick={onSelect}
    class="text-foreground hover:text-primary flex min-w-0 flex-1 items-center gap-2 text-left"
  >
    <IconRenderer
      name={folder.icon || "FolderOpen"}
      size={14}
      class={folderBadgeClass + " shrink-0"}
      color={folder.color}
    />

    <span class="truncate text-xs font-medium {level >= 3 ? 'max-w-[120px]' : ''}">{folder.name}</span>

    <span
      class="bg-secondary text-muted-foreground shrink-0 rounded px-1 font-mono text-[9px]"
    >
      {drawingsCount}
    </span>
  </button>
</div>
