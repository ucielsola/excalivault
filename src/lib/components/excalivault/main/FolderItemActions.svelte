<script lang="ts">
  import {
    EllipsisVertical,
    Layers,
    FolderPlus,
    Palette,
    Pencil,
    Trash2,
  } from "@lucide/svelte";

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

  import { folders, vaultActions, vaultList } from "$lib/stores";
  import { type FolderData } from "$lib/types";
  import { FOLDER_COLORS } from "$lib/utils/folderColors";

  interface Props {
    folder: FolderData;
    onIconPickerOpen: () => void;
  }

  let { folder, onIconPickerOpen }: Props = $props();
</script>

<DropdownMenu>
  <DropdownMenuTrigger>
    <button
      class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
    >
      <EllipsisVertical size={12} />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent class="w-48" align="end">
    <DropdownMenuItem onclick={onIconPickerOpen}>
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
