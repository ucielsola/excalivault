import { defineContentScript } from "#imports";
import browser from "webextension-polyfill";

import {
  captureException,
  captureMessage,
  initSentry,
} from "$lib/services/sentry";

export default defineContentScript({
  matches: ["https://excalidraw.com/*"],
  main() {
    initSentry({
      allowUrls: [/chrome-extension:\/\/[a-z]+/, /moz-extension:\/\/[a-z]+/],
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
          captureMessage("[Excalivault] No drawing data to inject", "info", {
            serviceName: "excalidraw-content",
            methodName: "injectDrawingData",
          });
          return;
        }

        captureMessage(
          "[Excalivault] Injecting drawing data: " + dataToInject.name,
          "info",
          {
            serviceName: "excalidraw-content",
            methodName: "injectDrawingData",
          },
        );

        localStorage.setItem("excalidraw", dataToInject.elements);
        localStorage.setItem("excalidraw-state", dataToInject.appState);
        localStorage.setItem("drawing-id", dataToInject.id);
        localStorage.setItem("drawing-title", dataToInject.name);
        if (dataToInject.versionFiles) {
          localStorage.setItem("version-files", dataToInject.versionFiles);
        }
        if (dataToInject.versionDataState) {
          localStorage.setItem(
            "version-dataState",
            dataToInject.versionDataState,
          );
        }

        await browser.storage.local.remove(DRAWING_TO_INJECT_KEY);

        captureMessage(
          "[Excalivault] Drawing data injected, reloading page...",
          "info",
          {
            serviceName: "excalidraw-content",
            methodName: "injectDrawingData",
          },
        );
        window.location.reload();
      } catch (error) {
        captureException(error as Error, {
          serviceName: "excalidraw-content",
          methodName: "injectDrawingData",
        });
        console.error("[Excalivault] Failed to inject drawing data:", error);
      }
    }

    captureMessage(
      "[Excalivault] Content script running at: " + document.readyState,
      "info",
      { serviceName: "excalidraw-content", methodName: "main" },
    );
    injectDrawingData();
  },
});
