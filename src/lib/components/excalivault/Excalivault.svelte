<script lang="ts">
    import { onMount } from "svelte";
    import browser from "webextension-polyfill";

    import { drawings, browserTab } from "$lib/stores";
    import { MessageType, type DrawingData } from "$lib/types";

    import VaultList from "$lib/components/excalivault/VaultList.svelte";
    import EmptyVault from "$lib/components/excalivault/EmptyVault.svelte";
    import ConfirmOpen from "$lib/components/excalivault/ConfirmOpen.svelte";
    import DeleteConfirm from "$lib/components/excalivault/DeleteConfirm.svelte";

    const Screens = {
        Vault: "vault",
        Save: "save",
        Empty: "empty",
    } as const;

    type Screen = (typeof Screens)[keyof typeof Screens];

    let currentScreen = $derived<Screen>(
        drawings.list.length === 0 ? Screens.Empty : Screens.Vault,
    );
    let selectedDrawing = $state<DrawingData | null>(null);
    let confirmOpenOpen = $state(false);
    let deleteConfirmOpen = $state(false);
    let currentDrawingTitle = $state("");

    $inspect(drawings.list);

    onMount(async () => {
        drawings.loadDrawings();
        if (browserTab.isExcalidraw) {
            getCurrentDrawingTitle();
        }
    });

    $effect(() => {
        if (browserTab.isExcalidraw && !browserTab.loading) {
            getCurrentDrawingTitle();
        }
    });

    async function getCurrentDrawingTitle() {
        try {
            const currentData = await drawings.getCurrentDrawingData();
            if (currentData?.title) {
                currentDrawingTitle = currentData.title;
            }
        } catch (e) {
            console.error("Failed to get drawing title", e);
        }
    }

    async function handleSave(name: string) {
        const currentData = await drawings.getCurrentDrawingData();
        if (!currentData?.id) return;

        await drawings.saveDrawing({
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
        const drawing = drawings.list.find((d) => d.id === id);
        if (!drawing) return;

        selectedDrawing = drawing;
        deleteConfirmOpen = true;
    }

    async function confirmDelete() {
        if (!selectedDrawing) return;

        await drawings.deleteDrawing(selectedDrawing.id);
        selectedDrawing = null;
        deleteConfirmOpen = false;
    }

    function cancelDelete() {
        selectedDrawing = null;
        deleteConfirmOpen = false;
    }
</script>

<div class="flex h-full min-w-75 flex-col overflow-hidden">
    {#if currentScreen === Screens.Vault}
        <VaultList
            drawings={drawings.list}
            onOpen={handleOpen}
            onDelete={handleDelete}
        />
    {:else if currentScreen === Screens.Empty}
        <EmptyVault
            onSave={handleSave}
            isOnExcalidraw={browserTab.isExcalidraw}
            loading={browserTab.loading}
            drawingTitle={currentDrawingTitle}
        />
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
