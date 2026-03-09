<script>
  import "../../app.css";

  import Excalivault from "$lib/components/excalivault/Excalivault.svelte";
  import { TooltipProvider } from "$lib/components/ui/tooltip";
</script>

<div class="h-dvh">
  <TooltipProvider>
    <Excalivault />
  </TooltipProvider>
</div>
