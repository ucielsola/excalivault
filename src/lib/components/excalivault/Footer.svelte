<script lang="ts">
  import { Plus } from "@lucide/svelte";
  import { drawings, folders, vaultList } from "$lib/stores";
</script>

<div class="flex items-center justify-between px-4 py-2">
  <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
    {drawings.list.length} drawings · {folders.folders.length} folders
  </p>
  <button
    onclick={() => (vaultList.creatingFolder = true)}
    class="text-muted-foreground/60 hover:bg-secondary hover:text-foreground flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
  >
    <Plus size={10} />
    Folder
  </button>
</div>
