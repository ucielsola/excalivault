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
}

export const drawings = new DrawingsStore();
