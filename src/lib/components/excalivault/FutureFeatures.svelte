<script lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import GithubIcon from "@lucide/svelte/icons/github";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import ShieldIcon from "@lucide/svelte/icons/shield";

  import { Badge } from "$lib/components/ui/badge";

  import VaultLogo from "./VaultLogo.svelte";
</script>

<div class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">roadmap</Badge>
  </div>

  <div class="flex flex-1 flex-col gap-3 p-4">
    <div>
      <h2 class="text-foreground text-sm font-semibold">Coming Soon</h2>
      <p class="text-muted-foreground mt-0.5 text-xs">Features on roadmap</p>
    </div>

    <div class="flex flex-col gap-2">
      <div
        class="group border-border bg-secondary/50 hover:border-primary/30 flex items-start gap-3 rounded-lg border p-3 transition-colors"
      >
        <div
          class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        >
          <RefreshCwIcon size={14} class="text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-foreground text-xs font-medium">Overwrite Drawing</p>
            <Badge variant="secondary" class="font-mono text-[9px]">Next</Badge>
          </div>
          <p class="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
            Update an existing vault entry with your current canvas.
          </p>
        </div>
      </div>

      <div
        class="group border-border bg-secondary/50 hover:border-primary/30 flex items-start gap-3 rounded-lg border p-3 transition-colors"
      >
        <div
          class="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        >
          <CopyIcon size={14} class="text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-foreground text-xs font-medium">Save New Copy</p>
            <Badge variant="secondary" class="font-mono text-[9px]"
              >Planned</Badge
            >
          </div>
          <p class="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
            Fork an existing drawing without overwriting original.
          </p>
        </div>
      </div>

      <div
        class="group border-border bg-secondary/50 hover:border-primary/30 flex items-start gap-3 rounded-lg border p-3 transition-colors"
      >
        <div
          class="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        >
          <GithubIcon size={14} class="text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-foreground text-xs font-medium">Save to GitHub</p>
            <Badge variant="secondary" class="font-mono text-[9px]"
              >Planned</Badge
            >
          </div>
          <p class="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
            Push drawings to a GitHub repo for version control and sharing.
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 pt-1">
      <div class="bg-border h-px flex-1" />
      <ShieldIcon size={12} class="text-muted-foreground/30" />
      <div class="bg-border h-px flex-1" />
    </div>

    <p class="text-muted-foreground/60 text-center text-[10px] leading-relaxed">
      Have a feature idea? Open an issue on GitHub.
    </p>
  </div>
</div>
