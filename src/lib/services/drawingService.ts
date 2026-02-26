import browser from "webextension-polyfill";
import {
  type DrawingData,
  type GetAllDrawingsResponse,
  type GetDrawingDataResponse,
  type SaveDrawingResponse,
  type DeleteDrawingResponse,
  type SaveDrawingData,
  type DrawingMessage,
  MessageType,
} from "$lib/types";

class DrawingService {
  private async sendMessage<T>(message: DrawingMessage): Promise<T> {
    return (await browser.runtime.sendMessage(message)) as T;
  }

  public async loadDrawings(): Promise<DrawingData[]> {
    const response = await this.sendMessage<GetAllDrawingsResponse>({
      type: MessageType.GET_ALL_DRAWINGS,
    });
    return response.drawings ?? [];
  }

  public async getCurrentDrawingData(): Promise<GetDrawingDataResponse | null> {
    return await this.sendMessage<GetDrawingDataResponse>({
      type: MessageType.GET_DRAWING_DATA,
    });
  }

  public async saveDrawing(data: SaveDrawingData): Promise<void> {
    await this.sendMessage<SaveDrawingResponse>({
      type: MessageType.SAVE_DRAWING,
      payload: data,
    });
  }

  public async deleteDrawing(id: string): Promise<void> {
    await this.sendMessage<DeleteDrawingResponse>({
      type: MessageType.DELETE_DRAWING,
      payload: { id },
    });
  }
}

export const drawingService = new DrawingService();
