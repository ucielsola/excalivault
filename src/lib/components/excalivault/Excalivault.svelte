<script lang="ts">
  import AlertContainer from "$lib/components/excalivault/AlertContainer.svelte";
  import { DialogManager } from "$lib/components/excalivault/dialogs";
  import ExcalivaultContainer from "$lib/components/excalivault/ExcalivaultContainer.svelte";
  import Footer from "$lib/components/excalivault/Footer.svelte";
  import MainView from "$lib/components/excalivault/MainView.svelte";
  import SettingsView from "$lib/components/excalivault/SettingsView.svelte";
  import VaultHeader from "$lib/components/excalivault/VaultHeader.svelte";
  import VaultLayout from "$lib/components/excalivault/VaultLayout.svelte";
  import { viewStore } from "$lib/stores";
</script>

<AlertContainer />
<DialogManager />

<ExcalivaultContainer>
  {#snippet children(setListRef)}
    <VaultLayout>
      <VaultHeader />

      {#if viewStore.currentView === "main"}
        <MainView {setListRef} />
      {:else if viewStore.currentView === "settings"}
        <SettingsView />
      {/if}

      <Footer />
    </VaultLayout>
  {/snippet}
</ExcalivaultContainer>

