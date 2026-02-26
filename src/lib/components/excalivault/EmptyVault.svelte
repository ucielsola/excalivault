<script lang="ts">
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import VaultLogo from "./VaultLogo.svelte";
  import browser from "webextension-polyfill";
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-border px-4 py-3">
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">v1.0</Badge>
  </div>

  <div class="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <div class="relative">
      <div class="absolute -inset-4 rounded-full bg-primary/5"></div>
      <div class="absolute -inset-8 rounded-full bg-primary/[0.02]"></div>
      <div class="relative flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-secondary">
        <ShieldIcon size={28} class="text-muted-foreground/30" strokeWidth={1.5}></ShieldIcon>
      </div>
    </div>

    <div class="text-center">
      <h3 class="text-sm font-semibold text-foreground">Your vault is empty</h3>
      <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
        Open an Excalidraw canvas and save it here to get started.
      </p>
    </div>

    <Button variant="outline" class="gap-2" onclick={() => browser.tabs.create({ url: "https://excalidraw.com/" })}>
      <FolderOpenIcon size={14} />
      Open Excalidraw
    </Button>
  </div>

  <div class="border-t border-border px-4 py-2">
    <p class="text-center font-mono text-[10px] text-muted-foreground/50">
      0 drawings in vault
    </p>
  </div>
</div>
