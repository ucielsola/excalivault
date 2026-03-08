<script lang="ts">
  import { Trash2Icon } from "@lucide/svelte";

  import { vaultActions } from "$lib/stores";
  import { Button } from "$lib/components/ui/button";
</script>

<div class="flex flex-col gap-4 p-4">
  <section class="bg-destructive/5 border-destructive/20 rounded-lg border p-4">
    <h2 class="text-destructive font-semibold text-sm">Danger Zone</h2>
    <p class="text-muted-foreground mb-3 mt-1 text-xs">
      Permanently delete all your drawings and folders. This action cannot be undone.
    </p>
    <Button
      variant="destructive"
      size="sm"
      class="gap-2"
      onclick={() => vaultActions.handleDeleteAllData()}
    >
      <Trash2Icon size={14} />
      Delete all data
    </Button>
  </section>
</div>
