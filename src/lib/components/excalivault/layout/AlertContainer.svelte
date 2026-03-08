<script lang="ts">
  import { alerts } from "$lib/stores";
  import { Alert } from "$lib/components/ui/alert";
  import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "@lucide/svelte";

  function getIconForType(type: string) {
    switch (type) {
      case "success":
        return CheckCircle;
      case "error":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
      default:
        return Info;
    }
  }

  function getVariantForType(type: string) {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "destructive";
      case "warning":
        return "warning";
      case "info":
      default:
        return "info";
    }
  }
</script>

<div class="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
  {#each alerts.alerts as alert (alert.id)}
    <Alert
      variant={getVariantForType(alert.type)}
      class="pointer-events-auto flex w-full max-w-sm items-start gap-3 shadow-lg"
    >
      <svelte:component this={getIconForType(alert.type)} size={16} class="mt-0.5 shrink-0" />
      <div class="flex-1">{alert.message}</div>
      <button
        onclick={() => alerts.removeAlert(alert.id)}
        class="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
    </Alert>
  {/each}
</div>
