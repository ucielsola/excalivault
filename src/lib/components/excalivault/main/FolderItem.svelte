<script lang="ts">
  import { fade } from "svelte/transition";
  import {
    ChevronDown,
    ChevronRight,
    EllipsisVertical,
    FolderPlus,
    Layers,
    Palette,
    Pencil,
    Trash2,
  } from "@lucide/svelte";

  import FolderCreation from "$lib/components/excalivault/main/FolderCreation.svelte";
  import FolderItemSelf from "$lib/components/excalivault/main/FolderItem.svelte";
  import VaultListItem from "$lib/components/excalivault/main/VaultListItem.svelte";
  import InlineInput from "$lib/components/excalivault/shared/InlineInput.svelte";
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
  import IconPickerDialog from "$lib/components/ui/IconPickerDialog.svelte";
  import IconRenderer from "$lib/components/ui/IconRenderer.svelte";
  import { folders, vaultActions, vaultList } from "$lib/stores";
  import { type FolderData } from "$lib/types";
  import { FOLDER_COLORS, getFolderBadgeClass } from "$lib/utils/folderColors";

  interface Props {
    folder: FolderData;
    level?: number;
  }

  let { folder, level = 0 }: Props = $props();

  let isExpanded = $derived(vaultList.expandedFolders.has(folder.id));
  let isSelected = $derived(vaultList.currentFolderId === folder.id);
  let isRenaming = $derived(vaultList.renamingId === folder.id);
  let folderDrawings = $derived(vaultList.drawingsInFolder(folder.id));
  let childFolders = $derived(folders.getFolderChildren(folder.id));
  let isCreatingSubfolder = $derived(
    vaultList.creatingSubfolderId === folder.id,
  );
  let hasContent = $derived(
    folderDrawings.length > 0 || childFolders.length > 0,
  );
  let totalDrawingsCount = $derived(folders.getTotalDrawingsCount(folder.id));

  let iconPickerOpen = $state(false);
  let folderBadgeClass = $derived(getFolderBadgeClass(folder.color));

  function handleIconChange(newIcon: string) {
    folders.updateFolderIcon(folder.id, newIcon);
    iconPickerOpen = false;
  }
</script>

<div>
  <div
    class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
  >
    <div class="flex items-center gap-2 px-4 py-2.5">
      <div class="min-w-0 flex-1">
        {#if isRenaming}
          <InlineInput
            initial={folder.name}
            onConfirm={(v: string) =>
              vaultActions.handleRenameFolder(folder.id, v)}
            onCancel={() => vaultActions.cancelRename()}
          />
        {:else}
          <div class="flex items-center gap-2">
            {#if hasContent}
              <button
                onclick={() => vaultActions.toggleFolder(folder.id)}
                class="text-muted-foreground/50 hover:bg-secondary hover:text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded pl-1 transition-colors"
                style="margin-left: {level * 14 - 14}px;"
              >
                {#if isExpanded}
                  <ChevronDown size={12} />
                {:else}
                  <ChevronRight size={12} />
                {/if}
              </button>
            {:else}
              <div
                class="h-5 w-5 shrink-0"
                style="margin-left: {level * 14 - 14}px;"
              ></div>
            {/if}

            <button
              onclick={() => vaultActions.handleFolderClick(folder.id)}
              class="{isSelected
                ? 'text-primary'
                : 'text-foreground'} hover:text-primary flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <IconRenderer
                name={folder.icon || "FolderOpen"}
                size={14}
                class={folderBadgeClass + " shrink-0"}
                color={folder.color}
              />

              <span
                class="truncate text-xs font-medium {level >= 3
                  ? 'max-w-[120px]'
                  : ''}">{folder.name}</span
              >

              <span
                class="bg-secondary text-muted-foreground shrink-0 rounded px-1 font-mono text-[9px]"
              >
                {totalDrawingsCount}
              </span>
            </button>
          </div>
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
            <DropdownMenuItem onclick={() => (iconPickerOpen = true)}>
              <Layers size={11} />
              Change icon
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette size={11} />
                Change colour
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {#each Object.entries(FOLDER_COLORS) as [name, colorValue] (name)}
                  <DropdownMenuItem
                    class="flex items-center gap-2"
                    onclick={() =>
                      vaultActions.handleChangeFolderColor(
                        folder.id,
                        colorValue,
                      )}
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
                folders.expandFolder(folder.id);
                vaultList.creatingSubfolderId = folder.id;
              }}
            >
              <FolderPlus size={11} />
              New subfolder
            </DropdownMenuItem>
            <DropdownMenuItem
              onclick={() => vaultActions.startRename(folder.id)}
            >
              <Pencil size={11} />
              Rename
            </DropdownMenuItem>
            {#if !folder.isRoot}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive focus:text-destructive"
                onclick={() => vaultActions.handleDeleteFolder(folder.id)}
              >
                <Trash2 size={11} />
                Delete folder
              </DropdownMenuItem>
            {/if}
          </DropdownMenuContent>
        </DropdownMenu>
      {/if}
    </div>
  </div>

  {#if isExpanded}
    {#if childFolders.length > 0}
      {#each childFolders as childFolder (childFolder.id)}
        <div transition:fade|local>
          <FolderItemSelf folder={childFolder} level={level + 1} />
        </div>
      {/each}
    {/if}

    {#if folderDrawings.length > 0}
      <div class="border-border/30 bg-secondary/20 border-b">
        {#each folderDrawings as drawing (drawing.id)}
          <div transition:fade|local>
            <VaultListItem {drawing} indent={true} showFolderBadge={false} />
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  {#if isCreatingSubfolder}
    <div
      class="border-border/50 bg-secondary/10 border-b"
      style="padding-left: {level * 14}px;"
      onkeydown={(e) => e.stopPropagation()}
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center gap-2 px-4 py-2.5">
        <div class="h-5 w-5 shrink-0"></div>
        <FolderCreation
          onConfirm={(name, color, icon) => {
            vaultActions.handleCreateSubFolder(folder.id, name, color, icon);
          }}
          onCancel={() => {
            vaultList.creatingSubfolderId = null;
          }}
        />
      </div>
    </div>
  {/if}
</div>

<IconPickerDialog
  bind:open={iconPickerOpen}
  onSelect={handleIconChange}
  onClose={() => (iconPickerOpen = false)}
/>
