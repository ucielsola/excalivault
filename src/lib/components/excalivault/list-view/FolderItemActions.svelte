<script lang="ts">
  import {
    EllipsisVertical,
    FolderPlus,
    Palette,
    Pencil,
    Trash2,
    Layers,
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
  import { FOLDER_COLORS } from "$lib/utils/folderColors";
  import IconPickerDialog from "$lib/components/ui/IconPickerDialog.svelte";

  interface Props {
    onCreateSubfolder: () => void;
    onRename: () => void;
    onDelete: () => void;
    onChangeColor: (color: string) => void;
    onChangeIcon: (icon: string) => void;
    isRoot?: boolean;
  }

  let {
    onCreateSubfolder,
    onRename,
    onDelete,
    onChangeColor,
    onChangeIcon,
    isRoot = false,
  }: Props = $props();

  let iconPickerOpen = $state(false);
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
    <DropdownMenuItem onclick={() => iconPickerOpen = true}>
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
            onclick={() => onChangeColor(colorValue)}
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
    <DropdownMenuItem onclick={onCreateSubfolder}>
      <FolderPlus size={11} />
      New subfolder
    </DropdownMenuItem>
    <DropdownMenuItem onclick={onRename}>
      <Pencil size={11} />
      Rename
    </DropdownMenuItem>
    {#if !isRoot}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-destructive focus:text-destructive"
        onclick={onDelete}
      >
        <Trash2 size={11} />
        Delete folder
      </DropdownMenuItem>
    {/if}
  </DropdownMenuContent>
</DropdownMenu>

<IconPickerDialog
  bind:open={iconPickerOpen}
  onSelect={onChangeIcon}
  onClose={() => iconPickerOpen = false}
/>
