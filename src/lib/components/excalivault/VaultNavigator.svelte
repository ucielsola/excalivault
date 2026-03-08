<script lang="ts">
  import { Plus } from "@lucide/svelte";
  import { FolderCreation } from "$lib/components/excalivault/list-view";
  import * as ListView from "$lib/components/excalivault/list-view";
  import { vaultList } from "$lib/stores";
</script>

<div class="flex h-full flex-col overflow-hidden">
  <div class="border-border border-b px-4 py-2">
    <button
      onclick={() => (vaultList.creatingFolder = true)}
      class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors"
    >
      <Plus size={12} />
      New Folder
    </button>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if vaultList.creatingFolder}
      <div class="border-border/50 border-b px-4 py-2.5">
        <FolderCreation
          onConfirm={(name, color) => vaultList.handleCreateFolder(name, color)}
          onCancel={() => (vaultList.creatingFolder = false)}
        />
      </div>
    {/if}

    <ListView.SearchBar />

    <ListView.FolderList />

    <ListView.EmptyState type="folder" />
    <ListView.EmptyState type="search" />
  </div>
</div>
