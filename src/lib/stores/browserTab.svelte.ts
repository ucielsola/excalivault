import browser from "webextension-polyfill";

import { browserTabService } from "$lib/services/browserTabService";
import { captureException } from "$lib/services/sentry";
import { drawings } from "$lib/stores";
import { MessageType, type GetThumbnailResponse } from "$lib/types";

class BrowserTabStore {
  #isExcalidraw = $state<boolean>(false);
  #tabId = $state<number | null>(null);
  #loading = $state<boolean>(true);
  #currentThumbnail = $state<string | null>(null);

  constructor() {
    this.checkCurrentTab();

    browserTabService.onTabChange((tabId, changeInfo, tab) => {
      if (tab.url?.includes("excalidraw.com")) {
        this.#isExcalidraw = true;
        this.#tabId = tabId;
        drawings.detectActiveDrawingByContent();
        this.captureThumbnailWithRetry();
      } else {
        this.#isExcalidraw = false;
        this.#tabId = null;
        this.#currentThumbnail = null;
      }
    });

    browserTabService.onTabActivated(async (activeInfo) => {
      await this.checkTabById(activeInfo.tabId);
    });

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && "excalivault_unsaved_changes" in changes) {
        if (this.#isExcalidraw) {
          this.captureThumbnail();
        }
      }
    });
  }

  async checkCurrentTab() {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const currentTab = tabs[0];
      if (currentTab?.url) {
        this.#isExcalidraw = currentTab.url.includes("excalidraw.com");
        this.#tabId = currentTab.id || null;
        if (this.#isExcalidraw && this.#tabId) {
          await this.captureThumbnailWithRetry();
        }
      }
    } catch (e) {
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  async checkTabById(tabId: number) {
    try {
      const tab = await browser.tabs.get(tabId);
      if (tab.url?.includes("excalidraw.com")) {
        this.#isExcalidraw = true;
        this.#tabId = tabId;
        await this.captureThumbnailWithRetry();
      } else {
        this.#isExcalidraw = false;
        this.#tabId = null;
        this.#currentThumbnail = null;
      }
    } catch (e) {
      captureException(e as Error);
    }
  }

  private async captureThumbnail(): Promise<void> {
    try {
      const response = await browser.runtime.sendMessage({
        type: MessageType.GET_THUMBNAIL,
      }) as GetThumbnailResponse | null;
      this.#currentThumbnail = response?.thumbnailBase64 ?? null;
    } catch (e) {
      captureException(e as Error);
      this.#currentThumbnail = null;
    }
  }

  private async captureThumbnailWithRetry(retries = 3, delay = 500): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await browser.runtime.sendMessage({
          type: MessageType.GET_THUMBNAIL,
        }) as GetThumbnailResponse | null;
        
        if (response?.thumbnailBase64) {
          this.#currentThumbnail = response.thumbnailBase64;
          return;
        }
      } catch (e) {
        if (i === retries - 1) {
          captureException(e as Error);
          this.#currentThumbnail = null;
          return;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.#currentThumbnail = null;
  }

  get isExcalidraw() {
    return this.#isExcalidraw;
  }

  get tabId() {
    return this.#tabId;
  }

  get loading() {
    return this.#loading;
  }

  get currentThumbnail() {
    return this.#currentThumbnail;
  }

  set currentThumbnail(value: string | null) {
    this.#currentThumbnail = value;
  }
}

export const browserTab = new BrowserTabStore();
