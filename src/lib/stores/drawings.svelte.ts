import { computeContentHash } from "$lib/utils/contentHash";
import { drawingService } from "$lib/services/drawingService";
import { captureException } from "$lib/services/sentry";
import { folders } from "$lib/stores/folders.svelte";
import {
  type DrawingData,
  type GetDrawingDataResponse,
  type SaveDrawingData,
} from "$lib/types";
import browser from "webextension-polyfill";

class DrawingsStore {
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #list = $state<DrawingData[]>([]);
  #search = $state<string>("");
  #hasUnsavedChanges = $state<boolean>(false);
  #activeDrawingId = $state<string | null>(null);

  constructor() {
    this.loadActiveDrawingId();
    this.setupStorageListener();
    this.loadUnsavedState();
  }

  private async loadActiveDrawingId(): Promise<void> {
    try {
      const result = await browser.storage.local.get("drawing-id");
      this.#activeDrawingId = (result["drawing-id"] as string) ?? null;
    } catch (e) {
      console.error("[DrawingsStore] Failed to load active drawing ID:", e);
    }
  }

  private async loadUnsavedState(): Promise<void> {
    try {
      const result = await browser.storage.local.get(
        "excalivault_unsaved_changes",
      );
      this.#hasUnsavedChanges =
        (result.excalivault_unsaved_changes as boolean) ?? false;
    } catch (e) {
      console.error("[DrawingsStore] Failed to load unsaved state:", e);
    }
  }

  private setupStorageListener(): void {
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && "excalivault_unsaved_changes" in changes) {
        this.#hasUnsavedChanges =
          (changes.excalivault_unsaved_changes.newValue as boolean) ?? false;
      }
    });
  }

  public async loadDrawings(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      this.#list = await drawingService.loadDrawings();
      this.detectActiveDrawingByContent();
    } catch (e) {
      this.#error = "Failed to load drawings";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public setDrawings(drawings: DrawingData[]): void {
    this.#list = drawings;
  }

  get loading(): boolean {
    return this.#loading;
  }

  get error(): string | null {
    return this.#error;
  }

  public async getCurrentDrawingData(): Promise<GetDrawingDataResponse | null> {
    try {
      const result = await drawingService.getCurrentDrawingData();
      return result;
    } catch (e) {
      this.#error = "Failed to get drawing data. Are you on excalidraw.com?";
      captureException(e as Error);
      return null;
    }
  }

  public async saveDrawing(data: SaveDrawingData): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      const response = await drawingService.saveDrawing(data);
      await this.loadDrawings();
      this.#hasUnsavedChanges = false;
      folders.invalidateDrawingCountCache();

      // If this is a new drawing (not an update), update active drawing ID
      if (data.id !== this.#activeDrawingId) {
        this.#activeDrawingId = data.id;
      }
    } catch (e) {
      this.#error = "Failed to save drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async moveDrawing(
    drawingId: string,
    folderId: string | null,
  ): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await drawingService.moveDrawing(drawingId, folderId);
      await this.loadDrawings();
      folders.invalidateDrawingCountCache();
    } catch (e) {
      this.#error = "Failed to move drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async deleteDrawing(id: string): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await drawingService.deleteDrawing(id);
      await this.loadDrawings();
      folders.invalidateDrawingCountCache();
    } catch (e) {
      this.#error = "Failed to delete drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async openDrawing(drawing: DrawingData): Promise<void> {
    try {
      await drawingService.openDrawing(drawing);
      this.#hasUnsavedChanges = false;
      this.#activeDrawingId = drawing.id;
    } catch (e) {
      this.#error = "Failed to open drawing";
      captureException(e as Error);
      throw e;
    }
  }

  public async updateDrawingName(id: string, name: string): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      const drawing = this.#list.find((d) => d.id === id);
      if (!drawing) return;

      await drawingService.updateDrawing({
        id,
        name,
        elements: drawing.elements,
        appState: drawing.appState,
        versionFiles: drawing.versionFiles,
        versionDataState: drawing.versionDataState,
      });
      await this.loadDrawings();
    } catch (e) {
      this.#error = "Failed to update drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async duplicateDrawing(drawing: DrawingData): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await drawingService.duplicateDrawing(drawing);
      await this.loadDrawings();
      folders.invalidateDrawingCountCache();
    } catch (e) {
      this.#error = "Failed to duplicate drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async updateDrawing(data: {
    id: string;
    name: string;
    elements: string;
    appState: string;
    versionFiles: string;
    versionDataState: string;
    imageBase64?: string;
  }): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await drawingService.updateDrawing(data);
      await this.loadDrawings();
    } catch (e) {
      this.#error = "Failed to update drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  get list(): DrawingData[] {
    return this.#list;
  }

  get search(): string {
    return this.#search;
  }

  set search(value: string) {
    this.#search = value;
  }

  get filteredList(): DrawingData[] {
    const query = this.#search.toLowerCase();
    if (!query) return this.#list;
    return this.#list.filter((d) => d.name.toLowerCase().includes(query));
  }

  get hasUnsavedChanges(): boolean {
    return this.#hasUnsavedChanges;
  }

  get activeDrawingId(): string | null {
    return this.#activeDrawingId;
  }

  setActiveDrawingId(id: string | null): void {
    this.#activeDrawingId = id;
    browser.storage.local.set({ "drawing-id": id }).catch((e) => {
      console.error("[DrawingsStore] Failed to sync active drawing ID:", e);
    });
  }

  public async detectActiveDrawingByContent(): Promise<void> {
    try {
      const currentData = await this.getCurrentDrawingData();
      if (!currentData?.elements) return;

      const currentHash = await computeContentHash(currentData.elements);
      const matchingDrawing = this.#list.find((d) => d.contentHash === currentHash);

      if (matchingDrawing) {
        this.#activeDrawingId = matchingDrawing.id;
        browser.storage.local.set({ "drawing-id": matchingDrawing.id }).catch((e) => {
          console.error("[DrawingsStore] Failed to sync active drawing ID:", e);
        });
      }
    } catch (e) {
      console.error("[DrawingsStore] Failed to detect active drawing by content:", e);
    }
  }

  getDrawingsInFolder(folderId: string | null): DrawingData[] {
    return this.#list.filter((d) => d.folderId === folderId);
  }

  getRootDrawings(): DrawingData[] {
    return this.getDrawingsInFolder(null);
  }
}

export const drawings = new DrawingsStore();
