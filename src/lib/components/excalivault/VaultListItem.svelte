<script lang="ts">
  import {
    Clock,
    Copy,
    ExternalLink,
    FolderInput,
    FolderOpen,
    MoreVertical,
    Pencil,
    Trash2,
    X,
  } from "@lucide/svelte";

  import { type DrawingData, type FolderData } from "$lib/types";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  import InlineInput from "./InlineInput.svelte";

  interface Props {
    drawing: DrawingData;
    indent?: boolean;
    isRenaming: boolean;
    menuOpen: boolean;
    moveTarget: boolean;
    folders: FolderData[];
    showFolderBadge?: boolean;
    folderName?: string;
    folderColor?: string;
    formatDate: (timestamp: number) => string;
    _onOpen: () => void;
    onDelete: () => void;
    onMenuToggle: () => void;
    onRename: (name: string) => void;
    onStartRename: () => void;
    onCancelRename: () => void;
    onDuplicate: () => void;
    onStartMove: () => void;
    onMove: (folderId: string | null) => void;
    onCancelMove: () => void;
  }

  const {
    drawing,
    indent = false,
    isRenaming,
    menuOpen,
    moveTarget,
    folders,
    showFolderBadge,
    folderName,
    folderColor,
    formatDate,
    _onOpen,
    onDelete,
    onMenuToggle,
    onRename,
    onStartRename,
    onCancelRename,
    onDuplicate,
    onStartMove,
    onMove,
    onCancelMove,
  }: Props = $props();
</script>

<div
  class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
>
  <div class="flex items-center gap-3 py-2.5 pr-4 {indent ? 'pl-11' : 'pl-4'}">
    <div
      class="border-border bg-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded border"
    >
      <svg
        viewBox="0 0 32 32"
        class="text-muted-foreground/50 h-4 w-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect
          x="4"
          y="6"
          width="14"
          height="10"
          rx="1.5"
          stroke-dasharray="3 1.5"
        />
        <circle cx="24" cy="22" r="5" />
        <line x1="18" y1="16" x2="19" y2="22" stroke-dasharray="2 1" />
      </svg>
    </div>

    <div class="min-w-0 flex-1">
      {#if isRenaming}
        <InlineInput
          initial={drawing.name}
          onConfirm={onRename}
          onCancel={onCancelRename}
        />
      {:else}
        <p class="text-foreground truncate text-[11px] font-medium">
          {drawing.name}
        </p>
        <div class="mt-0.5 flex items-center gap-2">
          <span
            class="text-muted-foreground flex items-center gap-1 text-[10px]"
          >
            <Clock size={9} />
            {formatDate(drawing.updatedAt)}
          </span>
          <span class="text-muted-foreground/40 text-[10px]">
            {JSON.parse(drawing.elements).length} el.
          </span>
          {#if showFolderBadge && folderName && folderColor}
            <span
              class="rounded px-1 py-px text-[9px] font-medium transition-colors {getFolderBadgeClass(
                folderColor,
              )}"
            >
              {folderName}
            </span>
          {/if}
        </div>
      {/if}
    </div>

    {#if !isRenaming}
      <div
        class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <button
          class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded"
          title="Open in new tab"
        >
          <ExternalLink size={12} />
        </button>
        <button
          onclick={onMenuToggle}
          class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
        >
          <MoreVertical size={12} />
        </button>
      </div>
    {/if}
  </div>

  {#if moveTarget}
    <div class="border-border/30 bg-secondary/40 border-t px-4 py-2">
      <p
        class="text-muted-foreground/50 mb-1.5 font-mono text-[9px] font-medium tracking-wider uppercase"
      >
        Move to
      </p>
      <div class="flex flex-wrap gap-1.5">
        <button
          onclick={() => onMove(null)}
          class="border-border bg-card hover:border-primary/30 hover:text-foreground text-muted-foreground flex items-center gap-1 rounded border px-2 py-1 text-[10px] transition-colors"
        >
          <X size={9} />
          Unfiled
        </button>
        {#each folders.filter((f) => f.id !== drawing.folderId) as folder (folder.id)}
          <button
            onclick={() => onMove(folder.id)}
            class="border-border hover:border-primary/30 bg-card flex items-center gap-1 rounded border px-2 py-1 text-[10px] transition-colors {getFolderBadgeClass(
              folder.color,
            )}"
          >
            <FolderOpen size={9} />
            {folder.name}
          </button>
        {/each}
        <button
          onclick={onCancelMove}
          class="text-muted-foreground/50 hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-[10px]"
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  {#if menuOpen}
    <div
      class="border-border bg-card absolute top-9 right-3 z-20 min-w-[150px] rounded-md border p-1 shadow-xl"
    >
      <button
        class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
      >
        <ExternalLink size={11} />
        Open in tab
      </button>
      <button
        onclick={onStartRename}
        class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
      >
        <Pencil size={11} />
        Rename
      </button>
      <button
        onclick={onDuplicate}
        class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
      >
        <Copy size={11} />
        Duplicate
      </button>
      <button
        onclick={onStartMove}
        class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
      >
        <FolderInput size={11} />
        Move to folder
      </button>
      <div class="border-border bg-border my-1 h-px" />
      <button
        onclick={onDelete}
        class="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
      >
        <Trash2 size={11} />
        Delete
      </button>
    </div>
  {/if}
</div>
