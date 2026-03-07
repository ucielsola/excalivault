<script lang="ts">
  import { ChevronLeft, ChevronRight, FolderPlus } from "@lucide/svelte";
  import { drawings, vaultList } from "$lib/stores";
  import VaultLogo from "../VaultLogo.svelte";

  const totalCount = $derived(drawings.list.length);
  let currentFolderId = $derived(vaultList.currentFolderId);
  let activeFolder = $derived(vaultList.activeFolder);
  let creatingFolder = $derived(vaultList.creatingFolder);
</script>

<div class="border-border flex items-center justify-between border-b px-4 py-3">
  {#if currentFolderId && activeFolder}
    <button
      onclick={() => vaultList.handleBackToRoot()}
      class="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded text-xs font-medium transition-colors"
    >
      <ChevronLeft size={13} />
      <span class="text-muted-foreground/60 font-mono text-[10px]">Vault</span>
      <ChevronRight size={10} class="text-muted-foreground/40" />
      <span
        class="font-mono text-[10px] font-semibold"
        style="color: {activeFolder.color}"
      >
        {activeFolder.name}
      </span>
    </button>
  {:else}
    <VaultLogo size="small" />
  {/if}
  <div class="flex items-center gap-1.5">
    <button
      onclick={() => (vaultList.creatingFolder = true)}
      class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded-md transition-colors"
      title="New folder"
    >
      <FolderPlus size={13} />
    </button>
    <span
      class="text-primary bg-primary/10 flex h-5 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold"
    >
      {totalCount}
    </span>
  </div>
</div>
