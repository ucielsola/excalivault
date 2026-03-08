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

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    const DEBOUNCE_MS = 5000;

    function setupLocalStorageProxy() {
      console.log("[Excalivault Content] Setting up localStorage proxy using Object.defineProperty");

      // Use Object.defineProperty on Storage prototype for permanent hook
      const originalSetItem = Storage.prototype.setItem;

      Object.defineProperty(Storage.prototype, "setItem", {
        value: function(this: Storage, key: string, value: string) {
          console.log("[Excalivault Content] Storage.setItem called with key:", key);

          // Call original method
          const result = originalSetItem.call(this, key, value);

          // Check if this is excalidraw key and we're on localStorage
          if (key === "excalidraw" && this === window.localStorage) {
            console.log("[Excalivault Content] ✅ Detected localStorage.setItem for 'excalidraw' key");
            console.log("[Excalivault Content] Value length:", value?.length);

            if (debounceTimeout) {
              console.log("[Excalivault Content] Clearing previous debounce timeout");
              clearTimeout(debounceTimeout);
            }

            console.log(`[Excalivault Content] ⏱️ Scheduling DRAWING_CHANGED message in ${DEBOUNCE_MS}ms`);
            debounceTimeout = setTimeout(() => {
              console.log("[Excalivault Content] 📤 Sending DRAWING_CHANGED message to background");
              browser.runtime.sendMessage({
                type: MessageType.DRAWING_CHANGED,
              }).catch((err) => {
                console.error("[Excalivault Content] ❌ Failed to notify of drawing change:", err);
              });
            }, DEBOUNCE_MS);
          } else {
            console.log("[Excalivault Content] Ignoring setItem for key:", key);
          }

          return result;
        },
        writable: true,
        configurable: true,
      });

      console.log("[Excalivault Content] Storage.prototype.setItem hook installed successfully");

      // Test the hook
      setTimeout(() => {
        console.log("[Excalivault Content] Testing localStorage hook...");
        localStorage.setItem("__excalivault_test__", "test");
        localStorage.removeItem("__excalivault_test__");
        console.log("[Excalivault Content] Hook test complete");
      }, 1000);
    }

    // Monitor ALL localStorage operations
    function monitorAllStorageOperations() {
      console.log("[Excalivault Content] Setting up comprehensive storage monitoring");

      // Check localStorage periodically to see if 'excalidraw' key changes
      let lastExcalidrawValue = localStorage.getItem("excalidraw");
      console.log("[Excalivault Content] Initial excalidraw value length:", lastExcalidrawValue?.length);

      setInterval(() => {
        const currentExcalidrawValue = localStorage.getItem("excalidraw");
        if (currentExcalidrawValue !== lastExcalidrawValue) {
          console.log("[Excalivault Content] ⚠️ excalidraw value changed (polling)!");
          console.log("[Excalivault Content] Old length:", lastExcalidrawValue?.length);
          console.log("[Excalivault Content] New length:", currentExcalidrawValue?.length);
          lastExcalidrawValue = currentExcalidrawValue;

          // Send DRAWING_CHANGED message with debounce
          if (debounceTimeout) {
            console.log("[Excalivault Content] Clearing previous debounce timeout (polling)");
            clearTimeout(debounceTimeout);
          }

          console.log(`[Excalivault Content] ⏱️ Scheduling DRAWING_CHANGED message in ${DEBOUNCE_MS}ms (polling)`);
          debounceTimeout = setTimeout(() => {
            console.log("[Excalivault Content] 📤 Sending DRAWING_CHANGED message to background (polling)");
            browser.runtime.sendMessage({
              type: MessageType.DRAWING_CHANGED,
            }).catch((err) => {
              console.error("[Excalivault Content] ❌ Failed to notify of drawing change (polling):", err);
            });
          }, DEBOUNCE_MS);
        }
      }, 1000);

      // Log all localStorage keys periodically
      setInterval(() => {
        const keys = Object.keys(localStorage);
        console.log("[Excalivault Content] Current localStorage keys:", keys);
      }, 5000);

      // Hook getItem too to see what's being read
      const originalGetItem = Storage.prototype.getItem;
      Object.defineProperty(Storage.prototype, "getItem", {
        value: function(this: Storage, key: string) {
          const result = originalGetItem.call(this, key);
          if (key === "excalidraw" && this === window.localStorage) {
            console.log("[Excalivault Content] getItem('excalidraw') called, value length:", result?.length);
          }
          return result;
        },
        writable: true,
        configurable: true,
      });

      // Hook removeItem too
      const originalRemoveItem = Storage.prototype.removeItem;
      Object.defineProperty(Storage.prototype, "removeItem", {
        value: function(this: Storage, key: string) {
          console.log("[Excalivault Content] removeItem called with key:", key);
          return originalRemoveItem.call(this, key);
        },
        writable: true,
        configurable: true,
      });

      console.log("[Excalivault Content] Comprehensive storage monitoring setup complete");
    }

    // Listen for storage events from other tabs/windows
    window.addEventListener("storage", (event) => {
      console.log("[Excalivault Content] Storage event detected:", {
        key: event.key,
        oldValue: event.oldValue?.length,
        newValue: event.newValue?.length,
        url: event.url,
      });
    });

    // Listen for beforeunload to see if Excalidraw saves on page close
    window.addEventListener("beforeunload", () => {
      console.log("[Excalivault Content] beforeunload event - checking localStorage...");
      const excalidrawValue = localStorage.getItem("excalidraw");
      console.log("[Excalivault Content] excalidraw value on beforeunload:", excalidrawValue?.length);
    });

    // Listen for visibility changes
    document.addEventListener("visibilitychange", () => {
      console.log("[Excalivault Content] Visibility changed:", document.visibilityState);
      if (document.visibilityState === "hidden") {
        const excalidrawValue = localStorage.getItem("excalidraw");
        console.log("[Excalivault Content] excalidraw value on visibility hidden:", excalidrawValue?.length);
      }
    });

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
        console.log("[Excalivault Content] Drawing injected, clearing unsaved changes flag");
        await browser.storage.local.set({
          "excalivault_unsaved_changes": false,
        });
        console.log("[Excalivault Content] Set excalivault_unsaved_changes = false");

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

    console.log("[Excalivault Content] Starting content script, document.readyState:", document.readyState);
    console.log("[Excalivault Content] Current localStorage keys:", Object.keys(localStorage));
    
    captureMessage(
      "[Excalivault] Content script running at: " + document.readyState,
      "info",
      { serviceName: "excalidraw-content", methodName: "main" },
    );
    console.log("[Excalivault Content] Setting up localStorage proxy...");
    setupLocalStorageProxy();
    console.log("[Excalivault Content] localStorage proxy setup complete");

    console.log("[Excalivault Content] Setting up comprehensive storage monitoring...");
    monitorAllStorageOperations();

    console.log("[Excalivault Content] Checking for drawing to inject...");
    injectDrawingData();
  },
});
