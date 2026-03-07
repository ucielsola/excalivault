<script lang="ts">
  import { AlertTriangle, Trash2Icon } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";

  import VaultLogo from "./VaultLogo.svelte";

  let {
    open = false,
    itemName = "",
    itemType = "drawing",
    subfolderCount = 0,
    subfolderDrawingCount = 0,
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    open: boolean;
    itemName: string;
    itemType?: "drawing" | "folder";
    subfolderCount?: number;
    subfolderDrawingCount?: number;
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

  let hasSubfolders = $derived(itemType === "folder" && (subfolderCount > 0 || subfolderDrawingCount > 0));
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
  </div>

  {#if open}
    <Dialog {open}>
      <DialogContent class="max-w-75">
        {#if phase === "confirm"}
          <DialogHeader>
            <div class="flex items-center gap-2.5">
              <div
                class="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-md"
              >
                <Trash2Icon size={16} class="text-destructive" />
              </div>
              <DialogTitle>Delete {itemType}?</DialogTitle>
            </div>
          </DialogHeader>

          <div class="space-y-3">
            <DialogDescription>
              Are you sure you want to permanently delete
              <span class="text-foreground font-medium">"{itemName}"</span>
              ? This action cannot be undone.
            </DialogDescription>
            {#if hasSubfolders}
              <div class="bg-destructive/5 border-destructive/20 flex items-start gap-2 rounded-md border p-3">
                <AlertTriangle size={14} class="text-destructive shrink-0 mt-0.5" />
                <div class="space-y-1">
                  <p class="text-destructive text-[11px] font-medium">
                    This will also delete:
                  </p>
                  <p class="text-muted-foreground text-[11px]">
                    {subfolderCount > 0 && `${subfolderCount} subfolder${subfolderCount > 1 ? "s" : ""}`}
                    {subfolderCount > 0 && subfolderDrawingCount > 0 && " and "}
                    {subfolderDrawingCount > 0 && `${subfolderDrawingCount} drawing${subfolderDrawingCount > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
            {/if}
          </div>

          <DialogFooter>
            <Button variant="outline" onclick={onCancel}>Keep it</Button>
            <Button variant="destructive" onclick={handleConfirm}
              >Delete forever</Button
            >
          </DialogFooter>
        {:else}
          <div class="flex flex-col items-center gap-3 py-4">
            <div
              class="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Trash2Icon size={18} class="text-destructive" />
            </div>
            <p class="text-muted-foreground text-xs">{itemType === "drawing" ? "Drawing" : "Folder"} deleted.</p>
            <button
              onclick={handleReset}
              class="text-primary text-[11px] underline underline-offset-2"
            >
              Reset demo
            </button>
          </div>
        {/if}
      </DialogContent>
    </Dialog>
  {/if}
</div>
