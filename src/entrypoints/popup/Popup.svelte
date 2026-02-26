<script lang="ts">
  import "../../app.css";
  import { onMount } from "svelte";
  import browser from "webextension-polyfill";
  import {
    drawings,
    loadDrawings,
    deleteDrawing,
    getCurrentDrawingData,
    saveDrawing,
    isLoading,
    error,
  } from "$lib/stores/drawings";
  import { MessageType, type DrawingData } from "$lib/types";
  
  import VaultList from "$lib/components/excalivault/VaultList.svelte";
  import EmptyVault from "$lib/components/excalivault/EmptyVault.svelte";
  import ConfirmOpen from "$lib/components/excalivault/ConfirmOpen.svelte";
  import DeleteConfirm from "$lib/components/excalivault/DeleteConfirm.svelte";

  type Screen = "vault" | "save" | "empty";

  let currentScreen = $state<Screen>("vault");
  let selectedDrawing = $state<DrawingData | null>(null);
  let confirmOpenOpen = $state(false);
  let deleteConfirmOpen = $state(false);

  onMount(() => {
    loadDrawings();
  });

  const determinedScreen = $derived(() => {
    if ($drawings.length === 0) return "empty";
    return "vault";
  });

  $effect(() => {
    currentScreen = determinedScreen();
  });

  async function handleSave(name: string) {
    const currentData = await getCurrentDrawingData();
    if (!currentData?.id) return;

    await saveDrawing({
      id: currentData.id,
      name,
      elements: currentData.elements,
      appState: currentData.appState,
      versionFiles: "",
      versionDataState: "",
    });
  }

  function handleOpen(drawing: DrawingData) {
    selectedDrawing = drawing;
    confirmOpenOpen = true;
  }

  async function confirmOpen() {
    if (!selectedDrawing) return;

    try {
      await browser.runtime.sendMessage({
        type: MessageType.OPEN_DRAWING,
        payload: {
          id: selectedDrawing.id,
          name: selectedDrawing.name,
          elements: selectedDrawing.elements,
          appState: selectedDrawing.appState,
          versionFiles: selectedDrawing.versionFiles,
          versionDataState: selectedDrawing.versionDataState,
        },
      });
    } catch (e) {
      console.error("Failed to open drawing", e);
    }

    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function cancelOpen() {
    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  async function handleDelete(id: string) {
    const drawing = $drawings.find((d) => d.id === id);
    if (!drawing) return;

    selectedDrawing = drawing;
    deleteConfirmOpen = true;
  }

  async function confirmDelete() {
    if (!selectedDrawing) return;

    await deleteDrawing(selectedDrawing.id);
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }

  function cancelDelete() {
    selectedDrawing = null;
    deleteConfirmOpen = false;
  }
</script>

<div class="flex h-full flex-col">
  {#if currentScreen === "vault"}
    <VaultList
      drawings={$drawings}
      onOpen={handleOpen}
      onDelete={handleDelete}
    />
  {:else if currentScreen === "empty"}
    <EmptyVault />
  {/if}

  {#if confirmOpenOpen && selectedDrawing}
    <ConfirmOpen
      open={confirmOpenOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmOpen}
      onCancel={cancelOpen}
    />
  {/if}

  {#if deleteConfirmOpen && selectedDrawing}
    <DeleteConfirm
      open={deleteConfirmOpen}
      drawingName={selectedDrawing.name}
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
    />
  {/if}
</div>
