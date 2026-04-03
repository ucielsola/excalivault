import { defineBackground } from "#imports";
import browser from "webextension-polyfill";

export default defineBackground(() => {
  browser.sidePanel.setOptions({ path: "sidepanel.html" });

  browser.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
});
