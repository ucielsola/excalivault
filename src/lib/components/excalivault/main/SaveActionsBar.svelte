<script lang="ts">
  import { Replace, Save } from "@lucide/svelte";
  import { drawings, vaultActions } from "$lib/stores";
  import { Button } from "$lib/components/ui/button";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "$lib/components/ui/tooltip";
</script>

<div class="border-border/50 flex items-center justify-between border-b px-4 py-2.5">
  <div class="flex items-center gap-2">
    {#if !drawings.activeDrawingId || drawings.hasUnsavedChanges}
      <Tooltip>
        <TooltipTrigger>
          <Button
            onclick={() => vaultActions.handleSave()}
            class="bg-primary text-primary-foreground h-7 px-3 text-[11px] font-semibold"
          >
            <Save size={12} />
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {#if !drawings.activeDrawingId}
            Create new drawing
          {:else}
            Save changes to current drawing
          {/if}
        </TooltipContent>
      </Tooltip>
    {:else}
      <Tooltip>
        <TooltipTrigger>
          <Button
            disabled
            class="bg-primary text-primary-foreground h-7 px-3 text-[11px] font-semibold"
          >
            <Save size={12} />
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>No changes to save</TooltipContent>
      </Tooltip>
    {/if}
    {#if drawings.activeDrawingId}
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            onclick={() => vaultActions.handleSaveAsNewCopy()}
            class="h-7 px-3 text-[11px] font-medium"
          >
            <Replace size={12} />
            Save As
          </Button>
        </TooltipTrigger>
        <TooltipContent>Create a new copy of current drawing</TooltipContent>
      </Tooltip>
    {/if}
  </div>
  {#if drawings.hasUnsavedChanges}
    <div
      class="text-destructive bg-destructive/5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
    >
      <span class="bg-destructive h-1.5 w-1.5 rounded-full"></span>
      Unsaved changes
    </div>
  {/if}
</div>
