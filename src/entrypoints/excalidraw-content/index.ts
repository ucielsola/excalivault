import { defineContentScript } from "#imports";
import browser from "webextension-polyfill";

import {
  captureException,
  captureMessage,
  initSentry,
} from "$lib/services/sentry";
import { MessageType } from "$lib/types";

export default defineContentScript({
  matches: ["https://excalidraw.com/*"],
  main() {
    initSentry({
      allowUrls: [/chrome-extension:\/\/[a-z]+/, /moz-extension:\/\/[a-z]+/],
    });
    const DRAWING_TO_INJECT_KEY = "excalivault_drawing_to_inject";
    const SERVICE_NAME = "excalivault-content";
    const INTERACTION_EVENTS = ["pointerup", "keyup", "click"];

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    const DEBOUNCE_MS = 2000;

    function handleInteraction() {
      const currentExcalidrawValue = localStorage.getItem("excalidraw");
      if (!currentExcalidrawValue) return;

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        browser.runtime
          .sendMessage({
            type: MessageType.DRAWING_CHANGED,
          })
          .catch((err) => {
            console.error(
              "[Excalivault] Failed to notify of drawing change:",
              err,
            );
          });
      }, DEBOUNCE_MS);
    }

    function monitorDrawingChanges() {
      INTERACTION_EVENTS.forEach((event) => {
        document.addEventListener(event, handleInteraction);
      });
    }

    function cleanup() {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      INTERACTION_EVENTS.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    }

    window.addEventListener("beforeunload", cleanup);

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
            serviceName: SERVICE_NAME,
            methodName: "injectDrawingData",
          });
          return;
        }

        captureMessage(
          "[Excalivault] Injecting drawing data: " + dataToInject.name,
          "info",
          {
            serviceName: SERVICE_NAME,
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
        await browser.storage.local.set({
          excalivault_unsaved_changes: false,
        });

        captureMessage(
          "[Excalivault] Drawing data injected, reloading page...",
          "info",
          {
            serviceName: SERVICE_NAME,
            methodName: "injectDrawingData",
          },
        );
        window.location.reload();
      } catch (error) {
        captureException(error as Error, {
          serviceName: SERVICE_NAME,
          methodName: "injectDrawingData",
        });
        console.error("[Excalivault] Failed to inject drawing data:", error);
      }
    }

    captureMessage(
      "[Excalivault] Content script running at: " + document.readyState,
      "info",
      { serviceName: SERVICE_NAME, methodName: "main" },
    );

    monitorDrawingChanges();
    injectDrawingData();
  },
});
