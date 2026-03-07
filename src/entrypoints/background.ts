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
    const FOLDERS_STORAGE_KEY = "excalivault_folders";
    const DRAWING_TO_INJECT_KEY = "excalivault_drawing_to_inject";
    const TARGET_URL = "https://excalidraw.com";

    migrateDrawings();
    migrateFolders();

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

    async function getFolders(): Promise<unknown[]> {
      const result = (await browser.storage.local.get(
        FOLDERS_STORAGE_KEY,
      )) as Record<string, unknown[]>;
      return result[FOLDERS_STORAGE_KEY] || [];
    }

    async function saveFolders(folders: unknown[]): Promise<void> {
      await browser.storage.local.set({ [FOLDERS_STORAGE_KEY]: folders });
    }

    async function migrateDrawings(): Promise<void> {
      const drawings = await getDrawings();
      const hasFolderId =
        drawings.length > 0 && "folderId" in (drawings[0] as object);
      if (hasFolderId) return;

      const migratedDrawings = (drawings as Array<Record<string, unknown>>).map(
        (d) => ({
          ...d,
          folderId: null,
        }),
      );
      await saveDrawings(migratedDrawings);
      await saveFolders([]);
    }

    async function migrateFolders(): Promise<void> {
      const folders = await getFolders() as Array<Record<string, unknown>>;
      if (folders.length === 0) return;

      const needsMigration = folders.some((f) => !("color" in f));
      if (!needsMigration) return;

      const migratedFolders = folders.map(
        (f) => ({
          ...f,
          color: ("color" in f ? f.color : undefined),
        }),
      );
      await saveFolders(migratedFolders);
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

          if (typedMessage.type === MessageType.GET_WORKSPACE) {
            return Promise.all([getDrawings(), getFolders()]).then(
              ([drawings, folders]) => ({ folders, drawings }),
            );
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
              folderId?: string | null;
            };

            return getDrawings().then(async (drawings: unknown[]) => {
              const existingIndex = (drawings as { id: string }[]).findIndex(
                (d) => d.id === payload.id,
              );
              const now = Date.now();

              const drawing = {
                id: payload.id,
                folderId: payload.folderId ?? null,
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

          if (typedMessage.type === MessageType.CREATE_FOLDER) {
            const payload = typedMessage.payload as {
              name: string;
              parentId?: string | null;
              color?: string;
            };

            return getFolders().then(async (folders: unknown[]) => {
              const now = Date.now();
              const folder = {
                id: `folder:${now}-${Math.random().toString(36).substr(2, 9)}`,
                name: payload.name,
                parentId: payload.parentId ?? null,
                color: payload.color,
                createdAt: now,
                updatedAt: now,
              };
              folders.push(folder);
              await saveFolders(folders);
              return { success: true, folders };
            });
          }

          if (typedMessage.type === MessageType.UPDATE_FOLDER) {
            const payload = typedMessage.payload as {
              id: string;
              name: string;
              color?: string;
            };

            return getFolders().then(async (folders: unknown[]) => {
              const index = (folders as { id: string }[]).findIndex(
                (f) => f.id === payload.id,
              );
              if (index < 0) {
                return { success: false, folders };
              }
              const updates: Record<string, unknown> = {
                name: payload.name,
                updatedAt: Date.now(),
              };
              if (payload.color !== undefined) {
                updates.color = payload.color;
              }
              (folders as Array<Record<string, unknown>>)[index] = {
                ...(folders[index] as object),
                ...updates,
              };
              await saveFolders(folders);
              return { success: true, folders };
            });
          }

          if (typedMessage.type === MessageType.DELETE_FOLDER) {
            const payload = typedMessage.payload as { id: string };

            return Promise.all([getFolders(), getDrawings()]).then(
              async ([folders, drawings]: [unknown[], unknown[]]) => {
                const typedFolders = folders as { id: string; parentId: string | null }[];
                const typedDrawings = drawings as { folderId: string | null }[];

                function getAllDescendantFolderIds(folderId: string): string[] {
                  const ids = [folderId];
                  const children = typedFolders.filter((f) => f.parentId === folderId);
                  for (const child of children) {
                    ids.push(...getAllDescendantFolderIds(child.id));
                  }
                  return ids;
                }

                const descendantFolderIds = getAllDescendantFolderIds(payload.id);
                const filteredFolders = typedFolders.filter(
                  (f) => !descendantFolderIds.includes(f.id),
                );

                const filteredDrawings = typedDrawings.filter(
                  (d) => d.folderId === null || !descendantFolderIds.includes(d.folderId),
                );

                await saveFolders(filteredFolders);
                await saveDrawings(filteredDrawings);
                return {
                  success: true,
                  folders: filteredFolders,
                  drawings: filteredDrawings,
                  deletedSubfolderCount: descendantFolderIds.length - 1,
                  deletedDrawingCount: typedDrawings.length - filteredDrawings.length,
                };
              },
            );
          }

          if (typedMessage.type === MessageType.MOVE_DRAWING) {
            const payload = typedMessage.payload as {
              drawingId: string;
              folderId: string | null;
            };

            return getDrawings().then(async (drawings: unknown[]) => {
              const index = (drawings as { id: string }[]).findIndex(
                (d) => d.id === payload.drawingId,
              );
              if (index < 0) {
                return { success: false, drawings };
              }
              (drawings as Array<Record<string, unknown>>)[index] = {
                ...(drawings[index] as object),
                folderId: payload.folderId,
                updatedAt: Date.now(),
              };
              await saveDrawings(drawings);
              return { success: true, drawings };
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
                        "canvas.excalidraw__canvas",
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
                          tempCtx.drawImage(
                            canvas,
                            offsetX,
                            offsetY,
                            scaledWidth,
                            scaledHeight,
                          );
                          imageBase64 = tempCanvas.toDataURL("image/png", 0.5);
                        }
                      }
                    } catch (e) {
                      console.error(
                        "[Excalivault] Failed to capture canvas:",
                        e,
                      );
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
