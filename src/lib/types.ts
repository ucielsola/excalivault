export interface ExcalidrawData {
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
}

export interface DrawingData {
  id: string;
  name: string;
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
  imageBase64?: string;
  viewBackgroundColor?: string;
  createdAt: number;
  updatedAt: number;
}

export enum MessageType {
  GET_DRAWING_DATA = "GET_DRAWING_DATA",
  SAVE_DRAWING = "SAVE_DRAWING",
  GET_ALL_DRAWINGS = "GET_ALL_DRAWINGS",
  DELETE_DRAWING = "DELETE_DRAWING",
}

export type GetDrawingDataMessage = {
  type: MessageType.GET_DRAWING_DATA;
};

export type SaveDrawingMessage = {
  type: MessageType.SAVE_DRAWING;
  payload: {
    id: string;
    name: string;
    elements: string;
    appState: string;
    versionFiles: string;
    versionDataState: string;
    imageBase64?: string;
    viewBackgroundColor?: string;
  };
};

export type GetAllDrawingsMessage = {
  type: MessageType.GET_ALL_DRAWINGS;
};

export type DeleteDrawingMessage = {
  type: MessageType.DELETE_DRAWING;
  payload: {
    id: string;
  };
};
