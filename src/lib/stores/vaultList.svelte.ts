import { alerts, drawings, folders } from "$lib/stores";
import { type DrawingData, type FolderData } from "$lib/types";
import { formatDate } from "$lib/utils/dateFormat";

type SaveMode = "idle" | "new" | "overwrite";
type SavingState = "idle" | "saving" | "done";

class VaultListStore {
  #menuOpenId = $state<string | null>(null);
  #selectedDrawing = $state<DrawingData | null>(null);
  #selectedFolder = $state<FolderData | null>(null);
  #currentFolderId = $state<string | null>(null);
  #confirmOpenOpen = $state(false);
  #deleteConfirmOpen = $state(false);
  #creatingFolder = $state(false);
  #creatingSubfolderId = $state<string | null>(null);
  #renamingId = $state<string | null>(null);
  #savePanelOpen = $state(false);
  #saveMode = $state<SaveMode>("idle");
  #newCopyName = $state("");
  #overwriteTargetId = $state<string | null>(null);
  #savingState = $state<SavingState>("idle");
  #search = $state("");
  #newCopyInputRef = $state<HTMLInputElement | undefined>(undefined);
  #deletingFolderSubfolderCount = $state(0);
  #deletingFolderDrawingCount = $state(0);
  #saveFolderId = $state<string | null>(null);

  get menuOpenId(): string | null {
    return this.#menuOpenId;
  }

  set menuOpenId(value: string | null) {
    this.#menuOpenId = value;
  }

  get selectedDrawing(): DrawingData | null {
    return this.#selectedDrawing;
  }

  set selectedDrawing(value: DrawingData | null) {
    this.#selectedDrawing = value;
  }

  get selectedFolder(): FolderData | null {
    return this.#selectedFolder;
  }

  set selectedFolder(value: FolderData | null) {
    this.#selectedFolder = value;
  }

  get currentFolderId(): string | null {
    return this.#currentFolderId;
  }

  set currentFolderId(value: string | null) {
    this.#currentFolderId = value;
  }

  get confirmOpenOpen(): boolean {
    return this.#confirmOpenOpen;
  }

  set confirmOpenOpen(value: boolean) {
    this.#confirmOpenOpen = value;
  }

  get deleteConfirmOpen(): boolean {
    return this.#deleteConfirmOpen;
  }

  set deleteConfirmOpen(value: boolean) {
    this.#deleteConfirmOpen = value;
  }

  get creatingFolder(): boolean {
    return this.#creatingFolder;
  }

  set creatingFolder(value: boolean) {
    this.#creatingFolder = value;
  }

  get creatingSubfolderId(): string | null {
    return this.#creatingSubfolderId;
  }

  set creatingSubfolderId(value: string | null) {
    this.#creatingSubfolderId = value;
  }

  get renamingId(): string | null {
    return this.#renamingId;
  }

  set renamingId(value: string | null) {
    this.#renamingId = value;
  }

  get savePanelOpen(): boolean {
    return this.#savePanelOpen;
  }

  set savePanelOpen(value: boolean) {
    this.#savePanelOpen = value;
  }

  get saveMode(): SaveMode {
    return this.#saveMode;
  }

  set saveMode(value: SaveMode) {
    this.#saveMode = value;
  }

  get newCopyName(): string {
    return this.#newCopyName;
  }

  set newCopyName(value: string) {
    this.#newCopyName = value;
  }

  get overwriteTargetId(): string | null {
    return this.#overwriteTargetId;
  }

  set overwriteTargetId(value: string | null) {
    this.#overwriteTargetId = value;
  }

  get savingState(): SavingState {
    return this.#savingState;
  }

  set savingState(value: SavingState) {
    this.#savingState = value;
  }

  get search(): string {
    return this.#search;
  }

  set search(value: string) {
    this.#search = value;
  }

  get newCopyInputRef(): HTMLInputElement | undefined {
    return this.#newCopyInputRef;
  }

  set newCopyInputRef(value: HTMLInputElement | undefined) {
    this.#newCopyInputRef = value;
  }

  get deletingFolderSubfolderCount(): number {
    return this.#deletingFolderSubfolderCount;
  }

  get deletingFolderDrawingCount(): number {
    return this.#deletingFolderDrawingCount;
  }

  setDeletingFolderCounts(subfolders: number, drawings: number): void {
    this.#deletingFolderSubfolderCount = subfolders;
    this.#deletingFolderDrawingCount = drawings;
  }

