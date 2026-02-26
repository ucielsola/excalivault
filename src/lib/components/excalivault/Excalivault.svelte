<script lang="ts">
  import { onMount } from "svelte";

  import EmptyVault from "$lib/components/excalivault/EmptyVault.svelte";
  import VaultList from "$lib/components/excalivault/VaultList.svelte";
  import { drawings } from "$lib/stores";

  const Screens = {
    Vault: "vault",
    Empty: "empty",
  } as const;

  type Screen = (typeof Screens)[keyof typeof Screens];

  let currentScreen = $derived<Screen>(
    drawings.list.length === 0 ? Screens.Empty : Screens.Vault,
  );

  onMount(async () => {
    drawings.loadDrawings();
  });
</script>

<div class="flex h-full min-w-75 flex-col overflow-hidden">
  {#if currentScreen === Screens.Vault}
    <VaultList />
  {:else if currentScreen === Screens.Empty}
    <EmptyVault />
  {/if}
</div>
