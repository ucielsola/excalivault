import { drawingService } from "$lib/services/drawingService";
import { captureException } from "$lib/services/sentry";
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

  constructor() {
    console.log("[DrawingsStore] Constructor called");
    this.setupStorageListener();
    console.log("[DrawingsStore] Storage listener setup complete");
    this.loadUnsavedState();
    console.log("[DrawingsStore] Initial load complete, hasUnsavedChanges:", this.#hasUnsavedChanges);
  }

  private async loadUnsavedState(): Promise<void> {
    try {
      console.log("[DrawingsStore] Loading initial unsaved state from storage");
      const result = await browser.storage.local.get(
        "excalivault_unsaved_changes",
      );
      console.log("[DrawingsStore] Storage result:", result);
      this.#hasUnsavedChanges =
        (result.excalivault_unsaved_changes as boolean) ?? false;
      console.log("[DrawingsStore] Initial hasUnsavedChanges:", this.#hasUnsavedChanges);
    } catch (e) {
      console.error("[DrawingsStore] Failed to load unsaved state:", e);
    }
  }

  private setupStorageListener(): void {
    browser.storage.onChanged.addListener((changes, areaName) => {
      console.log("[DrawingsStore] Storage changed, areaName:", areaName, "changes:", changes);
      
      if (areaName === "local" && "excalivault_unsaved_changes" in changes) {
        const newValue = (changes.excalivault_unsaved_changes.newValue as boolean) ?? false;
        console.log("[DrawingsStore] excalivault_unsaved_changes changed:", this.#hasUnsavedChanges, "->", newValue);
        this.#hasUnsavedChanges = newValue;
      }
    });
  }

  public async loadDrawings(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      this.#list = await drawingService.loadDrawings();
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
      console.log("[DrawingsStore] Saving drawing, clearing unsaved changes");
      await drawingService.saveDrawing(data);
      await this.loadDrawings();
      this.#hasUnsavedChanges = false;
      console.log("[DrawingsStore] hasUnsavedChanges set to false after save");
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
    } catch (e) {
      this.#error = "Failed to delete drawing";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  public async openDrawing(drawing: DrawingData): Promise<void> {
    try {
      console.log("[DrawingsStore] Opening drawing, clearing unsaved changes");
      await drawingService.openDrawing(drawing);
      this.#hasUnsavedChanges = false;
      console.log("[DrawingsStore] hasUnsavedChanges set to false after open");
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

  getDrawingsInFolder(folderId: string | null): DrawingData[] {
    return this.#list.filter((d) => d.folderId === folderId);
  }

  getRootDrawings(): DrawingData[] {
    return this.getDrawingsInFolder(null);
  }

  // DEBUG: Function to test storage changes manually
  public async testUnsavedChanges(): Promise<void> {
    console.log("[DrawingsStore] DEBUG: Manually setting unsaved changes");
    await browser.storage.local.set({
      "excalivault_unsaved_changes": true,
    });
    console.log("[DrawingsStore] DEBUG: Set excalivault_unsaved_changes = true");
  }

  // DEBUG: Function to clear unsaved changes manually
  public async clearUnsavedChanges(): Promise<void> {
    console.log("[DrawingsStore] DEBUG: Manually clearing unsaved changes");
    await browser.storage.local.set({
      "excalivault_unsaved_changes": false,
    });
    console.log("[DrawingsStore] DEBUG: Set excalivault_unsaved_changes = false");
  }
}

export const drawings = new DrawingsStore();
console.log("[DrawingsStore] DrawingsStore instance created");

// DEBUG: Make available in console for testing
if (typeof window !== "undefined") {
  (window as any).testUnsavedChanges = () => drawings.testUnsavedChanges();
  (window as any).clearUnsavedChanges = () => drawings.clearUnsavedChanges();
  console.log("[DrawingsStore] DEBUG: Added test functions to window:");
  console.log("[DrawingsStore]   - testUnsavedChanges(): Manually set unsaved changes");
  console.log("[DrawingsStore]   - clearUnsavedChanges(): Manually clear unsaved changes");
}
