import { defineContentScript } from "#imports";
import browser from "webextension-polyfill";
import { initSentry, captureException } from "$lib/services/sentry";

export default defineContentScript({
  matches: ["https://excalidraw.com/*"],
  main() {
    initSentry({
      allowUrls: [
        /chrome-extension:\/\/[a-z]+/,
        /moz-extension:\/\/[a-z]+/,
      ],
    });
    const DRAWING_TO_INJECT_KEY = "excalivault_drawing_to_inject";

    async function injectDrawingData() {
      try {
        const result = await browser.storage.local.get(DRAWING_TO_INJECT_KEY);
        const dataToInject = result[DRAWING_TO_INJECT_KEY] as {
          id: string;
          name: string;
          elements: string;
          appState: string;
          versionFiles: string;
          versionDataState: string;
        } | null;

        if (!dataToInject) {
          console.log("[Excalivault] No drawing data to inject");
          return;
        }

        console.log("[Excalivault] Injecting drawing data:", dataToInject.name);

        localStorage.setItem("excalidraw", dataToInject.elements);
        localStorage.setItem("excalidraw-state", dataToInject.appState);
        localStorage.setItem("drawing-id", dataToInject.id);
        localStorage.setItem("drawing-title", dataToInject.name);
        if (dataToInject.versionFiles) {
          localStorage.setItem("version-files", dataToInject.versionFiles);
        }
        if (dataToInject.versionDataState) {
          localStorage.setItem("version-dataState", dataToInject.versionDataState);
        }

        await browser.storage.local.remove(DRAWING_TO_INJECT_KEY);

        console.log("[Excalivault] Drawing data injected, reloading page...");
        window.location.reload();
      } catch (error) {
        captureException(error as Error);
        console.error("[Excalivault] Failed to inject drawing data:", error);
      }
    }

    console.log("[Excalivault] Content script running at:", document.readyState);
    injectDrawingData();
  },
});
