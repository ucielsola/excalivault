<script lang="ts">
  import { SearchIcon } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import { drawings } from "$lib/stores";

  export let className: string = "";
</script>

<div
  class="border-border bg-input flex items-center gap-2 rounded-md border px-2.5 py-1.5 {className}"
>
  <SearchIcon size={13} class="text-muted-foreground/50" />
  <Input
    bind:value={drawings.search}
    placeholder="Search vault..."
    class="text-foreground placeholder:text-muted-foreground/40 w-full border-none bg-transparent p-0 font-mono text-xs focus-visible:ring-0"
  />
</div>
