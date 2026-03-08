import browser from "webextension-polyfill";

import { MessageType, type DrawingMessage } from "$lib/types";

class VaultActionsService {
  private async sendMessage<T>(message: DrawingMessage): Promise<T> {
    const response = (await browser.runtime.sendMessage(message)) as T;
    return response;
  }

  async deleteAllData(): Promise<void> {
    await this.sendMessage<{ success: boolean }>({
      type: MessageType.DELETE_ALL_DATA,
    });
  }
}

export const vaultActionsService = new VaultActionsService();
