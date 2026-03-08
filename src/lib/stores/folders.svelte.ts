import { folderService } from "$lib/services/folderService";
import { captureException } from "$lib/services/sentry";
import { type FolderData, type SortBy, type SortOrder } from "$lib/types";
import { COLOR_VALUES } from "$lib/utils/folderColors";
import { drawings } from "./drawings.svelte";

class FoldersStore {
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #folders = $state<FolderData[]>([]);
  #sortBy = $state<SortBy>("name");
  #sortOrder = $state<SortOrder>("asc");
  #expandedFolders = $state<Set<string>>(new Set());
  #cachedDrawingCounts = $state<Map<string, number>>(new Map());

  public async loadFolders(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      this.#folders = await folderService.loadFolders();
    } catch (e) {
      this.#error = "Failed to load folders";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async createFolder(
    name: string,
    parentId: string | null = null,
    color?: string,
    icon?: string,
  ): Promise<void> {
    const folderColor =
      color ?? COLOR_VALUES[this.#folders.length % COLOR_VALUES.length];

    const tempId = `temp-${Date.now()}`;
    const optimisticFolder: FolderData = {
      id: tempId,
      name,
      parentId,
      color: folderColor,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.#folders = [...this.#folders, optimisticFolder];
    this.#error = null;

    try {
      const response = await folderService.createFolder(name, parentId, folderColor, icon);
      this.#folders = response.folders;
      this.invalidateDrawingCountCache();
    } catch (e) {
      this.#folders = this.#folders.filter((f) => f.id !== tempId);
      this.#error = "Failed to create folder";
      captureException(e as Error);
    }
  }

  public async updateFolder(id: string, name: string, color?: string, icon?: string): Promise<void> {
    const folder = this.#folders.find((f) => f.id === id);
    if (!folder) return;

    const originalName = folder.name;
    const originalColor = folder.color;
    const originalIcon = folder.icon;
    folder.name = name;
    if (color) folder.color = color;
    if (icon !== undefined) folder.icon = icon;
    this.#folders = [...this.#folders];
    this.#error = null;

    try {
      const response = await folderService.updateFolder(id, name, color, icon);
      this.#folders = response.folders;
      this.invalidateDrawingCountCache();
    } catch (e) {
      folder.name = originalName;
      folder.color = originalColor;
      folder.icon = originalIcon;
      this.#folders = [...this.#folders];
      this.#error = "Failed to update folder";
      captureException(e as Error);
    }
  }

  public async updateFolderColor(id: string, color: string): Promise<void> {
    const folder = this.#folders.find((f) => f.id === id);
    if (!folder) {
      return;
    }

    const originalColor = folder.color;
    folder.color = color;
    this.#folders = [...this.#folders];
    this.#error = null;

    try {
      const response = await folderService.updateFolder(id, folder.name, color, folder.icon);
      this.#folders = response.folders;
    } catch (e) {
      folder.color = originalColor;
      this.#folders = [...this.#folders];
      this.#error = "Failed to update folder color";
      captureException(e as Error);
    }
  }

  public async updateFolderIcon(id: string, icon: string): Promise<void> {
    const folder = this.#folders.find((f) => f.id === id);
    if (!folder) {
      return;
    }

    const originalIcon = folder.icon;
    folder.icon = icon;
    this.#folders = [...this.#folders];
    this.#error = null;

    try {
      const response = await folderService.updateFolder(id, folder.name, folder.color, icon);
      this.#folders = response.folders;
    } catch (e) {
      folder.icon = originalIcon;
      this.#folders = [...this.#folders];
      this.#error = "Failed to update folder icon";
      captureException(e as Error);
    }
  }

  public async deleteFolder(id: string): Promise<void> {
    const folder = this.#folders.find((f) => f.id === id);
    if (!folder) return;

    const previousFolders = [...this.#folders];
    this.#folders = this.#folders.filter((f) => f.id !== id);
    this.#error = null;

    try {
      const response = await folderService.deleteFolder(id);
      this.#folders = response.folders;
      drawings.setDrawings(response.drawings);
      this.invalidateDrawingCountCache();
    } catch (e) {
      this.#folders = previousFolders;
      this.#error = "Failed to delete folder";
      captureException(e as Error);
    }
  }

  toggleFolder(id: string): void {
    if (this.#expandedFolders.has(id)) {
      this.#expandedFolders.delete(id);
    } else {
      this.#expandedFolders.add(id);
    }
    this.#expandedFolders = new Set(this.#expandedFolders);
  }

  isFolderExpanded(id: string): boolean {
    return this.#expandedFolders.has(id);
  }

  get expandedFolders(): Set<string> {
    return this.#expandedFolders;
  }

  get sortedFolders(): FolderData[] {
    const folders = [...this.#folders];
    folders.sort((a, b) => {
      let comparison = 0;
      if (this.#sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (this.#sortBy === "createdAt") {
        comparison = a.createdAt - b.createdAt;
      }
      return this.#sortOrder === "asc" ? comparison : -comparison;
    });
    return folders;
  }

  get loading(): boolean {
    return this.#loading;
  }

  get error(): string | null {
    return this.#error;
  }

  get folders(): FolderData[] {
    return this.#folders;
  }

  get sortBy(): SortBy {
    return this.#sortBy;
  }

  set sortBy(value: SortBy) {
    this.#sortBy = value;
  }

  get sortOrder(): SortOrder {
    return this.#sortOrder;
  }

  set sortOrder(value: SortOrder) {
    this.#sortOrder = value;
  }

  getFolderById(id: string): FolderData | undefined {
    return this.#folders.find((f) => f.id === id);
  }

  getFolderChildren(parentId: string | null): FolderData[] {
    return this.#folders.filter((f) => f.parentId === parentId);
  }

  getFolderPath(id: string): FolderData[] {
    const path: FolderData[] = [];
    let folder = this.getFolderById(id);
    while (folder) {
      path.unshift(folder);
      folder = folder.parentId
        ? this.getFolderById(folder.parentId)
        : undefined;
    }
    return path;
  }

  getDescendantCount(folderId: string): { folders: number; drawings: number } {
    const descendantFolderIds: string[] = [];
    const queue = [folderId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = this.#folders.filter((f) => f.parentId === currentId);
      for (const child of children) {
        descendantFolderIds.push(child.id);
        queue.push(child.id);
      }
    }

    const descendantDrawings = drawings.list.filter((d) =>
      d.folderId ? descendantFolderIds.includes(d.folderId) : false,
    ).length;

    return {
      folders: descendantFolderIds.length,
      drawings: descendantDrawings,
    };
  }

  getTotalDrawingsCount(folderId: string): number {
    if (this.#cachedDrawingCounts.has(folderId)) {
      return this.#cachedDrawingCounts.get(folderId)!;
    }

    let count = 0;
    const queue = [folderId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const folderDrawings = drawings.list.filter((d) => d.folderId === currentId);
      count += folderDrawings.length;
      const children = this.#folders.filter((f) => f.parentId === currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }

    this.#cachedDrawingCounts.set(folderId, count);
    return count;
  }

  invalidateDrawingCountCache(): void {
    this.#cachedDrawingCounts = new Map();
  }
}

export const folders = new FoldersStore();
