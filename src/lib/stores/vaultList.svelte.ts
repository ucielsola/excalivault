import { drawings, folders } from "$lib/stores";
import { type DrawingData, type FolderData } from "$lib/types";

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
  #moveTarget = $state<string | null>(null);
  #savePanelOpen = $state(false);
  #saveMode = $state<SaveMode>("idle");
  #newCopyName = $state("");
  #overwriteTargetId = $state<string | null>(null);
  #savingState = $state<SavingState>("idle");
  #search = $state("");
  #newCopyInputRef = $state<HTMLInputElement | undefined>(undefined);
  #deletingFolderSubfolderCount = $state(0);
  #deletingFolderDrawingCount = $state(0);

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

  get moveTarget(): string | null {
    return this.#moveTarget;
  }

  set moveTarget(value: string | null) {
    this.#moveTarget = value;
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
    return this.filteredDrawings.filter((d) =>
      this.#currentFolderId
        ? d.folderId === this.#currentFolderId
        : d.folderId === null,
    );
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
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return "Just now";
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return new Date(timestamp).toLocaleDateString();
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

  async handleCreateFolder(name: string, color?: string): Promise<void> {
    await folders.createFolder(name, null, color);
    this.#creatingFolder = false;
  }

  async handleCreateSubFolder(parentId: string, name: string, color?: string): Promise<void> {
    await folders.createFolder(name, parentId, color);
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

  async confirmMoveDrawing(folderId: string | null): Promise<void> {
    if (!this.#moveTarget) return;
    await drawings.moveDrawing(this.#moveTarget, folderId);
    this.#moveTarget = null;
    this.#menuOpenId = null;
  }

  cancelMoveDrawing(): void {
    this.#moveTarget = null;
    this.#menuOpenId = null;
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

  openSavePanel(mode: "new" | "overwrite"): void {
    this.#savePanelOpen = true;
    this.#saveMode = mode;
    this.#overwriteTargetId = null;
    this.#newCopyName = "";
    this.#savingState = "idle";
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
      await drawings.saveDrawing({
        id: currentData.id,
        name: this.#newCopyName.trim(),
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
      this.#savingState = "done";
      setTimeout(() => this.closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to save copy:", e);
      this.#savingState = "idle";
    }
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
}

export const vaultList = new VaultListStore();
