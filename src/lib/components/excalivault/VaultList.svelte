<script lang="ts">
  import {
    AlertTriangle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    FolderPlus,
    MoreVertical,
    Pencil,
    Plus,
    Replace,
    Save,
    Search,
    Trash2,
    X,
  } from "@lucide/svelte";

  import { drawings, folders } from "$lib/stores";
  import { type DrawingData, type FolderData } from "$lib/types";
  import { COLOR_VALUES, getFolderBadgeClass } from "$lib/utils/folderColors";

  import ConfirmOpen from "./ConfirmOpen.svelte";
  import DeleteConfirm from "./DeleteConfirm.svelte";
  import InlineInput from "./InlineInput.svelte";
  import VaultListItem from "./VaultListItem.svelte";
  import VaultLogo from "./VaultLogo.svelte";

  let listRef = $state<HTMLDivElement | null>(null);
  let menuOpenId = $state<string | null>(null);
  let selectedDrawing = $state<DrawingData | null>(null);
  let _selectedFolder = $state<FolderData | null>(null);
  let currentFolderId = $state<string | null>(null);
  let confirmOpenOpen = $state(false);
  let deleteConfirmOpen = $state(false);
  let creatingFolder = $state(false);
  let renamingId = $state<string | null>(null);
  let expandedFolders = $derived(
    folders.folders.reduce((acc, f) => {
      if (folders.isFolderExpanded(f.id)) acc.add(f.id);
      return acc;
    }, new Set<string>()),
  );

  let moveTarget = $state<string | null>(null);
  let savePanelOpen = $state(false);
  let saveMode = $state<"idle" | "new" | "overwrite">("idle");
  let newCopyName = $state("");
  let overwriteTargetId = $state<string | null>(null);
  let savingState = $state<"idle" | "saving" | "done">("idle");
  let newCopyInputRef = $state<HTMLInputElement>();

  let search = $state("");
  let isSearching = $derived(search.trim().length > 0);

  $effect(() => {
    if (saveMode === "new" && savePanelOpen) {
      newCopyInputRef?.focus();
    }
  });

  $effect(() => {
    function handleClick(e: MouseEvent) {
      if (listRef && !listRef.contains(e.target as Node)) {
        menuOpenId = null;
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  });

  function formatDate(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return "Just now";
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function handleOpen(drawing: DrawingData) {
    selectedDrawing = drawing;
    confirmOpenOpen = true;
  }

  async function confirmOpen() {
    if (!selectedDrawing) return;

    await drawings.openDrawing(selectedDrawing);

    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function cancelOpen() {
    selectedDrawing = null;
    confirmOpenOpen = false;
  }

  function handleDelete(id: string) {
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

  function handleSelectFolder(folderId: string | null) {
    currentFolderId = folderId;
  }

  function handleBackToRoot() {
    currentFolderId = null;
  }

  async function handleCreateFolder(name: string) {
    await folders.createFolder(name, null);
    creatingFolder = false;
  }

  async function handleRenameFolder(id: string, newName: string) {
    await folders.updateFolder(id, newName);
    renamingId = null;
  }

  async function handleDeleteFolder(id: string) {
    const folder = folders.folders.find((f) => f.id === id);
    if (!folder) return;

    _selectedFolder = folder;
    deleteConfirmOpen = true;
  }

  async function confirmMoveDrawing(folderId: string | null) {
    if (!moveTarget) return;

    await drawings.moveDrawing(moveTarget, folderId);
    moveTarget = null;
    menuOpenId = null;
  }

  function cancelMoveDrawing() {
    moveTarget = null;
    menuOpenId = null;
  }

  async function handleRenameDrawing(id: string, newName: string) {
    await drawings.updateDrawingName(id, newName);
    renamingId = null;
  }

  async function handleDuplicateDrawing(id: string) {
    const original = drawings.list.find((d) => d.id === id);
    if (!original) return;

    await drawings.duplicateDrawing(original);
    menuOpenId = null;
  }

  function toggleFolder(id: string) {
    folders.toggleFolder(id);
  }

  function openSavePanel(mode: "new" | "overwrite") {
    savePanelOpen = true;
    saveMode = mode;
    overwriteTargetId = null;
    newCopyName = "";
    savingState = "idle";
  }

  function closeSavePanel() {
    savePanelOpen = false;
    saveMode = "idle";
    newCopyName = "";
    overwriteTargetId = null;
    savingState = "idle";
  }

  async function handleSaveNewCopy() {
    if (!newCopyName.trim()) return;
    savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;

      await drawings.saveDrawing({
        id: currentData.id,
        name: newCopyName.trim(),
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
      savingState = "done";
      setTimeout(() => closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to save copy:", e);
      savingState = "idle";
    }
  }

  async function handleOverwrite() {
    if (!overwriteTargetId) return;
    savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;

      await drawings.updateDrawing({
        id: overwriteTargetId,
        name: drawings.list.find((d) => d.id === overwriteTargetId)?.name || "",
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
      savingState = "done";
      setTimeout(() => closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to overwrite:", e);
      savingState = "idle";
    }
  }

  const filteredDrawings = $derived(
    isSearching
      ? drawings.list.filter((d) =>
          d.name.toLowerCase().includes(search.toLowerCase()),
        )
      : drawings.list,
  );

  const filteredFolders = $derived(
    isSearching
      ? folders.folders.filter(
          (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            drawings.list.some(
              (d) =>
                d.folderId === f.id &&
                d.name.toLowerCase().includes(search.toLowerCase()),
            ),
        )
      : folders.folders,
  );

  const rootDrawings = $derived(
    filteredDrawings.filter((d) =>
      currentFolderId ? d.folderId === currentFolderId : d.folderId === null,
    ),
  );

  const activeFolder = $derived(
    currentFolderId
      ? folders.folders.find((f) => f.id === currentFolderId)
      : null,
  );

  const totalCount = $derived(drawings.list.length);
  const rootFolders = $derived(
    filteredFolders.filter((f) => f.parentId === null),
  );

  function drawingsInFolder(folderId: string) {
    return filteredDrawings.filter((d) => d.folderId === folderId);
  }
</script>

<div bind:this={listRef} class="flex h-full flex-col">
  <div
    class="border-border flex items-center justify-between border-b px-4 py-3"
  >
    {#if currentFolderId && activeFolder}
      <button
        onclick={handleBackToRoot}
        class="text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded text-xs font-medium transition-colors"
      >
        <ChevronLeft size={13} />
        <span class="text-muted-foreground/60 font-mono text-[10px]">Vault</span
        >
        <ChevronRight size={10} class="text-muted-foreground/40" />
        <span
          class="font-mono text-[10px] font-semibold"
          style="color: {activeFolder.color}"
        >
          {activeFolder.name}
        </span>
      </button>
    {:else}
      <VaultLogo size="small" />
    {/if}
    <div class="flex items-center gap-1.5">
      <button
        onclick={() => (creatingFolder = true)}
        class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded-md transition-colors"
        title="New folder"
      >
        <FolderPlus size={13} />
      </button>
      <span
        class="text-primary bg-primary/10 flex h-5 items-center justify-center rounded px-1.5 font-mono text-[10px] font-bold"
      >
        {totalCount}
      </span>
    </div>
  </div>

  <div class="border-border border-b px-4 py-2.5">
    <div
      class="border-border bg-input flex items-center gap-2 rounded-md border px-2.5 py-1.5"
    >
      <Search size={13} class="text-muted-foreground/50" />
      <input
        type="text"
        placeholder="Search vault..."
        bind:value={search}
        class="text-foreground placeholder:text-muted-foreground/40 w-full bg-transparent font-mono text-xs focus:outline-none"
      />
      {#if search}
        <button
          onclick={() => (search = "")}
          class="text-muted-foreground/50 hover:text-foreground"
        >
          <X size={12} />
        </button>
      {/if}
    </div>
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if creatingFolder}
      <div class="border-border/50 border-b px-4 py-2.5">
        <div class="flex items-center gap-2">
          <FolderOpen
            size={14}
            class={getFolderBadgeClass(
              COLOR_VALUES[folders.folders.length % COLOR_VALUES.length],
            )}
          />
          <div class="flex-1">
            <InlineInput
              placeholder="Folder name..."
              onConfirm={handleCreateFolder}
              onCancel={() => (creatingFolder = false)}
            />
          </div>
        </div>
      </div>
    {/if}

    {#if !currentFolderId && !isSearching}
      {#each rootFolders as folder (folder.id)}
        {@const folderDrawings = drawingsInFolder(folder.id)}
        {@const isExpanded = expandedFolders.has(folder.id)}
        {@const isRenaming = renamingId === folder.id}

        <div>
          <div
            class="group border-border/50 hover:bg-secondary/50 relative border-b transition-colors"
          >
            <div class="flex items-center gap-2 px-4 py-2.5">
              <button
                onclick={() => toggleFolder(folder.id)}
                class="text-muted-foreground/50 hover:bg-secondary hover:text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
              >
                {#if isExpanded}
                  <ChevronDown size={12} />
                {:else}
                  <ChevronRight size={12} />
                {/if}
              </button>

              <FolderOpen
                size={14}
                class={getFolderBadgeClass(folder.color) + " shrink-0"}
              />

              <div class="min-w-0 flex-1">
                {#if isRenaming}
                  <InlineInput
                    initial={folder.name}
                    onConfirm={(v) => handleRenameFolder(folder.id, v)}
                    onCancel={() => (renamingId = null)}
                  />
                {:else}
                  <button
                    onclick={() => handleSelectFolder(folder.id)}
                    class="text-foreground hover:text-primary flex w-full items-center gap-2 text-left"
                  >
                    <span class="truncate text-xs font-medium"
                      >{folder.name}</span
                    >
                    <span
                      class="bg-secondary text-muted-foreground shrink-0 rounded px-1 font-mono text-[9px]"
                    >
                      {folderDrawings.length}
                    </span>
                  </button>
                {/if}
              </div>

              {#if !isRenaming}
                <div
                  class="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <button
                    onclick={() => (renamingId = folder.id)}
                    class="text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-6 w-6 items-center justify-center rounded"
                    title="Rename folder"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      menuOpenId = menuOpenId === folder.id ? null : folder.id;
                    }}
                    class="text-muted-foreground hover:bg-secondary hover:text-foreground flex h-6 w-6 items-center justify-center rounded"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              {/if}
            </div>

            {#if menuOpenId === folder.id}
              <div
                class="border-border bg-card absolute top-9 right-3 z-20 min-w-[150px] rounded-md border p-1 shadow-xl"
              >
                <button
                  onclick={() => {
                    menuOpenId = null;
                    handleSelectFolder(folder.id);
                  }}
                  class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
                >
                  <FolderOpen size={11} />
                  Open folder
                </button>
                <button
                  onclick={() => {
                    menuOpenId = null;
                    renamingId = folder.id;
                  }}
                  class="text-foreground hover:bg-secondary flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
                >
                  <Pencil size={11} />
                  Rename
                </button>
                <div class="border-border bg-border my-1 h-px" />
                <button
                  onclick={() => {
                    menuOpenId = null;
                    handleDeleteFolder(folder.id);
                  }}
                  class="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[11px] transition-colors"
                >
                  <Trash2 size={11} />
                  Delete folder
                  <span class="text-muted-foreground ml-auto text-[9px]"
                    >+items</span
                  >
                </button>
              </div>
            {/if}
          </div>

          {#if isExpanded && folderDrawings.length > 0}
            <div class="border-border/30 bg-secondary/20 border-b">
              {#each folderDrawings as drawing (drawing.id)}
                <VaultListItem
                  {drawing}
                  indent={true}
                  isRenaming={renamingId === drawing.id}
                  menuOpen={menuOpenId === drawing.id}
                  moveTarget={moveTarget === drawing.id}
                  folders={folders.folders}
                  {formatDate}
                  onOpen={() => handleOpen(drawing)}
                  onDelete={() => handleDelete(drawing.id)}
                  onMenuToggle={() =>
                    (menuOpenId =
                      menuOpenId === drawing.id ? null : drawing.id)}
                  onRename={(name) => handleRenameDrawing(drawing.id, name)}
                  onStartRename={() => {
                    menuOpenId = null;
                    renamingId = drawing.id;
                  }}
                  onCancelRename={() => (renamingId = null)}
                  onDuplicate={() => handleDuplicateDrawing(drawing.id)}
                  onStartMove={() => {
                    menuOpenId = null;
                    moveTarget = drawing.id;
                  }}
                  onMove={confirmMoveDrawing}
                  onCancelMove={cancelMoveDrawing}
                />
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      {#if rootDrawings.length > 0 && rootFolders.length > 0}
        <div class="px-4 py-1.5">
          <span
            class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
          >
            Unfiled
          </span>
        </div>
      {/if}
    {/if}

    {#if isSearching}
      <div class="px-4 py-1.5">
        <span
          class="text-muted-foreground/40 font-mono text-[9px] font-medium tracking-wider uppercase"
        >
          Results for "{search}"
        </span>
      </div>
    {/if}

    {#each isSearching ? filteredDrawings : rootDrawings as drawing (drawing.id)}
      <VaultListItem
        {drawing}
        indent={false}
        isRenaming={renamingId === drawing.id}
        menuOpen={menuOpenId === drawing.id}
        moveTarget={moveTarget === drawing.id}
        folders={folders.folders}
        {formatDate}
        showFolderBadge={isSearching}
        folderName={isSearching && drawing.folderId
          ? folders.folders.find((f) => f.id === drawing.folderId)?.name
          : undefined}
        folderColor={isSearching && drawing.folderId
          ? folders.folders.find((f) => f.id === drawing.folderId)?.color
          : undefined}
        onOpen={() => handleOpen(drawing)}
        onDelete={() => handleDelete(drawing.id)}
        onMenuToggle={() =>
          (menuOpenId = menuOpenId === drawing.id ? null : drawing.id)}
        onRename={(name) => handleRenameDrawing(drawing.id, name)}
        onStartRename={() => {
          menuOpenId = null;
          renamingId = drawing.id;
        }}
        onCancelRename={() => (renamingId = null)}
        onDuplicate={() => handleDuplicateDrawing(drawing.id)}
        onStartMove={() => {
          menuOpenId = null;
          moveTarget = drawing.id;
        }}
        onMove={confirmMoveDrawing}
        onCancelMove={cancelMoveDrawing}
      />
    {/each}

    {#if currentFolderId && rootDrawings.length === 0 && !isSearching}
      <div class="flex flex-col items-center gap-2 p-8">
        <FolderOpen size={20} class="text-muted-foreground/30" />
        <p class="text-muted-foreground/60 text-[11px]">This folder is empty</p>
      </div>
    {/if}

    {#if isSearching && filteredDrawings.length === 0}
      <div class="flex flex-col items-center gap-2 p-8">
        <Search size={20} class="text-muted-foreground/30" />
        <p class="text-muted-foreground/60 text-[11px]">
          No drawings match your search
        </p>
      </div>
    {/if}
  </div>

  {#if savePanelOpen}
    <div class="bg-card border-primary/20 border-t">
      <button
        onclick={closeSavePanel}
        class="text-primary flex w-full items-center justify-between px-4 py-2 text-left"
      >
        <span
          class="font-mono text-[10px] font-semibold tracking-wider uppercase"
        >
          {saveMode === "new" ? "Save new copy" : "Overwrite drawing"}
        </span>
        <ChevronDown size={12} class="text-muted-foreground" />
      </button>

      {#if saveMode === "new"}
        <div class="flex flex-col gap-2.5 px-4 pb-3">
          <input
            bind:this={newCopyInputRef}
            type="text"
            placeholder="Drawing name..."
            bind:value={newCopyName}
            onkeydown={(e) => {
              if (e.key === "Enter") handleSaveNewCopy();
              if (e.key === "Escape") closeSavePanel();
            }}
            disabled={savingState !== "idle"}
            class="border-border bg-input text-foreground focus:border-primary focus:ring-primary placeholder:text-muted-foreground/40 rounded-md border px-2.5 py-2 font-mono text-xs focus:ring-1 focus:outline-none disabled:opacity-50"
          />
          {#if currentFolderId && activeFolder}
            <div class="flex items-center gap-1.5">
              <FolderOpen
                size={10}
                class={getFolderBadgeClass(activeFolder.color)}
              />
              <span class="text-muted-foreground font-mono text-[10px]">
                Saving into <span class="text-foreground font-medium"
                  >{activeFolder.name}</span
                >
              </span>
            </div>
          {/if}
          <button
            onclick={handleSaveNewCopy}
            disabled={!newCopyName.trim() || savingState !== "idle"}
            class="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
          >
            {#if savingState === "saving"}
              <div
                class="border-primary-foreground/30 border-t-primary-foreground h-3.5 w-3.5 animate-spin rounded-full border-2"
              />
            {:else if savingState === "done"}
              <X size={13} />
              Saved!
            {:else}
              <Save size={13} />
              Save new copy
            {/if}
          </button>
        </div>
      {:else if saveMode === "overwrite"}
        <div class="flex flex-col gap-2 px-4 pb-3">
          {#if savingState === "idle"}
            <div
              class="border-primary/20 bg-primary/5 flex items-start gap-2 rounded-md border px-2.5 py-1.5"
            >
              <AlertTriangle size={11} class="text-primary mt-0.5 shrink-0" />
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
                  onclick={() => (overwriteTargetId = d.id)}
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
                      {formatDate(d.updatedAt)}
                      {#if d.folderId}
                        <span
                          class="font-medium {getFolderBadgeClass(
                            folders.folders.find((f) => f.id === d.folderId)
                              ?.color || '',
                          )}"
                        >
                          {folders.folders.find((f) => f.id === d.folderId)
                            ?.name}
                        </span>
                      {/if}
                    </p>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
          <button
            onclick={handleOverwrite}
            disabled={!overwriteTargetId || savingState !== "idle"}
            class="bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
          >
            {#if savingState === "saving"}
              <div
                class="border-primary-foreground/30 border-t-primary-foreground h-3.5 w-3.5 animate-spin rounded-full border-2"
              />
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
  {:else}
    <div class="border-border border-t">
      <div
        class="border-border/50 flex items-center gap-2 border-b px-4 py-2.5"
      >
        <button
          onclick={() => openSavePanel("new")}
          class="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-all hover:brightness-110"
        >
          <Save size={12} />
          Save new copy
        </button>
        <button
          onclick={() => openSavePanel("overwrite")}
          class="bg-secondary text-foreground hover:border-primary/30 hover:bg-secondary/80 border-border flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[11px] font-medium transition-colors"
        >
          <Replace size={12} />
          Overwrite
        </button>
      </div>
      <div class="flex items-center justify-between px-4 py-2">
        <p class="text-muted-foreground/50 text-center font-mono text-[10px]">
          {drawings.list.length} drawings · {folders.folders.length} folders
        </p>
        <button
          onclick={() => (creatingFolder = true)}
          class="text-muted-foreground/60 hover:bg-secondary hover:text-foreground flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
        >
          <Plus size={10} />
          Folder
        </button>
      </div>
    </div>
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
