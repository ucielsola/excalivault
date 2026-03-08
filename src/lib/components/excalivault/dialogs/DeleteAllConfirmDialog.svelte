<script lang="ts">
  import { CheckCircle, Trash2Icon, TriangleAlert } from "@lucide/svelte";

  import { VaultLogo } from "$lib/components/excalivault/shared";
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";

  let {
    open = false,
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let phase = $state<"confirm" | "deleted">("confirm");
  let confirmText = $state("");
  const CONFIRM_TEXT = "EXCALIVAULT";

  let canConfirm = $derived(
    confirmText.trim() === CONFIRM_TEXT,
  );

  let handleReset = () => {
    phase = "confirm";
    confirmText = "";
  };

  $effect(() => {
    if (open) {
      handleReset();
    }
  });

  async function handleConfirm() {
    await onConfirm();
    phase = "deleted";
    setTimeout(() => {
      onCancel();
      handleReset();
    }, 3000);
  }

  function handleInput(event: globalThis.Event) {
    confirmText = (event.target as HTMLInputElement).value;
  }
</script>

{#if open}
  <Dialog {open}>
    <DialogContent class="max-w-75">
      {#if phase === "confirm"}
        <DialogHeader>
          <div class="flex items-center gap-2.5">
            <div class="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-md">
              <Trash2Icon size={16} class="text-destructive" />
            </div>
            <DialogTitle>Delete all data?</DialogTitle>
          </div>
        </DialogHeader>

        <div class="space-y-3">
          <DialogDescription>
            This will permanently delete all your drawings and folders. This action cannot be undone.
          </DialogDescription>

          <div class="bg-destructive/5 border-destructive/20 flex items-start gap-2 rounded-md border p-3">
            <TriangleAlert size={14} class="text-destructive mt-0.5 shrink-0" />
            <div class="space-y-1">
              <p class="text-destructive text-[11px] font-medium">
                Type to confirm:
              </p>
              <p class="text-muted-foreground text-[11px] font-mono">
                {CONFIRM_TEXT}
              </p>
            </div>
          </div>

          <div class="space-y-1.5">
            <label
              for="confirm-input"
              class="text-muted-foreground text-[11px] font-medium"
            >
              Type {CONFIRM_TEXT} to continue
            </label>
            <input
              id="confirm-input"
              type="text"
              value={confirmText}
              oninput={handleInput}
              placeholder={CONFIRM_TEXT}
              class="border-border bg-background focus:border-destructive focus:ring-destructive/20 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onclick={onCancel}>Cancel</Button>
          <Button variant="destructive" onclick={handleConfirm} disabled={!canConfirm}>
            Delete all data
          </Button>
        </DialogFooter>
      {:else}
        <div class="flex flex-col items-center gap-3 py-4">
          <div class="bg-green-500/10 flex h-10 w-10 items-center justify-center rounded-full">
            <CheckCircle size={18} class="text-green-500" />
          </div>
          <p class="text-muted-foreground text-xs">
            All data deleted.
          </p>
        </div>
      {/if}
    </DialogContent>
  </Dialog>
{/if}
