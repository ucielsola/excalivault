import browser from "webextension-polyfill";

import {
  MessageType,
  type DeleteDrawingResponse,
  type DrawingData,
  type DrawingMessage,
  type GetAllDrawingsResponse,
  type GetDrawingDataResponse,
  type SaveDrawingData,
  type SaveDrawingResponse,
} from "$lib/types";

class DrawingService {
  private async sendMessage<T>(message: DrawingMessage): Promise<T> {
    const response = (await browser.runtime.sendMessage(message)) as T;
    return response;
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

  public async openDrawing(drawing: DrawingData): Promise<void> {
    await this.sendMessage<void>({
      type: MessageType.OPEN_DRAWING,
      payload: {
        id: drawing.id,
        name: drawing.name,
        elements: drawing.elements,
        appState: drawing.appState,
        versionFiles: drawing.versionFiles,
        versionDataState: drawing.versionDataState,
      },
    });
  }
}

export const drawingService = new DrawingService();
