import { writable } from "svelte/store";
import { MessageType, type DrawingData } from "$lib/types";
import browser from 'webextension-polyfill';

interface MessageResponse {
  drawings?: DrawingData[];
}

export const drawings = writable<DrawingData[]>([]);
export const currentDrawing = writable<DrawingData | null>(null);
export const isLoading = writable(false);
export const error = writable<string | null>(null);

export async function loadDrawings(): Promise<void> {
  isLoading.set(true);
  error.set(null);

  try {
    const response = await browser.runtime.sendMessage({
      type: MessageType.GET_ALL_DRAWINGS,
    }) as MessageResponse | undefined;
    if (response?.drawings) {
      drawings.set(response.drawings);
    }
  } catch (e) {
    error.set("Failed to load drawings");
    console.error(e);
  } finally {
    isLoading.set(false);
  }
}

export async function getCurrentDrawingData(): Promise<{
  id: string | null;
  title: string | null;
  elements: string;
  appState: string;
} | null> {
  try {
    const response = await browser.runtime.sendMessage({
      type: MessageType.GET_DRAWING_DATA,
    }) as { id: string | null; title: string | null; elements: string; appState: string } | undefined;
    return response || null;
  } catch (e) {
    error.set("Failed to get drawing data. Are you on excalidraw.com?");
    console.error(e);
    return null;
  }
}

export async function saveDrawing(data: {
  id: string;
  name: string;
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
}): Promise<void> {
  isLoading.set(true);
  error.set(null);

  try {
    const response = await browser.runtime.sendMessage({
      type: MessageType.SAVE_DRAWING,
      payload: data,
    }) as MessageResponse | undefined;

    if (response?.drawings) {
      drawings.set(response.drawings);
    }
  } catch (e) {
    error.set("Failed to save drawing");
    console.error(e);
  } finally {
    isLoading.set(false);
  }
}

export async function deleteDrawing(id: string): Promise<void> {
  isLoading.set(true);
  error.set(null);

  try {
    const response = await browser.runtime.sendMessage({
      type: MessageType.DELETE_DRAWING,
      payload: { id },
    }) as MessageResponse | undefined;

    if (response?.drawings) {
      drawings.set(response.drawings);
    }
  } catch (e) {
    error.set("Failed to delete drawing");
    console.error(e);
  } finally {
    isLoading.set(false);
  }
}
