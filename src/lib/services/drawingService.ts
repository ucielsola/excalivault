import browser from "webextension-polyfill";

import {
  MessageType,
  type DeleteDrawingResponse,
  type DrawingData,
  type DrawingMessage,
  type FolderData,
  type GetAllDrawingsResponse,
  type GetDrawingDataResponse,
  type MoveDrawingResponse,
  type SaveDrawingData,
  type SaveDrawingResponse,
} from "$lib/types";

class DrawingService {
  private cache: DrawingData[] = [];

  private async sendMessage<T>(message: DrawingMessage): Promise<T> {
    const response = (await browser.runtime.sendMessage(message)) as T;
    return response;
  }

  public async loadDrawings(): Promise<DrawingData[]> {
    const response = await this.sendMessage<GetAllDrawingsResponse>({
      type: MessageType.GET_ALL_DRAWINGS,
    });
    this.cache = response.drawings ?? [];
    return this.cache;
  }

  public async loadWorkspace(): Promise<{
    folders: FolderData[];
    drawings: DrawingData[];
  }> {
    const response = await this.sendMessage<{
      folders: FolderData[];
      drawings: DrawingData[];
    }>({
      type: MessageType.GET_WORKSPACE,
    });
    this.cache = response.drawings ?? [];
    return { folders: response.folders ?? [], drawings: this.cache };
  }

  public async moveDrawing(
    drawingId: string,
    folderId: string | null,
  ): Promise<void> {
    await this.sendMessage<MoveDrawingResponse>({
      type: MessageType.MOVE_DRAWING,
      payload: { drawingId, folderId },
    });
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

  public async updateDrawing(data: {
    id: string;
    name: string;
    elements: string;
    appState: string;
    versionFiles: string;
    versionDataState: string;
    imageBase64?: string;
  }): Promise<void> {
    const folderId = this.cache.find((d) => d.id === data.id)?.folderId ?? null;
    await this.sendMessage<SaveDrawingResponse>({
      type: MessageType.SAVE_DRAWING,
      payload: {
        ...data,
        folderId,
      },
    });
  }

  public async duplicateDrawing(drawing: DrawingData): Promise<void> {
    await this.sendMessage<SaveDrawingResponse>({
      type: MessageType.SAVE_DRAWING,
      payload: {
        id: `copy_${Date.now()}`,
        name: `${drawing.name} (copy)`,
        elements: drawing.elements,
        appState: drawing.appState,
        versionFiles: drawing.versionFiles,
        versionDataState: drawing.versionDataState,
        imageBase64: drawing.imageBase64,
        folderId: drawing.folderId ?? null,
      },
    });
  }
}

export const drawingService = new DrawingService();
