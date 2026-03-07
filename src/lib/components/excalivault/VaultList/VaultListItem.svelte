<script lang="ts">
  import { EllipsisVertical, FileText, Pencil, Trash2 } from "@lucide/svelte";

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { type DrawingData, type FolderData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  import InlineInput from "./InlineInput.svelte";

  interface Props {
    drawing: DrawingData;
    indent?: boolean;
    isRenaming: boolean;
    moveTarget?: string | null;
    folders: FolderData[];
    formatDate: (date: number) => string;
    showFolderBadge?: boolean;
    folderName?: string;
    folderColor?: string;
    onOpen: () => void;
    onDelete: () => void;
    onRename: (name: string) => void;
    onStartRename: () => void;
    onCancelRename: () => void;
    onDuplicate: () => void;
    onStartMove: () => void;
    onMove: (folderId: string | null) => void;
    onCancelMove: () => void;
  }

  let {
    drawing,
    indent = false,
    isRenaming = false,
    moveTarget = null,
    folders,
    formatDate,
    showFolderBadge = false,
    folderName,
    folderColor,
    onOpen,
    onDelete,
    onRename,
    onStartRename,
    onCancelRename,
    onDuplicate,
    onStartMove,
    onMove,
    onCancelMove,
  }: Props = $props();
</script>

<div class={indent ? "pl-12" : ""}>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative flex items-center gap-2 border-b px-4 py-2.5 transition-colors"
  >
    <div class="min-w-0 flex-1">
      {#if isRenaming}
        <InlineInput
          initial={drawing.name}
          onConfirm={onRename}
          onCancel={onCancelRename}
        />
      {:else}
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
              class={getFolderBadgeClass(folderColor) +
                " shrink-0 rounded px-1.5 font-mono text-[9px]"}
            >
              {folderName}
            </span>
          {/if}
        </button>
      {/if}
    </div>

    {#if !isRenaming && moveTarget === drawing.id}
      <div class="flex items-center gap-1">
        {#each folders as folder (folder.id)}
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
          onclick={onCancelMove}
          class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-6 w-6 items-center justify-center rounded transition-colors"
          title="Cancel"
        >
          ×
        </button>
      </div>
    {:else if !isRenaming}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
          >
            <EllipsisVertical size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-40" align="end">
          <DropdownMenuItem onclick={onDuplicate}>
            <Pencil size={11} />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onclick={onStartRename}>
            <Pencil size={11} />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onclick={onStartMove}>
            <FileText size={11} />
            Move to folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-destructive focus:text-destructive"
            onclick={onDelete}
          >
            <Trash2 size={11} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    {/if}
  </div>
</div>
