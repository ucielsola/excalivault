import browser from "webextension-polyfill";

import { browserTabService } from "$lib/services/browserTabService";
import { captureException } from "$lib/services/sentry";

class BrowserTabStore {
  #isExcalidraw = $state<boolean>(false);
  #tabId = $state<number | null>(null);
  #loading = $state<boolean>(true);

  constructor() {
    this.checkCurrentTab();

    browserTabService.onTabChange((tabId, changeInfo, tab) => {
      if (tab.url?.includes("excalidraw.com")) {
        this.#isExcalidraw = true;
        this.#tabId = tabId;
      } else {
        this.#isExcalidraw = false;
        this.#tabId = null;
      }
    });

    browserTabService.onTabActivated(async (activeInfo) => {
      await this.checkTabById(activeInfo.tabId);
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
      } else {
        this.#isExcalidraw = false;
        this.#tabId = null;
      }
    } catch (e) {
      captureException(e as Error);
    }
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
}

export const browserTab = new BrowserTabStore();
