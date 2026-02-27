import { drawingService } from "$lib/services/drawingService";
import { captureException } from "$lib/services/sentry";
import {
  type DrawingData,
  type GetDrawingDataResponse,
  type SaveDrawingData,
} from "$lib/types";

class DrawingsStore {
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #list = $state<DrawingData[]>([]);
  #search = $state<string>("");

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
      await drawingService.saveDrawing(data);
      await this.loadDrawings();
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
      await drawingService.openDrawing(drawing);
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

  getDrawingsInFolder(folderId: string | null): DrawingData[] {
    return this.#list.filter((d) => d.folderId === folderId);
  }

  getRootDrawings(): DrawingData[] {
    return this.getDrawingsInFolder(null);
  }
}

export const drawings = new DrawingsStore();
