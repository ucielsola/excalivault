import browser from "webextension-polyfill";

class BrowserTabService {
  private static instance: BrowserTabService;

  static getInstance(): BrowserTabService {
    if (!BrowserTabService.instance) {
      BrowserTabService.instance = new BrowserTabService();
    }
    return BrowserTabService.instance;
  }

  public onTabChange(
    callback: (
      tabId: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
      tab: browser.Tabs.Tab,
    ) => void,
  ): void {
    browser.tabs.onUpdated.addListener(callback);
  }

  public onTabActivated(
    callback: (activeInfo: browser.Tabs.OnActivatedActiveInfoType) => void,
  ): void {
    browser.tabs.onActivated.addListener(callback);
  }
}

export const browserTabService = BrowserTabService.getInstance();
