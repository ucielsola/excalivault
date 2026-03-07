<script lang="ts">
  import {
    ChevronDown,
    ChevronRight,
    EllipsisVertical,
    FolderOpen,
    FolderPlus,
    Palette,
    Pencil,
    Trash2,
  } from "@lucide/svelte";

  import InlineInput from "$lib/components/excalivault/shared/InlineInput.svelte";
  import FolderCreation from "$lib/components/excalivault/list-view/FolderCreation.svelte";
  import VaultListItem from "$lib/components/excalivault/list-view/VaultListItem.svelte";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { folders, vaultList } from "$lib/stores";
  import { type FolderData } from "$lib/types";
  import { FOLDER_COLORS, getFolderBadgeClass } from "$lib/utils/folderColors";
  import FolderItem from "./FolderItem.svelte";

  interface Props {
    folder: FolderData;
    level?: number;
  }

  let { folder, level = 0 }: Props = $props();

  let isExpanded = $derived(vaultList.expandedFolders.has(folder.id));
  let isRenaming = $derived(vaultList.renamingId === folder.id);
  let folderDrawings = $derived(vaultList.drawingsInFolder(folder.id));
  let childFolders = $derived(folders.getFolderChildren(folder.id));
  let isCreatingSubfolder = $derived(vaultList.creatingSubfolderId === folder.id);
  let folderBadgeClass = $derived(getFolderBadgeClass(folder.color));
</script>

<div>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
    style="padding-left: {level * 20}px;"
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
        class={folderBadgeClass + " shrink-0"}
      />

      <div class="min-w-0 flex-1">
        {#if isRenaming}
          <InlineInput
            initial={folder.name}
            onConfirm={(v: string) =>
              vaultList.handleRenameFolder(folder.id, v)}
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
              <EllipsisVertical size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48" align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette size={11} />
                Change colour
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {#each Object.entries(FOLDER_COLORS) as [name, colorValue] (name)}
                  <DropdownMenuItem
                    class="flex items-center gap-2"
                    onclick={() => vaultList.handleChangeFolderColor(folder.id, colorValue)}
                  >
                    <div
                      class="h-3 w-3 rounded-full"
                      style="background-color: {colorValue}"
                    ></div>
                    <span class="capitalize">{name}</span>
                  </DropdownMenuItem>
                {/each}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              onclick={() => {
                folders.toggleFolder(folder.id);
                vaultList.creatingSubfolderId = folder.id;
              }}
            >
              <FolderPlus size={11} />
              New subfolder
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

  {#if isExpanded}
    {#if folderDrawings.length > 0}
      <div class="border-border/30 bg-secondary/20 border-b">
        {#each folderDrawings as drawing (drawing.id)}
          <VaultListItem
            {drawing}
            indent={true}
            showFolderBadge={false}
          />
        {/each}
      </div>
    {/if}

    {#if childFolders.length > 0}
      {#each childFolders as childFolder (childFolder.id)}
        <FolderItem folder={childFolder} level={level + 1} />
      {/each}
    {/if}
  {/if}

  {#if isCreatingSubfolder}
    <div class="border-border/50 bg-secondary/10 border-b" style="padding-left: {level * 20}px;">
      <div class="flex items-center gap-2 px-4 py-2.5">
        <div class="h-5 w-5 shrink-0"></div>
        <FolderCreation
          onConfirm={(name, color) => {
            vaultList.handleCreateSubFolder(folder.id, name, color);
          }}
          onCancel={() => {
            vaultList.creatingSubfolderId = null;
          }}
        />
      </div>
    </div>
  {/if}
</div>
