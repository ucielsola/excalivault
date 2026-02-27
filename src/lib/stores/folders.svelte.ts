import { folderService } from "$lib/services/folderService";
import { captureException } from "$lib/services/sentry";
import { type FolderData, type SortBy, type SortOrder } from "$lib/types";
import { COLOR_VALUES } from "$lib/utils/folderColors";

class FoldersStore {
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #folders = $state<FolderData[]>([]);
  #sortBy = $state<SortBy>("name");
  #sortOrder = $state<SortOrder>("asc");
  #expandedFolders = $state<Set<string>>(new Set());

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
  ): Promise<void> {
    this.#loading = true;
    this.#error = null;

    const folderColor =
      color ?? COLOR_VALUES[this.#folders.length % COLOR_VALUES.length];

    try {
      await folderService.createFolder(name, parentId, folderColor);
      await this.loadFolders();
    } catch (e) {
      this.#error = "Failed to create folder";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async updateFolder(id: string, name: string): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await folderService.updateFolder(id, name);
      await this.loadFolders();
    } catch (e) {
      this.#error = "Failed to update folder";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async deleteFolder(id: string): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await folderService.deleteFolder(id);
      await this.loadFolders();
    } catch (e) {
      this.#error = "Failed to delete folder";
      captureException(e as Error);
    } finally {
      this.#loading = false;
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
}

export const folders = new FoldersStore();
