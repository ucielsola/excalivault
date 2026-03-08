<script lang="ts">
  import { SavePanel } from "$lib/components/excalivault/dialogs";
  import CurrentDrawing from "$lib/components/excalivault/CurrentDrawing.svelte";
  import SaveActionsBar from "$lib/components/excalivault/SaveActionsBar.svelte";
  import VaultNavigator from "$lib/components/excalivault/VaultNavigator.svelte";
  import { vaultList } from "$lib/stores";

  interface Props {
    setListRef: (ref: HTMLDivElement) => void;
  }

  let { setListRef }: Props = $props();
  let savePanelOpen = $derived(vaultList.savePanelOpen);
</script>

<div use:setListRef class="flex h-screen flex-col overflow-hidden">
  <div class="flex flex-1 flex-col overflow-hidden">
    <VaultNavigator />
  </div>

  <CurrentDrawing />

  {#if savePanelOpen}
    <SavePanel />
  {:else}
    <div class="border-border border-t">
      <SaveActionsBar />
    </div>
  {/if}
</div>
