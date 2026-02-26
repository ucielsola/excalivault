<script lang="ts">
  import Trash2Icon from "@lucide/svelte/icons/trash-2";

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
    drawingName = "",
    onConfirm = () => {},
    onCancel = () => {},
  }: {
    open: boolean;
    drawingName: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
  </div>

  <Dialog {open}>
    <DialogContent class="max-w-[300px]">
      <DialogHeader>
        <div class="flex items-center gap-2.5">
          <div
            class="bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-md"
          >
            <Trash2Icon size={16} class="text-destructive" />
          </div>
          <DialogTitle>Delete drawing?</DialogTitle>
        </div>
      </DialogHeader>

      <DialogDescription>
        Are you sure you want to permanently delete <span
          class="text-foreground font-medium">"{drawingName}"</span
        >? This action cannot be undone.
      </DialogDescription>

      <DialogFooter>
        <Button variant="outline" onclick={onCancel}>Keep it</Button>
        <Button variant="destructive" onclick={onConfirm}>Delete forever</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
