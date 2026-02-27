import browser from "webextension-polyfill";

import {
  MessageType,
  type CreateFolderMessage,
  type CreateFolderResponse,
  type DeleteFolderMessage,
  type DeleteFolderResponse,
  type DrawingMessage,
  type FolderData,
  type UpdateFolderMessage,
  type UpdateFolderResponse,
} from "$lib/types";

class FolderService {
  private async sendMessage<T>(message: DrawingMessage): Promise<T> {
    const response = (await browser.runtime.sendMessage(message)) as T;
    return response;
  }

  public async loadFolders(): Promise<FolderData[]> {
    const { folders } = await this.sendMessage<{ folders: FolderData[] }>({
      type: MessageType.GET_WORKSPACE,
    });
    return folders ?? [];
  }

  public async createFolder(
    name: string,
    parentId: string | null = null,
    color: string,
  ): Promise<void> {
    await this.sendMessage<CreateFolderResponse>({
      type: MessageType.CREATE_FOLDER,
      payload: { name, parentId, color },
    });
  }

  public async updateFolder(
    id: string,
    name: string,
    color?: string,
  ): Promise<void> {
    await this.sendMessage<UpdateFolderResponse>({
      type: MessageType.UPDATE_FOLDER,
      payload: { id, name, color },
    });
  }

  public async deleteFolder(id: string): Promise<void> {
    await this.sendMessage<DeleteFolderResponse>({
      type: MessageType.DELETE_FOLDER,
      payload: { id },
    });
  }
}

export const folderService = new FolderService();
