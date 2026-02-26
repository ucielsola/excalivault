<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import { Button } from "$lib/components/ui/button";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "$lib/components/ui/dialog";
  import VaultLogo from "./VaultLogo.svelte";

  let { 
    open = false,
    drawingName = "",
    onConfirm = () => {},
    onCancel = () => {}
  }: { 
    open: boolean;
    drawingName: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-border px-4 py-3">
    <VaultLogo size="small" />
  </div>

  <Dialog {open}>
    <DialogContent class="max-w-[300px]">
      <DialogHeader>
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <AlertTriangleIcon size={16} class="text-primary" />
          </div>
          <DialogTitle>Open drawing?</DialogTitle>
        </div>
      </DialogHeader>

      <div class="space-y-3">
        <DialogDescription>
          Loading <span class="font-medium text-foreground">"{drawingName}"</span> will <span class="font-semibold text-destructive">overwrite</span> your current canvas.
        </DialogDescription>

        <div class="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2">
          <AlertTriangleIcon size={12} class="mt-0.5 shrink-0 text-primary" />
          <p class="text-[10px] leading-relaxed text-muted-foreground">
            All tabs sharing Excalidraw localStorage will be affected.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onclick={onCancel}>Cancel</Button>
        <Button onclick={onConfirm}>Open & Replace</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