  get saveFolderId(): string | null {
    return this.#saveFolderId;
  }

  set saveFolderId(value: string | null) {
    this.#saveFolderId = value;
  }

  get isSearching(): boolean {
    return this.#search.trim().length > 0;
  }

  get filteredDrawings(): DrawingData[] {
    return this.isSearching
      ? drawings.list.filter((d) =>
          d.name.toLowerCase().includes(this.#search.toLowerCase()),
        )
      : drawings.list;
  }

  get filteredFolders() {
    return this.isSearching
      ? folders.folders.filter(
          (f) =>
            f.name.toLowerCase().includes(this.#search.toLowerCase()) ||
            drawings.list.some(
              (d) =>
                d.folderId === f.id &&
                d.name.toLowerCase().includes(this.#search.toLowerCase()),
            ),
        )
      : folders.folders;
  }

  get rootDrawings(): DrawingData[] {
    return this.filteredDrawings.filter((d) => d.folderId === null);
  }

  get rootFolders() {
    return this.filteredFolders.filter((f) => f.parentId === null);
  }

  get activeFolder() {
    return this.#currentFolderId
      ? folders.folders.find((f) => f.id === this.#currentFolderId)
      : null;
  }

  get expandedFolders(): Set<string> {
    return folders.expandedFolders;
  }

  formatDate(timestamp: number): string {
    return formatDate(timestamp);
  }

  drawingsInFolder(folderId: string): DrawingData[] {
    return this.filteredDrawings.filter((d) => d.folderId === folderId);
  }

  handleOpen(drawing: DrawingData): void {
    this.#selectedDrawing = drawing;
    this.#confirmOpenOpen = true;
  }

  async confirmOpen(): Promise<void> {
    if (!this.#selectedDrawing) return;
    await drawings.openDrawing(this.#selectedDrawing);
    this.#selectedDrawing = null;
    this.#confirmOpenOpen = false;
  }

  cancelOpen(): void {
    this.#selectedDrawing = null;
    this.#confirmOpenOpen = false;
  }

  handleDelete(id: string): void {
    const drawing = drawings.list.find((d) => d.id === id);
    if (!drawing) return;
    this.#selectedDrawing = drawing;
    this.#deleteConfirmOpen = true;
  }

  async confirmDelete(): Promise<void> {
    if (!this.#selectedDrawing) return;
    await drawings.deleteDrawing(this.#selectedDrawing.id);
    this.#selectedDrawing = null;
    this.#deleteConfirmOpen = false;
  }

  cancelDelete(): void {
    this.#selectedDrawing = null;
    this.#deleteConfirmOpen = false;
  }

  async confirmDeleteFolder(): Promise<void> {
    if (!this.#selectedFolder) return;
    await folders.deleteFolder(this.#selectedFolder.id);
    this.#selectedFolder = null;
    this.#deleteConfirmOpen = false;
  }

  cancelDeleteFolder(): void {
    this.#selectedFolder = null;
    this.#deleteConfirmOpen = false;
  }

  handleSelectFolder(folderId: string | null): void {
    this.#currentFolderId = folderId;
  }

  handleBackToRoot(): void {
    this.#currentFolderId = null;
  }

  async handleCreateFolder(name: string, color?: string, icon?: string): Promise<void> {
    if (this.#currentFolderId) {
      folders.expandFolder(this.#currentFolderId);
    }
    await folders.createFolder(name, this.#currentFolderId, color, icon);
    this.#creatingFolder = false;
  }

  async handleCreateSubFolder(parentId: string, name: string, color?: string, icon?: string): Promise<void> {
    await folders.createFolder(name, parentId, color, icon);
    this.#creatingSubfolderId = null;
  }

  async handleRenameFolder(id: string, newName: string): Promise<void> {
    await folders.updateFolder(id, newName);
    this.#renamingId = null;
  }

  async handleChangeFolderColor(id: string, color: string): Promise<void> {
    await folders.updateFolderColor(id, color);
    this.#menuOpenId = null;
  }

  async handleDeleteFolder(id: string): Promise<void> {
    const folder = folders.folders.find((f) => f.id === id);
    if (!folder) return;
    const counts = folders.getDescendantCount(id);
    this.#deletingFolderSubfolderCount = counts.folders;
    this.#deletingFolderDrawingCount = counts.drawings;
    this.#selectedFolder = folder;
    this.#deleteConfirmOpen = true;
  }

  startRename(id: string): void {
    this.#renamingId = id;
  }

  cancelRename(): void {
    this.#renamingId = null;
  }

  async handleRenameDrawing(id: string, newName: string): Promise<void> {
    await drawings.updateDrawingName(id, newName);
    this.#renamingId = null;
  }

  async handleDuplicateDrawing(id: string): Promise<void> {
    const original = drawings.list.find((d) => d.id === id);
    if (!original) return;
    await drawings.duplicateDrawing(original);
    this.#menuOpenId = null;
  }

  toggleFolder(id: string): void {
    folders.toggleFolder(id);
  }

  handleFolderClick(folderId: string): void {
    const folder = folders.folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (!folder.parentId) {
      if (this.#currentFolderId && this.isDescendantOf(folderId, this.#currentFolderId)) {
        this.collapseAllFolders();
      }
      this.#currentFolderId = folderId;
      folders.toggleFolder(folderId);
    } else {
      if (this.#currentFolderId === folderId) {
        folders.toggleFolder(folderId);
        this.#currentFolderId = folder.parentId;
      } else {
        this.#currentFolderId = folderId;
        folders.toggleFolder(folderId);
      }
    }
  }

  collapseAllFolders(): void {
    this.#currentFolderId = null;
  }

  isDescendantOf(ancestorId: string, folderId: string): boolean {
    let current = folders.getFolderById(folderId);
    while (current) {
      if (current.id === ancestorId) return true;
      if (!current.parentId) break;
      current = folders.getFolderById(current.parentId);
    }
    return false;
  }

  openSavePanel(mode: "new" | "overwrite"): void {
    this.#savePanelOpen = true;
    this.#saveMode = mode;
    this.#overwriteTargetId = null;
    this.#newCopyName = "";
    this.#savingState = "idle";
    this.#saveFolderId = this.#currentFolderId ?? folders.folders.find((f) => f.isRoot)?.id ?? folders.folders.find((f) => f.parentId === null)?.id ?? null;
  }

  closeSavePanel(): void {
    this.#savePanelOpen = false;
    this.#saveMode = "idle";
    this.#newCopyName = "";
    this.#overwriteTargetId = null;
    this.#savingState = "idle";
  }

  async handleSaveNewCopy(): Promise<void> {
    if (!this.#newCopyName.trim()) return;
    this.#savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      const newId = `drawing_${Date.now()}`;
      await drawings.saveDrawing({
        id: newId,
        name: this.#newCopyName.trim(),
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
        folderId: this.#saveFolderId,
      });
      this.#savingState = "done";
      setTimeout(() => this.closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to save copy:", e);
      this.#savingState = "idle";
    }
  }

  async handleSave(): Promise<void> {
    if (drawings.activeDrawingId) {
      // Save to active drawing
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      const activeDrawing = drawings.list.find((d) => d.id === drawings.activeDrawingId);
      await drawings.saveDrawing({
        id: drawings.activeDrawingId,
        name: activeDrawing?.name || currentData.title || "Untitled",
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
    } else {
      // No active drawing, open save panel for new copy
      this.openSavePanel("new");
    }
  }

  async handleSaveAsNewCopy(): Promise<void> {
    this.openSavePanel("new");
  }

  async handleOverwrite(): Promise<void> {
    if (!this.#overwriteTargetId) return;
    this.#savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      await drawings.updateDrawing({
        id: this.#overwriteTargetId,
        name: drawings.list.find((d) => d.id === this.#overwriteTargetId)?.name || "",
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
      this.#savingState = "done";
      setTimeout(() => this.closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to overwrite:", e);
      this.#savingState = "idle";
    }
  }

  reset(): void {
    this.#menuOpenId = null;
    this.#selectedDrawing = null;
    this.#selectedFolder = null;
    this.#currentFolderId = null;
    this.#confirmOpenOpen = false;
    this.#deleteConfirmOpen = false;
    this.#creatingFolder = false;
    this.#creatingSubfolderId = null;
    this.#renamingId = null;
    this.#savePanelOpen = false;
    this.#saveMode = "idle";
    this.#newCopyName = "";
    this.#overwriteTargetId = null;
    this.#savingState = "idle";
    this.#search = "";
    this.#newCopyInputRef = undefined;
    this.#deletingFolderSubfolderCount = 0;
    this.#deletingFolderDrawingCount = 0;
    this.#saveFolderId = null;
  }
}

export const vaultList = new VaultListStore();
