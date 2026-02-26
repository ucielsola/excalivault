<script lang="ts">
  import ShieldIcon from "@lucide/svelte/icons/shield";

  const { size = "default" }: { size?: "default" | "small" } = $props();
  const iconClass = $derived(
    size === "small" ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]",
  );
  const textSize = $derived(size === "small" ? "text-xs" : "text-sm");
</script>

<div class="flex items-center gap-2">
  <div class="relative">
    <div class="bg-primary/20 absolute -inset-1 rounded-md blur-sm"></div>
    <ShieldIcon class={iconClass + " text-primary relative"} strokeWidth={2.5}
    ></ShieldIcon>
  </div>
  <span class="text-foreground font-mono font-bold tracking-widest {textSize}">
    EXCALI<span class="text-primary">VAULT</span>
  </span>
</div>
