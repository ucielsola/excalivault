<script lang="ts">
  import type { Snippet } from "svelte";
  import { drawings, folders } from "$lib/stores";
  import WelcomeScreen from "$lib/components/excalivault/welcome/WelcomeScreen.svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let isEmptyVault = $derived(
    drawings.list.length === 0 && folders.folders.length === 0,
  );
</script>

{#if isEmptyVault}
  <WelcomeScreen />
{:else if children}
  {@render children()}
{/if}
