<script lang="ts">
  import { DialogManager } from "$lib/components/excalivault/dialogs";
  import AlertContainer from "$lib/components/excalivault/layout/AlertContainer.svelte";
  import ExcalivaultContainer from "$lib/components/excalivault/layout/ExcalivaultContainer.svelte";
  import Footer from "$lib/components/excalivault/layout/Footer.svelte";
  import VaultHeader from "$lib/components/excalivault/layout/VaultHeader.svelte";
  import VaultLayout from "$lib/components/excalivault/layout/VaultLayout.svelte";
  import MainView from "$lib/components/excalivault/main/MainView.svelte";
  import SettingsView from "$lib/components/excalivault/settings/SettingsView.svelte";
  import { viewStore } from "$lib/stores";
</script>

<AlertContainer />
<DialogManager />

<ExcalivaultContainer>
  {#snippet children(setListRef)}
    <div class="flex h-full flex-col overflow-hidden">
      <VaultHeader />

      <div class="flex-1 overflow-hidden">
        <VaultLayout>
          {#if viewStore.currentView === "main"}
            <MainView {setListRef} />
          {:else if viewStore.currentView === "settings"}
            <SettingsView />
          {/if}
        </VaultLayout>
      </div>

      <Footer />
    </div>
  {/snippet}
</ExcalivaultContainer>
