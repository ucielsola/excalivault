<script lang="ts">
  import {
    ChevronDown,
    ChevronRight,
    MoreVertical,
    FolderOpen,
    Pencil,
    Trash2,
  } from "@lucide/svelte";
  import { type FolderData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { vaultList, folders } from "$lib/stores";
  import InlineInput from "../InlineInput.svelte";
  import VaultListItem from "../VaultListItem.svelte";

  interface Props {
    folder: FolderData;
    indent?: boolean;
  }

  let { folder, indent = false }: Props = $props();

  let isExpanded = $derived(vaultList.expandedFolders.has(folder.id));
  let isRenaming = $derived(vaultList.renamingId === folder.id);
  let folderDrawings = $derived(vaultList.drawingsInFolder(folder.id));
</script>

<div>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
  >
    <div class="flex items-center gap-2 px-4 py-2.5">
      <button
        onclick={() => vaultList.toggleFolder(folder.id)}
        class="text-muted-foreground/50 hover:bg-secondary hover:text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
      >
        {#if isExpanded}
          <ChevronDown size={12} />
        {:else}
          <ChevronRight size={12} />
        {/if}
      </button>

      <FolderOpen
        size={14}
        class={getFolderBadgeClass(folder.color) + " shrink-0"}
      />

      <div class="min-w-0 flex-1">
        {#if isRenaming}
          <InlineInput
            initial={folder.name}
            onConfirm={(v: string) => vaultList.handleRenameFolder(folder.id, v)}
            onCancel={() => (vaultList.renamingId = null)}
          />
        {:else}
          <button
            onclick={() => vaultList.handleSelectFolder(folder.id)}
            class="text-foreground hover:text-primary flex w-full items-center gap-2 text-left"
          >
            <span class="truncate text-xs font-medium">{folder.name}</span>
            <span
              class="bg-secondary text-muted-foreground shrink-0 rounded px-1 font-mono text-[9px]"
            >
              {folderDrawings.length}
            </span>
          </button>
        {/if}
      </div>

      {#if !isRenaming}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
            >
              <MoreVertical size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48" align="end">
            <DropdownMenuItem
              onclick={() => vaultList.handleSelectFolder(folder.id)}
            >
              <FolderOpen size={11} />
              Open folder
            </DropdownMenuItem>
            <DropdownMenuItem
              onclick={() => (vaultList.renamingId = folder.id)}
            >
              <Pencil size={11} />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              onclick={() => vaultList.handleDeleteFolder(folder.id)}
            >
              <Trash2 size={11} />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {/if}
    </div>
  </div>

  {#if isExpanded && folderDrawings.length > 0}
    <div class="border-border/30 bg-secondary/20 border-b">
      {#each folderDrawings as drawing (drawing.id)}
        <VaultListItem
          {drawing}
          indent={true}
          isRenaming={vaultList.renamingId === drawing.id}
          moveTarget={vaultList.moveTarget === drawing.id}
          folders={folders.folders}
          formatDate={vaultList.formatDate}
          onOpen={() => vaultList.handleOpen(drawing)}
          onDelete={() => vaultList.handleDelete(drawing.id)}
          onRename={(name: string) => vaultList.handleRenameDrawing(drawing.id, name)}
          onStartRename={() => {
            vaultList.renamingId = drawing.id;
          }}
          onCancelRename={() => (vaultList.renamingId = null)}
          onDuplicate={() => vaultList.handleDuplicateDrawing(drawing.id)}
          onStartMove={() => {
            vaultList.moveTarget = drawing.id;
          }}
          onMove={vaultList.confirmMoveDrawing}
          onCancelMove={vaultList.cancelMoveDrawing}
        />
      {/each}
    </div>
  {/if}
</div>
