import { defineBackground } from "#imports";
import browser from "webextension-polyfill";

import { captureException, initSentry } from "$lib/services/sentry";
import { MessageType, type DrawingMessage } from "$lib/types";

interface SidePanelBrowser {
  sidePanel: {
    setPanelBehavior: (options: {
      openPanelOnActionClick: boolean;
    }) => Promise<void>;
    setOptions: (options: {
      tabId: number;
      path: string;
      enabled: boolean;
    }) => Promise<void>;
  };
}

export default defineBackground({
  main() {
    initSentry();
    const STORAGE_KEY = "excalivault_drawings";
    const DRAWING_TO_INJECT_KEY = "excalivault_drawing_to_inject";
    const TARGET_URL = "https://excalidraw.com";

    (browser as unknown as SidePanelBrowser).sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    });

    browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
      if (!tab.url) return;

      const isEnabled = tab.url.startsWith(TARGET_URL);
      await (browser as unknown as SidePanelBrowser).sidePanel.setOptions({
        tabId,
        path: "sidepanel.html",
        enabled: isEnabled,
      });
    });

    async function getDrawings(): Promise<unknown[]> {
      const result = (await browser.storage.local.get(STORAGE_KEY)) as Record<
        string,
        unknown[]
      >;
      return result[STORAGE_KEY] || [];
    }

    async function saveDrawings(drawings: unknown[]): Promise<void> {
      await browser.storage.local.set({ [STORAGE_KEY]: drawings });
    }

    async function getActiveTab(): Promise<unknown> {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tabs[0] || null;
    }

    browser.runtime.onMessage.addListener(
      (message: unknown, _sender: browser.Runtime.MessageSender) => {
        try {
          if (!message || typeof message !== "object" || !("type" in message)) {
            return Promise.resolve(null);
          }

          const typedMessage = message as DrawingMessage;

          if (typedMessage.type === MessageType.GET_ALL_DRAWINGS) {
            return getDrawings().then((drawings) => ({ drawings }));
          }

          if (typedMessage.type === MessageType.SAVE_DRAWING) {
            const payload = typedMessage.payload as {
              id: string;
              name: string;
              elements: string;
              appState: string;
              versionFiles: string;
              versionDataState: string;
              imageBase64?: string;
              viewBackgroundColor?: string;
            };

            return getDrawings().then(async (drawings: unknown[]) => {
              const existingIndex = (drawings as { id: string }[]).findIndex(
                (d) => d.id === payload.id,
              );
              const now = Date.now();

              const drawing = {
                id: payload.id,
                name: payload.name,
                elements: payload.elements,
                appState: payload.appState,
                versionFiles: payload.versionFiles,
                versionDataState: payload.versionDataState,
                imageBase64: payload.imageBase64,
                viewBackgroundColor: payload.viewBackgroundColor,
                createdAt:
                  existingIndex >= 0
                    ? (drawings[existingIndex] as { createdAt: number })
                        .createdAt
                    : now,
                updatedAt: now,
              };

              if (existingIndex >= 0) {
                drawings[existingIndex] = drawing;
              } else {
                drawings.push(drawing);
              }

              await saveDrawings(drawings);
              return { success: true, drawings };
            });
          }

          if (typedMessage.type === MessageType.DELETE_DRAWING) {
            const payload = typedMessage.payload as { id: string };

            return getDrawings().then(async (drawings: unknown[]) => {
              const filtered = (drawings as { id: string }[]).filter(
                (d) => d.id !== payload.id,
              );
              await saveDrawings(filtered);
              return { success: true, drawings: filtered };
            });
          }

          if (message.type === MessageType.GET_DRAWING_DATA) {
            return getActiveTab().then(async (tab: unknown) => {
              const tabObj = tab as { id?: number };
              if (!tabObj?.id) {
                return { error: "No active tab" };
              }

              try {
                const [result] = await browser.scripting.executeScript({
                  target: { tabId: tabObj.id },
                  func: () => {
                    const elements = localStorage.getItem("excalidraw");
                    const appState = localStorage.getItem("excalidraw-state");
                    let id = localStorage.getItem("drawing-id");
                    const title = localStorage.getItem("drawing-title");

                    if (!id) {
                      id = `drawing:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    }

                    let imageBase64: string | undefined;

                    try {
                      const canvas = document.querySelector(
                        'canvas.excalidraw__canvas',
                      ) as HTMLCanvasElement;

                      if (canvas) {
                        const tempCanvas = document.createElement("canvas");
                        tempCanvas.width = 80;
                        tempCanvas.height = 80;
                        const tempCtx = tempCanvas.getContext("2d");

                        if (tempCtx) {
                          const scale = Math.max(
                            80 / canvas.width,
                            80 / canvas.height,
                          );
                          const scaledWidth = canvas.width * scale;
                          const scaledHeight = canvas.height * scale;
                          const offsetX = (80 - scaledWidth) / 2;
                          const offsetY = (80 - scaledHeight) / 2;

                          tempCtx.fillStyle = "#ffffff";
                          tempCtx.fillRect(0, 0, 80, 80);
                          tempCtx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);
                          imageBase64 = tempCanvas.toDataURL("image/png", 0.5);
                        }
                      }
                    } catch (e) {
                      console.error("[Excalivault] Failed to capture canvas:", e);
                    }

                    return {
                      id,
                      title,
                      elements: elements || "[]",
                      appState: appState || "{}",
                      versionFiles: localStorage.getItem("version-files") || "",
                      versionDataState:
                        localStorage.getItem("version-dataState") || "",
                      imageBase64,
                    };
                  },
                });
                return result.result;
              } catch (error) {
                captureException(error as Error);
                return {
                  error:
                    "Failed to get drawing data. Are you on excalidraw.com?",
                };
              }
            });
          }

          if (typedMessage.type === MessageType.OPEN_DRAWING) {
            const payload = typedMessage.payload as {
              id: string;
              name: string;
              elements: string;
              appState: string;
              versionFiles: string;
              versionDataState: string;
            };

            return browser.storage.local
              .set({
                [DRAWING_TO_INJECT_KEY]: payload,
              })
              .then(async () => {
                await browser.tabs.create({
                  url: "https://excalidraw.com/",
                });
                return { success: true };
              });
          }

          return Promise.resolve(null);
        } catch (error) {
          captureException(error as Error);
          return Promise.resolve({
            error: "Unexpected error in background script",
          });
        }
      },
    );
  },
});
