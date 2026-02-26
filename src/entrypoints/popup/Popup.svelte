<script lang="ts">
    import "../../app.css";
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
    import { onMount } from "svelte";
    import browser from "webextension-polyfill";

    let currentData = $state<{
        id: string | null;
        title: string | null;
        elements: string;
        appState: string;
    } | null>(null);
    let saveName = $state("");
    let activeTab = $state<"vault" | "current">("vault");
    let drawingToOpen = $state<DrawingData | null>(null);

    onMount(() => {
        loadDrawings();
    });
    $inspect(currentData);

    async function fetchCurrentDrawing() {
        currentData = await getCurrentDrawingData();

        if (currentData?.id) {
            saveName = currentData.title || `Drawing-${Date.now()}`;
        }
    }

    async function handleSave() {
        if (!currentData?.id || !saveName) return;

        await saveDrawing({
            id: currentData.id,
            name: saveName,
            elements: currentData.elements,
            appState: currentData.appState,
            versionFiles: "",
            versionDataState: "",
        });

        saveName = "";
        currentData = null;
    }

    async function handleDelete(id: string) {
        if (confirm("Delete this drawing?")) {
            await deleteDrawing(id);
        }
    }

    async function openDrawing(drawing: DrawingData) {
        drawingToOpen = drawing;
    }

    async function confirmOpenDrawing() {
        if (!drawingToOpen) return;

        try {
            await browser.runtime.sendMessage({
                type: MessageType.OPEN_DRAWING,
                payload: {
                    id: drawingToOpen.id,
                    name: drawingToOpen.name,
                    elements: drawingToOpen.elements,
                    appState: drawingToOpen.appState,
                    versionFiles: drawingToOpen.versionFiles,
                    versionDataState: drawingToOpen.versionDataState,
                },
            });
        } catch (e) {
            console.error("Failed to open drawing", e);
        }

        drawingToOpen = null;
    }

    function cancelOpenDrawing() {
        drawingToOpen = null;
    }
</script>

<div class="min-w-80 bg-zinc-900 text-zinc-100">
    <div class="p-4 border-b border-zinc-700">
        <h1 class="text-xl font-bold">Excalivault</h1>
        <p class="text-sm text-zinc-400">Personal vault for Excalidraws</p>
    </div>

    <div class="flex border-b border-zinc-700">
        <button
            class="flex-1 p-2 text-sm font-medium transition-colors {activeTab ===
            'vault'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'}"
            onclick={() => (activeTab = "vault")}
        >
            Vault
        </button>
        <button
            class="flex-1 p-2 text-sm font-medium transition-colors {activeTab ===
            'current'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'}"
            onclick={() => {
                activeTab = "current";
                fetchCurrentDrawing();
            }}
        >
            Current
        </button>
    </div>

    <div class="p-4">
        {#if $error}
            <div
                class="mb-4 p-2 bg-red-900/50 border border-red-700 rounded text-sm text-red-200"
            >
                {$error}
            </div>
        {/if}

        {#if activeTab === "vault"}
            {#if $isLoading}
                <div class="text-center py-8 text-zinc-400">Loading...</div>
            {:else if $drawings.length === 0}
                <div class="text-center py-8 text-zinc-400">
                    <p>No drawings saved yet.</p>
                    <p class="text-sm mt-2">
                        Go to excalidraw.com and click "Save" to store a
                        drawing.
                    </p>
                </div>
            {:else}
                <div class="space-y-2">
                    {#each $drawings as drawing (drawing.id)}
                        <div
                            role="button"
                            tabindex="0"
                            class="flex items-center gap-3 p-2 bg-zinc-800 rounded hover:bg-zinc-750 transition-colors cursor-pointer"
                            onclick={() => openDrawing(drawing)}
                            onkeydown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openDrawing(drawing);
                                }
                            }}
                        >
                            {#if drawing.imageBase64}
                                <img
                                    src={drawing.imageBase64}
                                    alt={drawing.name}
                                    class="w-12 h-12 object-cover rounded"
                                />
                            {:else}
                                <div
                                    class="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center text-zinc-500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            {/if}
                            <div class="flex-1 min-w-0">
                                <p class="font-medium truncate">
                                    {drawing.name || "Untitled"}
                                </p>
                                <p class="text-xs text-zinc-400">
                                    {new Date(
                                        drawing.updatedAt,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onclick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(drawing.id);
                                }}
                                class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded"
                                title="Delete"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        {:else if currentData?.id}
            <div class="space-y-4">
                <div>
                    <label
                        for="drawing-name"
                        class="block text-sm text-zinc-400 mb-1"
                        >Drawing Name</label
                    >
                    <input
                        id="drawing-name"
                        type="text"
                        bind:value={saveName}
                        class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        placeholder="Enter drawing name"
                    />
                </div>
                <button
                    onclick={handleSave}
                    disabled={$isLoading || !saveName}
                    class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded font-medium transition-colors"
                >
                    {$isLoading ? "Saving..." : "Save to Vault"}
                </button>
            </div>
        {:else}
            <div class="text-center py-8 text-zinc-400">
                <p>No drawing detected.</p>
                <p class="text-sm mt-2">
                    Open a drawing on excalidraw.com to save it.
                </p>
            </div>
        {/if}
    </div>

    {#if drawingToOpen}
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div class="bg-zinc-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                <h2 class="text-lg font-bold text-white mb-2">
                    Open Drawing
                </h2>
                <p class="text-zinc-300 mb-4">
                    This will overwrite your current canvas with "{drawingToOpen.name}".
                    Any unsaved changes will be lost.
                </p>
                <p class="text-xs text-zinc-500 mb-4">
                    Note: All open Excalidraw tabs share the same storage.
                </p>
                <div class="flex gap-2">
                    <button
                        onclick={cancelOpenDrawing}
                        class="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onclick={confirmOpenDrawing}
                        class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                        Open
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
