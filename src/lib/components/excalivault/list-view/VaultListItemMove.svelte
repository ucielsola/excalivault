<script lang="ts">
  import { FileText } from "@lucide/svelte";
  import { folders } from "$lib/stores";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  interface Props {
    onMove: (folderId: string | null) => void;
    onCancel: () => void;
  }

  let { onMove, onCancel }: Props = $props();
</script>

<div class="flex items-center gap-1">
  {#each folders.folders as folder (folder.id)}
    <button
      onclick={() => onMove(folder.id)}
      class="text-muted-foreground hover:text-foreground hover:bg-secondary flex h-6 w-6 items-center justify-center rounded transition-colors"
      title={folder.name}
    >
      <FileText size={12} class={getFolderBadgeClass(folder.color)} />
    </button>
  {/each}
  <button
    onclick={() => onMove(null)}
    class="text-muted-foreground hover:text-foreground hover:bg-secondary flex h-6 w-6 items-center justify-center rounded transition-colors"
    title="Unfiled"
  >
    <FileText size={12} />
  </button>
  <button
    onclick={onCancel}
    class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-6 w-6 items-center justify-center rounded transition-colors"
    title="Cancel"
  >
    ×
  </button>
</div>
