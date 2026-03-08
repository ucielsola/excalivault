<script lang="ts">
  import {
    Check,
    ChevronDown,
    FolderOpen,
    FolderX,
    Replace,
    Save,
    TriangleAlert,
    X,
  } from "@lucide/svelte";

  import FolderSelectDialog from "$lib/components/excalivault/dialogs/FolderSelectDialog.svelte";
  import { drawings, folders, vaultActions, vaultList } from "$lib/stores";
  import { getFolderBadgeClass } from "$lib/utils/folderColors";

  let savePanelOpen = $derived(vaultList.savePanelOpen);
  let saveMode = $derived(vaultList.saveMode);
  let savingState = $derived(vaultList.savingState);
  let newCopyName = $derived(vaultList.newCopyName);
  let overwriteTargetId = $derived(vaultList.overwriteTargetId);
  let activeFolder = $derived(vaultList.activeFolder);
  let currentFolderId = $derived(vaultList.currentFolderId);
  let saveFolderId = $derived(vaultList.saveFolderId);

  let folderSelectOpen = $state(false);
  let saveFolder = $derived(() =>
    saveFolderId ? folders.folders.find((f) => f.id === saveFolderId) : null,
  );

  const handleSave = () =>
    saveMode === "new"
      ? vaultActions.handleSaveNewCopy()
      : vaultActions.handleOverwrite();
  const onCancel = () => vaultList.closeSavePanel();
  const handleFolderSelect = (folderId: string | null) => {
    vaultList.saveFolderId = folderId;
    folderSelectOpen = false;
  };
</script>

{#if savePanelOpen}
  <div class="bg-card border-primary/20 border-t">
    <button
      onclick={() => vaultList.closeSavePanel()}
      class="text-primary flex w-full items-center justify-between px-4 py-2 text-left"
    >
      <span
        class="font-mono text-[10px] font-semibold tracking-wider uppercase"
      >
        {saveMode === "new" ? "Save As" : "Overwrite drawing"}
      </span>
      <ChevronDown size={12} class="text-muted-foreground" />
    </button>

    {#if saveMode === "new"}
      <div class="flex flex-col gap-2.5 px-4 pb-3">
        <input
          bind:this={vaultList.newCopyInputRef}
          type="text"
          placeholder="Drawing name..."
          bind:value={vaultList.newCopyName}
          onkeydown={(e) => {
            if (e.key === "Enter") vaultActions.handleSaveNewCopy();
            if (e.key === "Escape") vaultActions.closeSavePanel();
          }}
          disabled={savingState !== "idle"}
          class="border-border bg-input text-foreground focus:border-primary focus:ring-primary placeholder:text-muted-foreground/40 rounded-md border px-2.5 py-2 font-mono text-xs focus:ring-1 focus:outline-none disabled:opacity-50"
        />
        <button
          onclick={() => (folderSelectOpen = true)}
          disabled={savingState !== "idle"}
          class="text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left transition-colors disabled:opacity-50"
        >
          {#if saveFolder()}
            <FolderOpen
              size={10}
              class={getFolderBadgeClass(saveFolder()!.color)}
            />
            <span class="text-foreground font-mono text-[10px]">
              {saveFolder()!.name}
            </span>
          {:else}
            <FolderX size={10} class="text-muted-foreground" />
            <span class="font-mono text-[10px]">Unfiled</span>
          {/if}
        </button>
        <button
          onclick={() => vaultActions.handleSaveNewCopy()}
          disabled={!newCopyName.trim() || savingState !== "idle"}
          class="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
        >
          {#if savingState === "saving"}
            <div
              class="border-primary-foreground/30 border-t-primary-foreground h-3.5 w-3.5 animate-spin rounded-full border-2"
            ></div>
          {:else if savingState === "done"}
            <Check size={13} />
            Saved!
          {:else}
            <Save size={13} />
            Save As
          {/if}
        </button>
      </div>
    {:else if saveMode === "overwrite"}
      <div class="flex flex-col gap-2 px-4 pb-3">
        {#if savingState === "idle"}
          <div
            class="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-md border px-2.5 py-1.5"
          >
            <TriangleAlert size={11} class="text-primary mt-0.5 shrink-0" />
            <p class="text-muted-foreground text-[10px] leading-relaxed">
              Select a drawing to <span class="text-foreground font-medium"
                >replace</span
              > with current canvas.
            </p>
          </div>
          <div
            class="border-border max-h-[140px] overflow-y-auto rounded-md border"
          >
            {#each drawings.list as d (d.id)}
              <button
                onclick={() => (vaultList.overwriteTargetId = d.id)}
                class="hover:bg-secondary/50 flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors {overwriteTargetId ===
                d.id
                  ? 'bg-primary/10'
                  : ''}"
              >
                <div
                  class="border-border flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors {overwriteTargetId ===
                  d.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : ''}"
                >
                  {#if overwriteTargetId === d.id}
                    <X size={9} />
                  {/if}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-foreground truncate text-[11px] font-medium">
                    {d.name}
                  </p>
                  <p class="text-muted-foreground text-[9px]">
                    {vaultList.formatDate(d.updatedAt)}
                    {#if d.folderId}
                      <span
                        class="font-medium {getFolderBadgeClass(
                          folders.folders.find((f) => f.id === d.folderId)
                            ?.color || '',
                        )}"
                      >
                        {folders.folders.find((f) => f.id === d.folderId)?.name}
                      </span>
                    {/if}
                  </p>
                </div>
              </button>
            {/each}
          </div>
        {/if}
        <button
          onclick={() => vaultActions.handleOverwrite()}
          disabled={!overwriteTargetId || savingState !== "idle"}
          class="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
        >
          {#if savingState === "saving"}
            <div
              class="border-primary-foreground/30 border-t-primary-foreground h-3.5 w-3.5 animate-spin rounded-full border-2"
            ></div>
          {:else if savingState === "done"}
            <X size={13} />
            Overwritten!
          {:else}
            <Replace size={13} />
            Overwrite selected
          {/if}
        </button>
      </div>
    {/if}
  </div>

  <FolderSelectDialog
    open={folderSelectOpen}
    currentFolderId={saveFolderId}
    onMove={handleFolderSelect}
    onCancel={() => (folderSelectOpen = false)}
  />
{/if}
