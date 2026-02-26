import { drawingService } from "$lib/services/drawingService";
import { type DrawingData, type GetDrawingDataResponse, type SaveDrawingData } from "$lib/types";

class DrawingsStore {
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #list = $state<DrawingData[]>([]);

  public async loadDrawings(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      this.#list = await drawingService.loadDrawings();
    } catch (e) {
      this.#error = "Failed to load drawings";
      console.error(e);
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
      return await drawingService.getCurrentDrawingData();
    } catch (e) {
      this.#error = "Failed to get drawing data. Are you on excalidraw.com?";
      console.error(e);
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
      console.error(e);
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
      console.error(e);
    } finally {
      this.#loading = false;
    }
  }

  get list(): DrawingData[] {
    return this.#list;
  }
}

export const drawings = new DrawingsStore();
