<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  interface Props {
    open: boolean;
    parentId: string | null;
    onConfirm: (name: string) => void;
    onCancel: () => void;
  }

  const { open, parentId, onConfirm, onCancel }: Props = $props();

  let name = $state("");

  function handleConfirm() {
    if (name.trim()) {
      onConfirm(name.trim());
      name = "";
    }
  }

  function handleCancel() {
    name = "";
    onCancel();
  }
</script>

<Dialog.Root {open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>New Folder</Dialog.Title>
      <Dialog.Description>
        Create a new folder {parentId
          ? "inside the selected folder"
          : "in the root directory"}.
      </Dialog.Description>
    </Dialog.Header>

    <div class="py-4">
      <div class="space-y-2">
        <Label for="folder-name">Folder name</Label>
        <Input
          id="folder-name"
          bind:value={name}
          placeholder="My drawings"
          onkeydown={(e) => e.key === "Enter" && handleConfirm()}
          autofocus
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={handleCancel}>Cancel</Button>
      <Button onclick={handleConfirm}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
