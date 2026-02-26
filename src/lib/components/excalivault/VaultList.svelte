<script lang="ts">
  import {
    ClockIcon,
    MoreVerticalIcon,
    SearchIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import browser from "webextension-polyfill";

  import { Badge } from "$lib/components/ui/badge";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import { captureException } from "$lib/services/sentry";
  import { drawings } from "$lib/stores";
  import { MessageType, type DrawingData } from "$lib/types";

  import ConfirmOpen from "./ConfirmOpen.svelte";
  import DeleteConfirm from "./DeleteConfirm.svelte";
  import VaultLogo from "./VaultLogo.svelte";

  let search = $state("");
  let menuOpenId = $state<string | null>(null);
  let selectedDrawing = $state<DrawingData | null>(null);
  let confirmOpenOpen = $state(false);
  let deleteConfirmOpen = $state(false);

  const filteredDrawings = $derived(
    drawings.list.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  function formatDate(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return "Just now";
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function handleDropdownMenu(id: string, open: boolean) {
    menuOpenId = open ? id : null;
  }

  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  function handleOpen(drawing: DrawingData) {
    selectedDrawing = drawing;
    confirmOpenOpen = true;
  }

  async function confirmOpen() {
    if (!selectedDrawing) return;

    try {
      await browser.runtime.sendMessage({
        type: MessageType.OPEN_DRAWING,
        payload: {
          id: selectedDrawing.id,
          name: selectedDrawing.name,
          elements: selectedDrawing.elements,
          appState: selectedDrawing.appState,
          versionFiles: selectedDrawing.versionFiles,
          versionDataState: selectedDrawing.versionDataState,
        },
      });
    } catch (e) {
      captureException(e as Error, {
        serviceName: "VaultList",
        methodName: "confirmOpen",
      });
    }

    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function cancelOpen() {
    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function handleDelete(id: string) {
    const drawing = drawings.list.find((d) => d.id === id);
    if (!drawing) return;

    selectedDrawing = drawing;
    deleteConfirmOpen = true;
  }

  async function confirmDelete() {
    if (!selectedDrawing) return;

    await drawings.deleteDrawing(selectedDrawing.id);
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }

  function cancelDelete() {
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
    <Badge
      variant="secondary"
      class="text-primary flex h-5 w-5 items-center justify-center font-mono text-[10px] font-bold"
    >
      {drawings.list.length}
    </Badge>
  </div>

  <div class="border-border border-b px-4 py-2.5">
    <div
      class="border-border bg-input flex items-center gap-2 rounded-md border px-2.5 py-1.5"
    >
      <SearchIcon size={13} class="text-muted-foreground/50" />
      <Input
        bind:value={search}
        placeholder="Search vault..."
        class="text-foreground placeholder:text-muted-foreground/40 w-full border-none bg-transparent p-0 font-mono text-xs focus-visible:ring-0"
      />
    </div>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#each filteredDrawings as drawing (drawing.id)}
      <div
        class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
        onmouseleave={() => {
          menuOpenId = null;
        }}
        onclick={() => handleOpen(drawing)}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen(drawing);
          }
        }}
        role="button"
        tabindex="0"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <div
            class="border-border bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded border"
          >
            <svg
              viewBox="0 0 32 32"
              class="text-muted-foreground/50 h-5 w-5"
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
            <p class="text-foreground truncate text-xs font-medium">
              {drawing.name}
            </p>
            <div class="mt-0.5 flex items-center gap-2">
              <span
                class="text-muted-foreground flex items-center gap-1 text-[10px]"
              >
                <ClockIcon size={10} />
                {formatDate(drawing.updatedAt)}
              </span>
            </div>
          </div>

          <div
            class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
            onclick={stopPropagation}
            role="button"
          >
            <DropdownMenu
              open={menuOpenId === drawing.id}
              onOpenChange={(open) => handleDropdownMenu(drawing.id, open)}
            >
              <DropdownMenuTrigger>
                <button
                  class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  type="button"
                >
                  <MoreVerticalIcon size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="min-w-[140px]">
                <DropdownMenuItem
                  onclick={() => handleDelete(drawing.id)}
                  class="text-destructive focus:text-destructive"
                >
                  <Trash2Icon size={12} class="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="border-border border-t px-4 py-2">
    <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
      {drawings.list.length} drawings in vault
    </p>
  </div>

  {#if confirmOpenOpen && selectedDrawing}
    <ConfirmOpen
      open={confirmOpenOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmOpen}
      onCancel={cancelOpen}
    />
  {/if}

  {#if deleteConfirmOpen && selectedDrawing}
    <DeleteConfirm
      open={deleteConfirmOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
    />
  {/if}
</div>
