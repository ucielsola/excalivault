type DialogType = "overwrite" | "delete" | "delete_all";

type DialogConfig = {
  type: DialogType;
  data?: {
    drawingName?: string;
    itemName?: string;
    itemType?: "drawing" | "folder";
    subfolderCount?: number;
    drawingCount?: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
};

class DialogStore {
  #activeDialog = $state<DialogConfig | null>(null);

  open(
    type: DialogType,
    onConfirm: () => void,
    onCancel: () => void,
    data?: DialogConfig["data"],
  ): void {
    this.#activeDialog = { type, data, onConfirm, onCancel };
  }

  close(): void {
    this.#activeDialog = null;
  }

  get isOpen(): boolean {
    return this.#activeDialog !== null;
  }

  get activeDialog(): DialogConfig | null {
    return this.#activeDialog;
  }
}

export const dialogStore = new DialogStore();
