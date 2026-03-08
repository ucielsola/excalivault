<script lang="ts">
  import { FolderPlus, Settings } from "@lucide/svelte";
  import { drawings, vaultList } from "$lib/stores";
  import { VaultLogo } from "$lib/components/excalivault/shared";

  const totalCount = $derived(drawings.list.length);
</script>

<div class="border-border flex items-center justify-between border-b px-4 py-3">
  <VaultLogo size="small" />
  <div class="flex items-center gap-1.5">
    <button
      onclick={() => (vaultList.creatingFolder = true)}
      class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded-md transition-colors"
      title="New folder"
    >
      <FolderPlus size={13} />
    </button>
    <button
      class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded-md transition-colors"
      title="Settings"
    >
      <Settings size={13} />
    </button>
    <span
      class="text-primary bg-primary/10 flex h-5 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold"
    >
      {totalCount}
    </span>
  </div>
</div>
