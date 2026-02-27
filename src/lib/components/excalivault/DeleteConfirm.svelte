<script lang="ts">
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import XIcon from "@lucide/svelte/icons/x";

  import { Button } from "$lib/components/ui/button";

  import VaultLogo from "./VaultLogo.svelte";

  let {
    open = false,
    drawingName = "",
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    open: boolean;
    drawingName: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let phase = $state<"confirm" | "deleted">("confirm");

  async function handleConfirm() {
    await onConfirm();
    phase = "deleted";
  }

  function handleReset() {
    phase = "confirm";
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
  </div>

  {#if open}
    <div
      class="bg-background/80 relative flex flex-1 flex-col items-center justify-center p-4 backdrop-blur-sm"
    >
      {#if phase === "confirm"}
        <div
          class="border-destructive/20 bg-card w-full max-w-[300px] rounded-lg border shadow-2xl"
        >
          <div class="flex items-start justify-between p-4 pb-2">
            <div class="flex items-center gap-2.5">
              <div
                class="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-md"
              >
                <Trash2Icon size={16} class="text-destructive" />
              </div>
              <div>
                <h3 class="text-foreground text-sm font-semibold">
                  Delete drawing?
                </h3>
              </div>
            </div>
            <button
              onclick={onCancel}
              class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded transition-colors"
            >
              <XIcon size={14} />
            </button>
          </div>

          <div class="px-4 py-2">
            <p class="text-muted-foreground text-xs leading-relaxed">
              Are you sure you want to permanently delete
              <span class="text-foreground font-medium">"{drawingName}"</span>
              ? This action cannot be undone.
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 px-4 py-3">
            <Button variant="outline" onclick={onCancel}>Keep it</Button>
            <Button variant="destructive" onclick={handleConfirm}
              >Delete forever</Button
            >
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-3">
          <div
            class="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full"
          >
            <Trash2Icon size={18} class="text-destructive" />
          </div>
          <p class="text-muted-foreground text-xs">Drawing deleted.</p>
          <button
            onclick={handleReset}
            class="text-primary text-[11px] underline underline-offset-2"
          >
            Reset demo
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>
