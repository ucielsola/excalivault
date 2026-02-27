export interface ExcalidrawData {
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
}

export interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface DrawingData {
  id: string;
  folderId: string | null;
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

export type SortBy = "name" | "createdAt";
export type SortOrder = "asc" | "desc";

export enum MessageType {
  GET_DRAWING_DATA = "GET_DRAWING_DATA",
  SAVE_DRAWING = "SAVE_DRAWING",
  GET_ALL_DRAWINGS = "GET_ALL_DRAWINGS",
  DELETE_DRAWING = "DELETE_DRAWING",
  OPEN_DRAWING = "OPEN_DRAWING",
  INJECT_DRAWING_DATA = "INJECT_DRAWING_DATA",
  GET_WORKSPACE = "GET_WORKSPACE",
  CREATE_FOLDER = "CREATE_FOLDER",
  UPDATE_FOLDER = "UPDATE_FOLDER",
  DELETE_FOLDER = "DELETE_FOLDER",
  MOVE_DRAWING = "MOVE_DRAWING",
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
    folderId?: string | null;
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

export type OpenDrawingMessage = {
  type: MessageType.OPEN_DRAWING;
  payload: {
    id: string;
    name: string;
    elements: string;
    appState: string;
    versionFiles: string;
    versionDataState: string;
  };
};

export type InjectDrawingDataMessage = {
  type: MessageType.INJECT_DRAWING_DATA;
  payload: {
    elements: string;
    appState: string;
    versionFiles: string;
    versionDataState: string;
  };
};

export type GetAllDrawingsResponse = {
  drawings: DrawingData[];
};

export type GetDrawingDataResponse = {
  id: string | null;
  title: string | null;
  elements: string;
  appState: string;
  imageBase64?: string;
};

export type UpdateDrawingData = {
  id: string;
  name: string;
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
  imageBase64?: string;
};

export type SaveDrawingResponse = {
  success: boolean;
  drawings: DrawingData[];
};

export type DeleteDrawingResponse = {
  drawings: DrawingData[];
};

export type SaveDrawingData = {
  id: string;
  name: string;
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
  imageBase64?: string;
  folderId?: string | null;
  viewBackgroundColor?: string;
};

export type GetWorkspaceMessage = {
  type: MessageType.GET_WORKSPACE;
};

export type CreateFolderMessage = {
  type: MessageType.CREATE_FOLDER;
  payload: {
    name: string;
    parentId?: string | null;
    color: string;
  };
};

export type UpdateFolderMessage = {
  type: MessageType.UPDATE_FOLDER;
  payload: {
    id: string;
    name: string;
    color?: string;
  };
};

export type DeleteFolderMessage = {
  type: MessageType.DELETE_FOLDER;
  payload: {
    id: string;
  };
};

export type MoveDrawingMessage = {
  type: MessageType.MOVE_DRAWING;
  payload: {
    drawingId: string;
    folderId: string | null;
  };
};

export type GetWorkspaceResponse = {
  folders: FolderData[];
  drawings: DrawingData[];
};

export type CreateFolderResponse = {
  success: boolean;
  folders: FolderData[];
};

export type UpdateFolderResponse = {
  success: boolean;
  folders: FolderData[];
};

export type DeleteFolderResponse = {
  success: boolean;
  folders: FolderData[];
  drawings: DrawingData[];
};

export type MoveDrawingResponse = {
  success: boolean;
  drawings: DrawingData[];
};

export type DrawingMessage =
  | GetDrawingDataMessage
  | SaveDrawingMessage
  | GetAllDrawingsMessage
  | DeleteDrawingMessage
  | OpenDrawingMessage
  | InjectDrawingDataMessage
  | GetWorkspaceMessage
  | CreateFolderMessage
  | UpdateFolderMessage
  | DeleteFolderMessage
  | MoveDrawingMessage;
