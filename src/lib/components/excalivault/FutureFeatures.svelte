<script lang="ts">
  import GithubIcon from "@lucide/svelte/icons/github";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import VaultLogo from "./VaultLogo.svelte";
</script>

<div class="flex h-full flex-col">
  <div class="flex items-center justify-between border-b border-border px-4 py-3">
    <VaultLogo size="small" />
    <Badge variant="secondary" class="font-mono text-[10px]">roadmap</Badge>
  </div>

  <div class="flex flex-1 flex-col gap-3 p-4">
    <div>
      <h2 class="text-sm font-semibold text-foreground">Coming Soon</h2>
      <p class="mt-0.5 text-xs text-muted-foreground">Features on roadmap</p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="group flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:border-primary/30">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <RefreshCwIcon size={14} class="text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-foreground">Overwrite Drawing</p>
            <Badge variant="secondary" class="font-mono text-[9px]">Next</Badge>
          </div>
          <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Update an existing vault entry with your current canvas.
          </p>
        </div>
      </div>

      <div class="group flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:border-primary/30">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
          <CopyIcon size={14} class="text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-foreground">Save New Copy</p>
            <Badge variant="secondary" class="font-mono text-[9px]">Planned</Badge>
          </div>
          <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Fork an existing drawing without overwriting original.
          </p>
        </div>
      </div>

      <div class="group flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:border-primary/30">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
          <GithubIcon size={14} class="text-muted-foreground" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-xs font-medium text-foreground">Save to GitHub</p>
            <Badge variant="secondary" class="font-mono text-[9px]">Planned</Badge>
          </div>
          <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Push drawings to a GitHub repo for version control and sharing.
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 pt-1">
      <div class="h-px flex-1 bg-border" />
      <ShieldIcon size={12} class="text-muted-foreground/30" />
      <div class="h-px flex-1 bg-border" />
    </div>

    <p class="text-center text-[10px] leading-relaxed text-muted-foreground/60">
      Have a feature idea? Open an issue on GitHub.
    </p>
  </div>
</div>
