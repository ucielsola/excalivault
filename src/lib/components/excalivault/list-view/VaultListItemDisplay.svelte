<script lang="ts">
  import { FileText } from "@lucide/svelte";
  import { folders } from "$lib/stores";

  import { type DrawingData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  interface Props {
    drawing: DrawingData;
    formatDate: (date: number) => string;
    showFolderBadge?: boolean;
    onOpen: () => void;
  }

  let { drawing, formatDate, showFolderBadge = false, onOpen }: Props =
    $props();

  let folderName = $derived(
    drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.name
      : undefined,
  );
  let folderColor = $derived(
    drawing.folderId
      ? folders.folders.find((f) => f.id === drawing.folderId)?.color
      : undefined,
  );
</script>

<button
  onclick={onOpen}
  class="text-foreground hover:text-primary flex w-full items-center gap-2 text-left"
>
  <FileText size={14} class="text-muted-foreground shrink-0" />
  <span class="truncate text-xs font-medium">{drawing.name}</span>
  <span class="text-muted-foreground/50 shrink-0 font-mono text-[9px]">
    {formatDate(drawing.updatedAt)}
  </span>
  {#if showFolderBadge && folderName && folderColor}
    <span
      class={getFolderBadgeClass(folderColor) + " shrink-0 rounded px-1.5 font-mono text-[9px]"}
    >
      {folderName}
    </span>
  {/if}
</button>
