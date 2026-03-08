<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import IconPicker from "$lib/components/ui/IconPicker.svelte";

  interface Props {
    open: boolean;
    onSelect: (iconName: string) => void;
    onClose: () => void;
  }

  let { open = $bindable(), onSelect, onClose }: Props = $props();
</script>

<Dialog bind:open>
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>Choose icon</DialogTitle>
    </DialogHeader>

    <div class="py-4">
      <IconPicker {onSelect} {onClose} />
    </div>
  </DialogContent>
</Dialog>
