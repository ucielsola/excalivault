import { dialogStore } from "$lib/stores";
import { drawings, folders, vaultList, viewStore } from "$lib/stores";
import { vaultActionsService } from "$lib/services/vaultActionsService";
import { type DrawingData } from "$lib/types";

class VaultActions {
  async handleOpen(drawing: DrawingData): Promise<void> {
    vaultList.selectedDrawing = drawing;
    dialogStore.open(
      "overwrite",
      this.confirmOpen.bind(this),
      () => this.cancelOpen(),
      { drawingName: drawing.name },
    );
  }

  async confirmOpen(): Promise<void> {
    if (!vaultList.selectedDrawing) return;
    await drawings.openDrawing(vaultList.selectedDrawing);
    vaultList.selectedDrawing = null;
    dialogStore.close();
  }

  cancelOpen(): void {
    vaultList.selectedDrawing = null;
    dialogStore.close();
  }

  handleDelete(id: string): void {
    const drawing = drawings.list.find((d) => d.id === id);
    if (!drawing) return;
    vaultList.selectedDrawing = drawing;
    dialogStore.open(
      "delete",
      this.confirmDelete.bind(this),
      () => this.cancelDelete(),
      {
        itemName: drawing.name,
        itemType: "drawing",
      },
    );
  }

  async confirmDelete(): Promise<void> {
    if (!vaultList.selectedDrawing) return;
    await drawings.deleteDrawing(vaultList.selectedDrawing.id);
    vaultList.selectedDrawing = null;
    dialogStore.close();
  }

  cancelDelete(): void {
    vaultList.selectedDrawing = null;
    dialogStore.close();
  }

  async handleDeleteFolder(id: string): Promise<void> {
    const folder = folders.folders.find((f) => f.id === id);
    if (!folder) return;
    const counts = folders.getDescendantCount(id);
    vaultList.setDeletingFolderCounts(counts.folders, counts.drawings);
    vaultList.selectedFolder = folder;
    dialogStore.open(
      "delete",
      this.confirmDeleteFolder.bind(this),
      () => this.cancelDeleteFolder(),
      {
        itemName: folder.name,
        itemType: "folder",
        subfolderCount: counts.folders,
        drawingCount: counts.drawings,
      },
    );
  }

  async confirmDeleteFolder(): Promise<void> {
    if (!vaultList.selectedFolder) return;
    await folders.deleteFolder(vaultList.selectedFolder.id);
    vaultList.selectedFolder = null;
    dialogStore.close();
  }

  cancelDeleteFolder(): void {
    vaultList.selectedFolder = null;
    dialogStore.close();
  }

  handleSelectFolder(folderId: string | null): void {
    vaultList.currentFolderId = folderId;
  }

  handleBackToRoot(): void {
    vaultList.currentFolderId = null;
  }

  async handleCreateFolder(
    name: string,
    color?: string,
    icon?: string,
  ): Promise<void> {
    if (vaultList.currentFolderId) {
      folders.expandFolder(vaultList.currentFolderId);
    }
    await folders.createFolder(
      name,
      vaultList.currentFolderId,
      color,
      icon,
    );
    vaultList.creatingFolder = false;
  }

  async handleCreateSubFolder(
    parentId: string,
    name: string,
    color?: string,
    icon?: string,
  ): Promise<void> {
    await folders.createFolder(name, parentId, color, icon);
    vaultList.creatingSubfolderId = null;
  }

  async handleRenameFolder(id: string, newName: string): Promise<void> {
    await folders.updateFolder(id, newName);
    vaultList.renamingId = null;
  }

  async handleChangeFolderColor(id: string, color: string): Promise<void> {
    await folders.updateFolderColor(id, color);
    vaultList.menuOpenId = null;
  }

  startRename(id: string): void {
    vaultList.renamingId = id;
  }

  cancelRename(): void {
    vaultList.renamingId = null;
  }

  async handleRenameDrawing(id: string, newName: string): Promise<void> {
    await drawings.updateDrawingName(id, newName);
    vaultList.renamingId = null;
  }

  async handleDuplicateDrawing(id: string): Promise<void> {
    const original = drawings.list.find((d) => d.id === id);
    if (!original) return;
    await drawings.duplicateDrawing(original);
    vaultList.menuOpenId = null;
  }

  toggleFolder(id: string): void {
    folders.toggleFolder(id);
  }

  handleFolderClick(folderId: string): void {
    const folder = folders.folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (!folder.parentId) {
      if (
        vaultList.currentFolderId &&
        this.isDescendantOf(folderId, vaultList.currentFolderId)
      ) {
        this.collapseAllFolders();
      }
      vaultList.currentFolderId = folderId;
      folders.toggleFolder(folderId);
    } else {
      if (vaultList.currentFolderId === folderId) {
        folders.toggleFolder(folderId);
        vaultList.currentFolderId = folder.parentId;
      } else {
        vaultList.currentFolderId = folderId;
        folders.toggleFolder(folderId);
      }
    }
  }

  collapseAllFolders(): void {
    vaultList.currentFolderId = null;
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
    vaultList.savePanelOpen = true;
    vaultList.saveMode = mode;
    vaultList.overwriteTargetId = null;
    vaultList.newCopyName = "";
    vaultList.savingState = "idle";
    vaultList.saveFolderId = vaultList.currentFolderId;
  }

  closeSavePanel(): void {
    vaultList.savePanelOpen = false;
    vaultList.saveMode = "idle";
    vaultList.newCopyName = "";
    vaultList.overwriteTargetId = null;
    vaultList.savingState = "idle";
  }

  async handleSaveNewCopy(): Promise<void> {
    if (!vaultList.newCopyName.trim()) return;
    vaultList.savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      const newId = `drawing_${Date.now()}`;
      await drawings.saveDrawing({
        id: newId,
        name: vaultList.newCopyName.trim(),
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
        folderId: vaultList.saveFolderId,
      });
      vaultList.savingState = "done";
      setTimeout(() => this.closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to save copy:", e);
      vaultList.savingState = "idle";
    }
  }

  async handleSave(): Promise<void> {
    if (drawings.activeDrawingId) {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      const activeDrawing = drawings.list.find(
        (d) => d.id === drawings.activeDrawingId,
      );
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
      this.openSavePanel("new");
    }
  }

  async handleSaveAsNewCopy(): Promise<void> {
    this.openSavePanel("new");
  }

  async handleOverwrite(): Promise<void> {
    if (!vaultList.overwriteTargetId) return;
    vaultList.savingState = "saving";
    try {
      const currentData = await drawings.getCurrentDrawingData();
      if (!currentData?.id) return;
      await drawings.updateDrawing({
        id: vaultList.overwriteTargetId,
        name:
          drawings.list.find((d) => d.id === vaultList.overwriteTargetId)
            ?.name || "",
        elements: currentData.elements,
        appState: currentData.appState,
        versionFiles: "",
        versionDataState: "",
        imageBase64: currentData.imageBase64,
      });
      vaultList.savingState = "done";
      setTimeout(() => this.closeSavePanel(), 1200);
    } catch (e) {
      console.error("Failed to overwrite:", e);
      vaultList.savingState = "idle";
    }
  }

  async handleDeleteAllData(): Promise<void> {
    dialogStore.open(
      "delete_all",
      this.confirmDeleteAllData.bind(this),
      () => {},
    );
  }

  async confirmDeleteAllData(): Promise<void> {
    await vaultActionsService.deleteAllData();
    await drawings.loadDrawings();
    await folders.loadFolders();
    viewStore.resetToMain();
  }
}

export const vaultActions = new VaultActions();
