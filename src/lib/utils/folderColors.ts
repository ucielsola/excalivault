import type { FolderData } from "$lib/types";

export const FOLDER_COLORS = {
  amber: "oklch(0.78 0.16 65)",
  mint: "oklch(0.65 0.18 170)",
  rose: "oklch(0.70 0.16 330)",
  sky: "oklch(0.65 0.17 250)",
  leaf: "oklch(0.72 0.16 140)",
  coral: "oklch(0.68 0.15 30)",
  indigo: "oklch(0.74 0.14 280)",
} as const;

export type FolderColorName = keyof typeof FOLDER_COLORS;
export type FolderColorValue = (typeof FOLDER_COLORS)[FolderColorName];

export const COLOR_VALUES = Object.values(FOLDER_COLORS) as FolderColorValue[];

export function getFolderColorStyle(color: string) {
  return {
    color,
    backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
  };
}

export function getFolderColorName(color: string): FolderColorName | "default" {
  const entry = Object.entries(FOLDER_COLORS).find(([_, val]) => val === color);
  return entry ? (entry[0] as FolderColorName) : "default";
}

export function getFolderBadgeClass(color: string): string {
  const name = getFolderColorName(color);
  return name === "default" ? "" : `folder-color-${name}`;
}

export function assignNextFolderColor(
  existingFolders: FolderData[],
): FolderColorValue {
  const usedColors = new Set(existingFolders.map((f) => f.color));

  for (const colorValue of COLOR_VALUES) {
    if (!usedColors.has(colorValue)) {
      return colorValue;
    }
  }
  return COLOR_VALUES[0];
}

export const FOLDER_COLOR_CLASSES = Object.entries(FOLDER_COLORS)
  .map(
    ([name, value]) => `
    .folder-color-${name} {
      color: ${value};
      background-color: color-mix(in oklch, ${value} 12%, transparent);
    }
  `,
  )
  .join("\n");
