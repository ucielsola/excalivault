import { computeContentHash } from "$lib/utils/contentHash";
import { defineBackground } from "#imports";
import browser from "webextension-polyfill";

import { captureException, initSentry } from "$lib/services/sentry";
import { MessageType, type DrawingMessage, type GetDrawingDataResponse, type GetThumbnailResponse } from "$lib/types";

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
    migrateContentHashes();

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

    async function migrateContentHashes(): Promise<void> {
      const drawings = await getDrawings() as Array<Record<string, unknown>>;
      if (drawings.length === 0) return;

      const needsMigration = drawings.some((d) => !("contentHash" in d) || !d.contentHash);
      if (!needsMigration) return;

      const migratedDrawings = await Promise.all(
        drawings.map(async (d) => ({
          ...d,
          contentHash: await computeContentHash(d.elements as string),
        })),
      );
      await saveDrawings(migratedDrawings);
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
              async ([drawings, folders]) => {
                const typedFolders = folders as Array<Record<string, unknown>>;
                const ROOT_FOLDER_ID = "root-folder-00000000-0000-0000-0000-000000000000";
                const existingRoot = typedFolders.find((f) => f.id === ROOT_FOLDER_ID);
                
                if (!existingRoot) {
                  const now = Date.now();
                  const rootFolder = {
                    id: ROOT_FOLDER_ID,
                    name: "My Drawings",
                    parentId: null,
                    color: "#10b981",
                    icon: undefined,
                    createdAt: now,
                    updatedAt: now,
                    isRoot: true,
                  };
                  typedFolders.push(rootFolder);
                  await saveFolders(typedFolders);
                }
                return { folders: typedFolders, drawings };
              },
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
              contentHash?: string;
            };

            return Promise.all([getDrawings(), getFolders()]).then(
              async ([drawings, folders]: [unknown[], unknown[]]) => {
                const typedFolders = folders as Array<Record<string, unknown>>;
                const ROOT_FOLDER_ID = "root-folder-00000000-0000-0000-0000-000000000000";
                const existingIndex = (drawings as { id: string }[]).findIndex(
                  (d) => d.id === payload.id,
                );
                const now = Date.now();

                let folderId = payload.folderId ?? null;
                
                if (existingIndex < 0 && folderId === null) {
                  if (typedFolders.some((f) => f.isRoot)) {
                    const rootFolder = typedFolders.find(
                      (f) => f.id === ROOT_FOLDER_ID,
                    );
                    if (rootFolder) {
                      folderId = rootFolder.id as string;
                    }
                  }
                }

                const drawing = {
                  id: payload.id,
                  folderId,
                  name: payload.name,
                  elements: payload.elements,
                  appState: payload.appState,
                  versionFiles: payload.versionFiles,
                  versionDataState: payload.versionDataState,
                  imageBase64: payload.imageBase64,
                  viewBackgroundColor: payload.viewBackgroundColor,
                  contentHash: payload.contentHash,
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
                await browser.storage.local.set({
                  "excalivault_unsaved_changes": false,
                });
                return { success: true, drawings };
              },
            );
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
              icon?: string;
            };

            return getFolders().then(async (folders: unknown[]) => {
              const typedFolders = folders as Array<Record<string, unknown>>;
              const targetParentId = payload.parentId ?? null;

              if (targetParentId === null && typedFolders.some((f) => f.isRoot)) {
                return {
                  success: false,
                  folders: typedFolders,
                  error: "Cannot create top-level folders. Create folders inside the root folder instead.",
                };
              }

              const hasDuplicate = typedFolders.some(
                (f) => f.parentId === targetParentId && f.name === payload.name,
              );

              if (hasDuplicate) {
                return {
                  success: false,
                  folders: typedFolders,
                  error: "A folder with this name already exists at this level",
                };
              }

              const now = Date.now();
              const folder = {
                id: `folder:${now}-${Math.random().toString(36).substr(2, 9)}`,
                name: payload.name,
                parentId: targetParentId,
                color: payload.color,
                icon: payload.icon,
                createdAt: now,
                updatedAt: now,
              };
              typedFolders.push(folder);
              await saveFolders(typedFolders);
              return { success: true, folders: typedFolders };
            });
          }

          if (typedMessage.type === MessageType.UPDATE_FOLDER) {
            const payload = typedMessage.payload as {
              id: string;
              name: string;
              color?: string;
              icon?: string;
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
              if (payload.icon !== undefined) {
                updates.icon = payload.icon;
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
                const typedFolders = folders as { id: string; parentId: string | null; isRoot?: boolean }[];
                const typedDrawings = drawings as { folderId: string | null }[];

                const folderToDelete = typedFolders.find((f) => f.id === payload.id);
                if (folderToDelete?.isRoot) {
                  return {
                    success: false,
                    folders: typedFolders,
                    drawings: typedDrawings,
                    error: "Cannot delete the root folder",
                  };
                }

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

            return Promise.all([getDrawings(), getFolders()]).then(
              async ([drawings, folders]: [unknown[], unknown[]]) => {
                const typedFolders = folders as Array<Record<string, unknown>>;
                const ROOT_FOLDER_ID = "root-folder-00000000-0000-0000-0000-000000000000";
                
                if (payload.folderId === null && typedFolders.some((f) => f.isRoot)) {
                  const rootFolder = typedFolders.find((f) => f.id === ROOT_FOLDER_ID);
                  if (rootFolder) {
                    payload.folderId = rootFolder.id as string;
                  }
                }

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
              },
            );
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
                const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
                if (tab?.id) {
                  await browser.tabs.update(tab.id, {
                    url: "https://excalidraw.com/",
                  });
                }
                return { success: true };
              });
          }

          if (typedMessage.type === MessageType.DRAWING_CHANGED) {
            return Promise.all([
              browser.storage.local.get("drawing-id"),
              getDrawings(),
              browser.tabs.query({ active: true, currentWindow: true }),
            ]).then(async (results) => {
              const [{ "drawing-id": activeDrawingId }, drawings, tabs] = results as [
                { "drawing-id"?: string },
                unknown[],
                { id?: number }[],
              ];
              const currentTab = tabs[0];

              if (!currentTab?.id) {
                return { success: false, error: "No active tab" };
              }

              let hasUnsaved = true;
              const canvasData = await browser.tabs.sendMessage(currentTab.id, {
                type: MessageType.GET_DRAWING_DATA,
              }).then((response) => response as GetDrawingDataResponse | null).catch(() => null);

              if (canvasData?.elements) {
                // Detect active drawing by content hash
                const currentHash = await computeContentHash(canvasData.elements);
                const matchingDrawing = (drawings as { id: string; contentHash?: string }[]).find(
                  (d) => d.contentHash === currentHash,
                );

                if (matchingDrawing) {
                  await browser.storage.local.set({ "drawing-id": matchingDrawing.id });
                }

                // Compare with stored drawing
                const storedDrawing = (drawings as { id: string; elements: string }[]).find(
                  (d) => d.id === activeDrawingId,
                );
                if (storedDrawing) {
                  hasUnsaved = canvasData.elements !== storedDrawing.elements;
                }
              }

              await browser.storage.local.set({
                "excalivault_unsaved_changes": hasUnsaved,
              });

              return { success: true };
            }).catch((_error) => {
              // Fallback: set to true if comparison fails
              return browser.storage.local
                .set({
                  "excalivault_unsaved_changes": true,
                })
                .then(() => ({ success: true }));
            });
          }

          if (typedMessage.type === MessageType.GET_THUMBNAIL) {
            return getActiveTab().then(async (tab: unknown) => {
              const tabObj = tab as { id?: number };
              if (!tabObj?.id) {
                return { thumbnailBase64: null };
              }

              try {
                const [result] = await browser.scripting.executeScript({
                  target: { tabId: tabObj.id },
                  func: () => {
                    const canvas = document.querySelector(
                      "canvas.excalidraw__canvas",
                    ) as HTMLCanvasElement;

                    if (!canvas) {
                      return { thumbnailBase64: null };
                    }

                    const maxwidth = 300;
                    const aspectRatio = 16 / 9;
                    const width = Math.min(maxwidth, canvas.width);
                    const height = Math.round(width / aspectRatio);

                    const tempCanvas = document.createElement("canvas");
                    tempCanvas.width = width;
                    tempCanvas.height = height;
                    const tempCtx = tempCanvas.getContext("2d");

                    if (!tempCtx) {
                      return { thumbnailBase64: null };
                    }

                    const scale = Math.min(
                      width / canvas.width,
                      height / canvas.height,
                    );
                    const scaledWidth = canvas.width * scale;
                    const scaledHeight = canvas.height * scale;
                    const offsetX = (width - scaledWidth) / 2;
                    const offsetY = (height - scaledHeight) / 2;

                    tempCtx.fillStyle = "#ffffff";
                    tempCtx.fillRect(0, 0, width, height);
                    tempCtx.drawImage(
                      canvas,
                      offsetX,
                      offsetY,
                      scaledWidth,
                      scaledHeight,
                    );

                    return {
                      thumbnailBase64: tempCanvas.toDataURL("image/jpeg", 0.7),
                    };
                  },
                });
                return result.result as GetThumbnailResponse;
              } catch (error) {
                console.error("[Excalivault] Failed to capture thumbnail:", error);
                return { thumbnailBase64: null };
              }
            }).catch(() => {
              return { thumbnailBase64: null };
            });
          }

          if (typedMessage.type === MessageType.DELETE_ALL_DATA) {
            return browser.storage.local.remove([
              "excalivault_drawings",
              "excalivault_folders",
              "drawing-id",
              "excalivault_unsaved_changes",
            ]).then(() => ({ success: true }));
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
