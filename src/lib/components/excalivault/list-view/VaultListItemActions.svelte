<script lang="ts">
  import {
    CopyPlus,
    EllipsisVertical,
    FolderInput,
    FolderOpen,
    FolderX,
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
  import { drawings, folders } from "$lib/stores";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  interface Props {
    onDuplicate: () => void;
    onStartRename: () => void;
    onDelete: () => void;
    drawingId: string;
    currentFolderId: string | null;
  }

  let { onDuplicate, onStartRename, onDelete, drawingId, currentFolderId }: Props = $props();

  let rootFolders = $derived(folders.getFolderChildren(null));

  function isCurrentFolder(folderId: string | null): boolean {
    return folderId === currentFolderId;
  }
</script>

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
      <CopyPlus size={11} />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuItem onclick={onStartRename}>
      <Pencil size={11} />
      Rename
    </DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <FolderInput size={11} />
        Move to folder
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {#each rootFolders as folder (folder.id)}
          {@const childFolders = folders.getFolderChildren(folder.id)}
          {#if childFolders.length > 0}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger class="flex items-center gap-2">
                <FolderOpen size={11} class={getFolderBadgeClass(folder.color)} />
                <span class={isCurrentFolder(folder.id) ? "font-semibold" : ""}>{folder.name}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {#each childFolders as child (child.id)}
                  {@const grandchildren = folders.getFolderChildren(child.id)}
                  {#if grandchildren.length > 0}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger class="flex items-center gap-2">
                        <FolderOpen size={11} class={getFolderBadgeClass(child.color)} />
                        <span class={isCurrentFolder(child.id) ? "font-semibold" : ""}>{child.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {#each grandchildren as grandchild (grandchild.id)}
                          <DropdownMenuItem
                            class="flex items-center gap-2"
                            onclick={() => drawings.moveDrawing(drawingId, grandchild.id)}
                          >
                            <FolderOpen size={11} class={getFolderBadgeClass(grandchild.color)} />
                            <span class={isCurrentFolder(grandchild.id) ? "font-semibold" : ""}>{grandchild.name}</span>
                          </DropdownMenuItem>
                        {/each}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  {:else}
                    <DropdownMenuItem
                      class="flex items-center gap-2"
                      onclick={() => drawings.moveDrawing(drawingId, child.id)}
                    >
                      <FolderOpen size={11} class={getFolderBadgeClass(child.color)} />
                      <span class={isCurrentFolder(child.id) ? "font-semibold" : ""}>{child.name}</span>
                    </DropdownMenuItem>
                  {/if}
                {/each}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          {:else}
            <DropdownMenuItem
              class="flex items-center gap-2"
              onclick={() => drawings.moveDrawing(drawingId, folder.id)}
            >
              <FolderOpen size={11} class={getFolderBadgeClass(folder.color)} />
              <span class={isCurrentFolder(folder.id) ? "font-semibold" : ""}>{folder.name}</span>
            </DropdownMenuItem>
          {/if}
        {/each}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          class="flex items-center gap-2"
          onclick={() => drawings.moveDrawing(drawingId, null)}
        >
          <FolderX size={11} />
          <span class={isCurrentFolder(null) ? "font-semibold" : ""}>Unfiled</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
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
