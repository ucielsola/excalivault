<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import SaveIcon from "@lucide/svelte/icons/save";

  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  import VaultLogo from "./VaultLogo.svelte";

  const { onSave }: { onSave: (name: string) => Promise<void> } = $props();

  let name = $state("");
  let isSaving = $state(false);
  let saved = $state(false);

  async function handleSave() {
    if (!name.trim()) return;
    isSaving = true;
    await onSave(name);
    isSaving = false;
    saved = true;
    setTimeout(() => (saved = false), 2000);
    name = "";
  }
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">v1.0</Badge>
  </div>

  <div class="flex flex-1 flex-col gap-4 p-4">
    <div>
      <h2 class="text-foreground text-sm font-semibold">Save to Vault</h2>
      <p class="text-muted-foreground mt-0.5 text-xs">
        Capture your current Excalidraw canvas
      </p>
    </div>

    <div
      class="border-border bg-secondary relative overflow-hidden rounded-md border"
    >
      <div class="flex h-28 items-center justify-center">
        <svg
          viewBox="0 0 200 100"
          fill="none"
          stroke-width="1.5"
          class="text-muted-foreground/40 h-full w-full"
          stroke="currentColor"
        >
          <rect
            x="20"
            y="15"
            width="60"
            height="35"
            rx="3"
            stroke-dasharray="4 2"
          />
          <rect x="110" y="30" width="70" height="50" rx="3" />
          <line x1="80" y1="32" x2="110" y2="55" stroke-dasharray="6 3" />
          <circle cx="160" cy="20" r="12" stroke-dasharray="3 2" />
          <path d="M 30 80 Q 60 60 90 80 T 150 80" />
        </svg>
      </div>
      <div
        class="from-card/80 absolute right-0 bottom-0 left-0 bg-gradient-to-t to-transparent px-2.5 pt-6 pb-2"
      >
        <span class="text-muted-foreground font-mono text-[10px]"
          >Current canvas</span
        >
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <Label
        for="drawing-name"
        class="text-muted-foreground text-xs font-medium">Drawing name</Label
      >
      <Input
        id="drawing-name"
        bind:value={name}
        placeholder="e.g. Architecture Diagram v2"
        class="font-mono text-xs"
      />
    </div>

    <div
      class="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-md border px-3 py-2"
    >
      <AlertTriangleIcon size={14} class="text-primary mt-0.5 shrink-0" />
      <p class="text-muted-foreground text-[11px] leading-relaxed">
        Drawings share <span class="text-foreground font-medium"
          >localStorage</span
        > across all Excalidraw tabs.
      </p>
    </div>

    <Button
      onclick={handleSave}
      disabled={!name.trim() || isSaving}
      class="w-full"
    >
      {#if isSaving}
        <div
          class="border-primary-foreground/30 border-t-primary-foreground mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2"
        />
        Saving...
      {:else if saved}
        <svg viewBox="0 0 16 16" fill="none" class="mr-2 h-3.5 w-3.5">
          <path
            d="M3 8.5L6.5 12L13 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Saved!
      {:else}
        <SaveIcon size={14} class="mr-2" />
        Save to Vault
      {/if}
    </Button>
  </div>
</div>
