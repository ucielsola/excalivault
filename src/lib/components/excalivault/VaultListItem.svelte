<script lang="ts">
  import { ClockIcon, EllipsisVertical, Trash2Icon } from "@lucide/svelte";

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { type DrawingData } from "$lib/types";

  export let drawing: DrawingData;
  export let menuOpenId: string | null = null;
  export let formatDate: (timestamp: number) => string;

  export let onOpen: () => void;
  export let onDelete: () => void;
  export let onDropdownMenuChange: (open: boolean) => void;
</script>

<div
  class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }}
  role="button"
  tabindex="0"
>
  <div class="grid grid-cols-[1fr_auto] items-stretch">
    <button
      class="flex items-center gap-3 px-4 py-3 text-start"
      onclick={onOpen}
    >
      {#if drawing.imageBase64}
        <img
          src={drawing.imageBase64}
          class="border-border bg-secondary h-10 w-10 shrink-0 rounded border object-cover"
          alt={drawing.name}
        />
      {:else}
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
      {/if}

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
    </button>

    <DropdownMenu
      open={menuOpenId === drawing.id}
      onOpenChange={onDropdownMenuChange}
    >
      <DropdownMenuTrigger
        class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-full items-center justify-center px-3 transition-colors data-[state=open]:bg-secondary"
      >
        <EllipsisVertical size={13} />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[140px]">
        <DropdownMenuItem
          onclick={onDelete}
          class="text-destructive focus:text-destructive"
        >
          <Trash2Icon size={12} class="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
