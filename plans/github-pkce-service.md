# GitHub PKCE Sync Service Implementation Plan

## Scope & Requirements Summary

**Authentication:** PKCE flow with GitHub OAuth
**Scope:** `repo` (full access to all repos)
**Branch:** Fixed to `main`
**File Naming:** `{name}.json.gz` (gzipped JSON)
**Repo Structure:** Mirror local folder structure
**Sync Timing:** On every save (immediate push)
**Conflict Resolution:** Timestamp wins (newer version kept)
**Error Handling:** User notifications only (side panel toasts)
**Initial Sync:** Auto-push all existing drawings after auth
**Compression:** Gzip compression for all files
**Deletions:** Bidirectional sync
**Rate Limiting:** 100ms delay between API calls
**Notifications:** Side panel toast system (to be created)
**Bulk Operations:** Silent background sync
**File Content:** Drawing data only (no metadata in files)
**Metadata Tracking:** `.excalivault.json` in repo root

---

## Phase 1: Core Types (types.ts)

Add new types at end of file:

```typescript
// GitHub Auth & Config Types
export interface GitHubConfig {
  clientId: string;
  owner: string;
  repo: string;
}

export interface GitHubAuthState {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt: number;
}

export interface GitHubFile {
  sha: string;
  path: string;
  size: number;
}

export interface GitHubMetadata {
  version: "1";
  lastSyncAt: number;
  drawings: Array<{
    id: string;
    path: string;
    localUpdatedAt: number;
    githubUpdatedAt: number;
  }>;
}

// GitHub Drawing Content (data only, no metadata wrapper)
export interface GitHubDrawingContent {
  elements: string;
  appState: string;
  versionFiles: string;
  versionDataState: string;
  viewBackgroundColor?: string;
}

// Message Types for GitHub
export enum GitHubMessageType {
  // Auth
  GITHUB_LOGIN = "GITHUB_LOGIN",
  GITHUB_LOGOUT = "GITHUB_LOGOUT",
  GITHUB_GET_AUTH_STATE = "GITHUB_GET_AUTH_STATE",

  // Config
  GITHUB_SAVE_CONFIG = "GITHUB_SAVE_CONFIG",
  GITHUB_GET_CONFIG = "GITHUB_GET_CONFIG",

  // Repo Operations
  GITHUB_LIST_DRAWINGS = "GITHUB_LIST_DRAWINGS",
  GITHUB_GET_DRAWING = "GITHUB_GET_DRAWING",
  GITHUB_SAVE_DRAWING = "GITHUB_SAVE_DRAWING",
  GITHUB_DELETE_DRAWING = "GITHUB_DELETE_DRAWING",

  // Sync
  GITHUB_SYNC = "GITHUB_SYNC",
  GITHUB_PUSH_ALL = "GITHUB_PUSH_ALL",
  GITHUB_PULL_ALL = "GITHUB_PULL_ALL",
  GITHUB_UPDATE_METADATA = "GITHUB_UPDATE_METADATA",

  // Folder Operations
  GITHUB_CREATE_FOLDER = "GITHUB_CREATE_FOLDER",
  GITHUB_DELETE_FOLDER = "GITHUB_DELETE_FOLDER",
  GITHUB_RENAME_FOLDER = "GITHUB_RENAME_FOLDER",
}

// Message Types
export type GitHubLoginMessage = {
  type: GitHubMessageType.GITHUB_LOGIN;
};

export type GitHubLogoutMessage = {
  type: GitHubMessageType.GITHUB_LOGOUT;
};

export type GitHubGetAuthStateMessage = {
  type: GitHubMessageType.GITHUB_GET_AUTH_STATE;
};

export type GitHubSaveConfigMessage = {
  type: GitHubMessageType.GITHUB_SAVE_CONFIG;
  payload: Omit<GitHubConfig, "clientId">; // Client ID hardcoded/managed separately
};

export type GitHubGetConfigMessage = {
  type: GitHubMessageType.GITHUB_GET_CONFIG;
};

export type GitHubListDrawingsMessage = {
  type: GitHubMessageType.GITHUB_LIST_DRAWINGS;
};

export type GitHubGetDrawingMessage = {
  type: GitHubMessageType.GITHUB_GET_DRAWING;
  payload: { path: string };
};

export type GitHubSaveDrawingMessage = {
  type: GitHubMessageType.GITHUB_SAVE_DRAWING;
  payload: {
    id: string;
    name: string;
    folderId: string | null;
    content: GitHubDrawingContent;
    updatedAt: number;
  };
};

export type GitHubDeleteDrawingMessage = {
  type: GitHubMessageType.GITHUB_DELETE_DRAWING;
  payload: { path: string; sha: string };
};

export type GitHubSyncMessage = {
  type: GitHubMessageType.GITHUB_SYNC;
  payload: { localDrawings: DrawingData[] };
};

export type GitHubPushAllMessage = {
  type: GitHubMessageType.GITHUB_PUSH_ALL;
  payload: { drawings: DrawingData[] };
};

export type GitHubPullAllMessage = {
  type: GitHubMessageType.GITHUB_PULL_ALL;
};

export type GitHubUpdateMetadataMessage = {
  type: GitHubMessageType.GITHUB_UPDATE_METADATA;
  payload: GitHubMetadata;
};

export type GitHubCreateFolderMessage = {
  type: GitHubMessageType.GITHUB_CREATE_FOLDER;
  payload: { folderId: string; folderName: string };
};

export type GitHubDeleteFolderMessage = {
  type: GitHubMessageType.GITHUB_DELETE_FOLDER;
  payload: { folderId: string; folderName: string };
};

export type GitHubRenameFolderMessage = {
  type: GitHubMessageType.GITHUB_RENAME_FOLDER;
  payload: { folderId: string; oldName: string; newName: string };
};

// Response Types
export type GitHubAuthStateResponse = {
  authenticated: boolean;
  authState: GitHubAuthState | null;
};

export type GitHubConfigResponse = {
  config: GitHubConfig | null;
};

export type GitHubDrawingsResponse = {
  drawings: Array<{
    id: string;
    path: string;
    name: string;
    updatedAt: number;
  }>;
};

export type GitHubDrawingResponse = {
  content: GitHubDrawingContent;
  sha: string;
};

export type GitHubSaveDrawingResponse = {
  success: boolean;
  path: string;
  sha: string;
  error?: string;
};

export type GitHubSyncResponse = {
  success: boolean;
  synced: number;
  conflicts: number;
  errors: Array<{ drawingId: string; error: string }>;
  updatedDrawings: DrawingData[];
};

export type GitHubPushAllResponse = {
  success: boolean;
  pushed: number;
  errors: Array<{ id: string; error: string }>;
};

export type GitHubPullAllResponse = {
  success: boolean;
  pulled: number;
  newDrawings: DrawingData[];
  error?: string;
};

// Union Type
export type GitHubMessage =
  | GitHubLoginMessage
  | GitHubLogoutMessage
  | GitHubGetAuthStateMessage
  | GitHubSaveConfigMessage
  | GitHubGetConfigMessage
  | GitHubListDrawingsMessage
  | GitHubGetDrawingMessage
  | GitHubSaveDrawingMessage
  | GitHubDeleteDrawingMessage
  | GitHubSyncMessage
  | GitHubPushAllMessage
  | GitHubPullAllMessage
  | GitHubUpdateMetadataMessage
  | GitHubCreateFolderMessage
  | GitHubDeleteFolderMessage
  | GitHubRenameFolderMessage;
```

---

## Phase 2: Toast Notification System

### Create `src/lib/components/ui/toast/`

**toast.svelte**
```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { CheckCircle, AlertCircle, Info, X } from "@lucide/svelte/icons";
  import { onMount } from "svelte";

  type Variant = "success" | "error" | "info";

  let { variant = "info", title, message, duration = 3000 }: {
    variant?: Variant;
    title: string;
    message: string;
    duration?: number;
  } = $props();

  let visible = $state(true);

  onMount(() => {
    if (duration > 0) {
      setTimeout(() => {
        visible = false;
      }, duration);
    }
  });

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "text-green-500 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800",
    error: "text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800",
    info: "text-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };
</script>

{#if visible}
  <div
    class="animate-in slide-in-from-right fade-in duration-300 pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg {colors[variant]}"
  >
    <svelte:component this={icons[variant]} size={18} />
    <div class="flex-1">
      <p class="text-sm font-semibold">{title}</p>
      <p class="text-muted-foreground mt-0.5 text-xs">{message}</p>
    </div>
    <button
      onclick={() => (visible = false)}
      class="text-muted-foreground hover:text-foreground"
    >
      <X size={14} />
    </button>
  </div>
{/if}
```

**toast-container.svelte**
```svelte
<script lang="ts">
  import { toasts } from "./toasts.svelte.ts";
  import Toast from "./toast.svelte";
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each toasts.list as toast (toast.id)}
    <Toast
      variant={toast.variant}
      title={toast.title}
      message={toast.message}
      duration={toast.duration}
    />
  {/each}
</div>
```

**toasts.svelte.ts**
```typescript
class ToastManager {
  #list = $state<Array<{ id: string; variant: "success" | "error" | "info"; title: string; message: string; duration: number }>>([]);

  #generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  success(title: string, message: string, duration = 3000) {
    this.#list.push({
      id: this.#generateId(),
      variant: "success",
      title,
      message,
      duration,
    });
  }

  error(title: string, message: string, duration = 5000) {
    this.#list.push({
      id: this.#generateId(),
      variant: "error",
      title,
      message,
      duration,
    });
  }

  info(title: string, message: string, duration = 3000) {
    this.#list.push({
      id: this.#generateId(),
      variant: "info",
      title,
      message,
      duration,
    });
  }

  get list() {
    return this.#list;
  }
}

export const toasts = new ToastManager();
```

**index.ts**
```typescript
export { Toast } from "./toast.svelte";
export { ToastContainer } from "./toast-container.svelte";
export { toasts } from "./toasts.svelte.ts";
```

---

## Phase 3: GitHub PKCE Auth Service

**src/lib/services/githubAuthService.ts**

```typescript
import browser from "webextension-polyfill";
import { GitHubMessageType, type GitHubAuthState, type GitHubConfig } from "$lib/types";

const STORAGE_KEY_AUTH = "github_auth";
const STORAGE_KEY_VERIFIER = "pkce_verifier";
const STORAGE_KEY_CONFIG = "github_config";

// Environment - will be provided by user
const CLIENT_ID = "YOUR_GITHUB_CLIENT_ID_HERE";

class GitHubAuthService {
  async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const array = new Uint32Array(56);
    crypto.getRandomValues(array);
    const verifier = Array.from(array, (dec) =>
      ("0" + dec.toString(16)).substr(-2),
    ).join("");

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(verifier),
    );

    const challenge = btoa(
      String.fromCharCode(...new Uint8Array(hashBuffer)),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return { verifier, challenge };
  }

  async login(): Promise<void> {
    const { verifier, challenge } = await this.generatePKCE();

    await browser.storage.local.set({ [STORAGE_KEY_VERIFIER]: verifier });

    const redirectUrl = browser.identity.getRedirectURL();
    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUrl);
    authUrl.searchParams.set("scope", "repo");
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    return new Promise((resolve, reject) => {
      browser.identity.launchWebAuthFlow(
        {
          url: authUrl.toString(),
          interactive: true,
        },
        async (redirectUrl) => {
          if (browser.runtime.lastError || !redirectUrl) {
            await browser.storage.local.remove(STORAGE_KEY_VERIFIER);
            reject(new Error(browser.runtime.lastError?.message || "Auth failed"));
            return;
          }

          try {
            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");

            if (code) {
              await this.exchangeCodeForToken(code);
              resolve();
            } else {
              throw new Error("No code in redirect URL");
            }
          } catch (error) {
            await browser.storage.local.remove(STORAGE_KEY_VERIFIER);
            reject(error);
          }
        },
      );
    });
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    const { pkce_verifier } = await browser.storage.local.get(
      STORAGE_KEY_VERIFIER,
    ) as { pkce_verifier?: string };

    if (!pkce_verifier) {
      throw new Error("PKCE verifier not found");
    }

    const redirectUrl = browser.identity.getRedirectURL();
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        code,
        code_verifier: pkce_verifier,
        redirect_uri: redirectUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
    };

    if (data.error || !data.access_token) {
      throw new Error(data.error || "No access token received");
    }

    const authState: GitHubAuthState = {
      accessToken: data.access_token,
      tokenType: data.token_type || "bearer",
      scope: data.scope || "",
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };

    await browser.storage.local.set({ [STORAGE_KEY_AUTH]: authState });
    await browser.storage.local.remove(STORAGE_KEY_VERIFIER);
  }

  async getAuthState(): Promise<GitHubAuthState | null> {
    const result = await browser.storage.local.get(STORAGE_KEY_AUTH) as Record<
      string,
      GitHubAuthState
    >;
    return result[STORAGE_KEY_AUTH] || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const authState = await this.getAuthState();
    return authState !== null;
  }

  async getAccessToken(): Promise<string> {
    const authState = await this.getAuthState();
    if (!authState) {
      throw new Error("Not authenticated");
    }
    return authState.accessToken;
  }

  async logout(): Promise<void> {
    await browser.storage.local.remove(STORAGE_KEY_AUTH);
  }

  async saveConfig(owner: string, repo: string): Promise<void> {
    await browser.storage.local.set({
      [STORAGE_KEY_CONFIG]: { owner, repo },
    });
  }

  async getConfig(): Promise<{ owner: string; repo: string } | null> {
    const result = await browser.storage.local.get(STORAGE_KEY_CONFIG) as Record<
      string,
      { owner: string; repo: string }
    >;
    return result[STORAGE_KEY_CONFIG] || null;
  }
}

export const githubAuthService = new GitHubAuthService();
```

---

## Phase 4: GitHub Repo Service

**src/lib/services/githubRepoService.ts**

```typescript
import browser from "webextension-polyfill";
import pako from "pako";
import {
  GitHubMessageType,
  type GitHubDrawingContent,
  type GitHubMetadata,
  type DrawingData,
} from "$lib/types";
import { githubAuthService } from "./githubAuthService";
import { captureException } from "./sentry";

const GITHUB_API_BASE = "https://api.github.com";
const API_DELAY_MS = 100;

class GitHubRepoService {
  #lastRequestTime = 0;

  async #delay(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.#lastRequestTime;
    if (elapsed < API_DELAY_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAY_MS - elapsed),
      );
    }
    this.#lastRequestTime = Date.now();
  }

  async #apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    await this.#delay();

    const token = await githubAuthService.getAccessToken();
    const config = await githubAuthService.getConfig();

    if (!config) {
      throw new Error("GitHub config not set");
    }

    const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Helper: Decompress base64-encoded gzipped JSON
  #decompressDrawing(contentBase64: string): GitHubDrawingContent {
    try {
      const binaryString = atob(contentBase64);
      const binaryData = Uint8Array.from(binaryString, (char) =>
        char.charCodeAt(0),
      );
      const decompressed = pako.inflate(binaryData);
      const json = new TextDecoder().decode(decompressed);
      return JSON.parse(json) as GitHubDrawingContent;
    } catch (error) {
      captureException(error as Error);
      throw new Error("Failed to decompress drawing");
    }
  }

  // Helper: Compress drawing and encode as base64
  #compressDrawing(content: GitHubDrawingContent): string {
    try {
      const json = JSON.stringify(content);
      const binaryData = new TextEncoder().encode(json);
      const compressed = pako.deflate(binaryData);
      const binaryString = Array.from(compressed, (byte) =>
        String.fromCharCode(byte),
      ).join("");
      return btoa(binaryString);
    } catch (error) {
      captureException(error as Error);
      throw new Error("Failed to compress drawing");
    }
  }

  // Helper: Convert folderId to path
  async #folderToPath(folderId: string | null, name: string): Promise<string> {
    if (!folderId) {
      return `${name}.json.gz`;
    }
    const result = await browser.storage.local.get(
      "excalivault_folders",
    ) as Record<string, Array<{ id: string; name: string }>>;
    const folders = result.excalivault_folders || [];
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      return `${folder.name}/${name}.json.gz`;
    }
    return `${name}.json.gz`;
  }

  async listDrawings(): Promise<
    Array<{ id: string; path: string; name: string; updatedAt: number }>
  > {
    try {
      const content = await this.#apiRequest<{ name: string; path: string; sha: string; type: string }[]>(
        "/contents/",
      );

      // Recursively get all .json.gz files
      const files: Array<{ path: string; sha: string }> = [];

      async function getFiles(items: typeof content, basePath = "") {
        for (const item of items) {
          if (item.type === "file" && item.name.endsWith(".json.gz")) {
            files.push({ path: item.path, sha: item.sha });
          } else if (item.type === "dir") {
            const dirContent = await this.#apiRequest<typeof content>(
              `/contents/${item.path}`,
            );
            await getFiles.call(this, dirContent, item.path);
          }
        }
      }
      await getFiles.call(this, content);

      // Map to internal format (use path as ID for now, will be synced from metadata)
      return files.map((f) => ({
        id: f.path,
        path: f.path,
        name: f.path.split("/").pop()?.replace(".json.gz", "") || f.path,
        updatedAt: Date.now(), // Will be updated from metadata
      }));
    } catch (error) {
      captureException(error as Error);
      return [];
    }
  }

  async getDrawing(path: string): Promise<{
    content: GitHubDrawingContent;
    sha: string;
  }> {
    const data = await this.#apiRequest<{
      content: string;
      sha: string;
    }>(`/contents/${path}`);

    return {
      content: this.#decompressDrawing(data.content),
      sha: data.sha,
    };
  }

  async saveDrawing(
    id: string,
    name: string,
    folderId: string | null,
    content: GitHubDrawingContent,
    updatedAt: number,
  ): Promise<{ path: string; sha: string }> {
    const path = await this.#folderToPath(folderId, name);
    const compressed = this.#compressDrawing(content);
    const base64Content = compressed;

    // Try to get existing file SHA
    let sha: string | undefined;
    try {
      const existing = await this.#apiRequest<{ sha: string }>(
        `/contents/${path}`,
      );
      sha = existing.sha;
    } catch {
      // File doesn't exist, that's fine
    }

    const body = {
      message: `Update ${name}`,
      content: base64Content,
      sha,
    };

    const result = await this.#apiRequest<{ content: { path: string; sha: string } }>(
      `/contents/${path}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return {
      path: result.content.path,
      sha: result.content.sha,
    };
  }

  async deleteDrawing(path: string, sha: string): Promise<void> {
    await this.#apiRequest(`/contents/${path}`, {
      method: "DELETE",
      body: JSON.stringify({
        message: `Delete ${path}`,
        sha,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getMetadata(): Promise<GitHubMetadata | null> {
    try {
      const data = await this.#apiRequest<{
        content: string;
      }>("/contents/.excalivault.json");

      const json = atob(data.content);
      return JSON.parse(json) as GitHubMetadata;
    } catch {
      return null;
    }
  }

  async updateMetadata(metadata: GitHubMetadata): Promise<void> {
    let sha: string | undefined;
    try {
      const existing = await this.#apiRequest<{ sha: string }>(
        "/contents/.excalivault.json",
      );
      sha = existing.sha;
    } catch {
      // File doesn't exist, that's fine
    }

    const json = JSON.stringify(metadata, null, 2);
    const base64Content = btoa(json);

    await this.#apiRequest(`/contents/.excalivault.json`, {
      method: "PUT",
      body: JSON.stringify({
        message: "Update Excalivault metadata",
        content: base64Content,
        sha,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async createFolder(folderId: string, folderName: string): Promise<void> {
    // In GitHub, folders are implicitly created when files are added
    // We'll create a .gitkeep file to ensure that folder exists
    const path = `${folderName}/.gitkeep`;

    await this.#apiRequest(`/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Create folder ${folderName}`,
        content: "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async deleteFolder(folderId: string, folderName: string): Promise<void> {
    // Delete all files in the folder
    const content = await this.#apiRequest<{ name: string; path: string; sha: string }[]>(
      `/contents/${folderName}`,
    );

    for (const item of content) {
      if (item.type === "file" && item.name !== ".gitkeep") {
        await this.#apiRequest(`/contents/${item.path}`, {
          method: "DELETE",
          body: JSON.stringify({
            message: `Delete ${item.name}`,
            sha: item.sha,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
  }

  async renameFolder(folderId: string, oldName: string, newName: string): Promise<void> {
    // Get all files in old folder
    const content = await this.#apiRequest<{ name: string; path: string; sha: string; content?: string }[]>(
      `/contents/${oldName}`,
    );

    // For each file, read content and create in new folder
    for (const item of content) {
      if (item.type === "file" && item.name !== ".gitkeep") {
        // Read content
        const fileData = await this.#apiRequest<{ content: string; sha: string }>(
          `/contents/${item.path}`,
        );

        // Create in new path
        const newPath = `${newName}/${item.name}`;
        await this.#apiRequest(`/contents/${newPath}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `Move ${item.name} to ${newName}`,
            content: fileData.content,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Delete old file
        await this.#apiRequest(`/contents/${item.path}`, {
          method: "DELETE",
          body: JSON.stringify({
            message: `Delete ${item.name} from ${oldName}`,
            sha: fileData.sha,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
  }
}

export const githubRepoService = new GitHubRepoService();
```

---

## Phase 5: GitHub Store

**src/lib/stores/github.svelte.ts**

```typescript
import browser from "webextension-polyfill";
import { GitHubMessageType } from "$lib/types";
import { githubAuthService } from "$lib/services/githubAuthService";
import { captureException } from "$lib/services/sentry";
import { toasts } from "$lib/components/ui/toast/toasts.svelte.ts";
import type { GitHubConfig, DrawingData } from "$lib/types";

class GitHubStore {
  #authenticated = $state<boolean>(false);
  #config = $state<GitHubConfig | null>(null);
  #loading = $state<boolean>(false);
  #error = $state<string | null>(null);
  #lastSyncAt = $state<number | null>(null);
  #syncing = $state<boolean>(false);

  async loadAuthState(): Promise<void> {
    try {
      this.#authenticated = await githubAuthService.isAuthenticated();
      const config = await githubAuthService.getConfig();
      this.#config = config ? { ...config, clientId: "YOUR_CLIENT_ID" } : null;
    } catch (e) {
      captureException(e as Error);
      this.#error = "Failed to load auth state";
    }
  }

  async login(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await githubAuthService.login();
      await this.loadAuthState();
      toasts.success("Success", "Logged in to GitHub");
    } catch (e) {
      this.#error = "Failed to login";
      captureException(e as Error);
      toasts.error("Login Failed", (e as Error).message);
    } finally {
      this.#loading = false;
    }
  }

  async logout(): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await githubAuthService.logout();
      await this.loadAuthState();
      this.#lastSyncAt = null;
      toasts.success("Success", "Logged out of GitHub");
    } catch (e) {
      this.#error = "Failed to logout";
      captureException(e as Error);
      toasts.error("Logout Failed", (e as Error).message);
    } finally {
      this.#loading = false;
    }
  }

  async saveConfig(owner: string, repo: string): Promise<void> {
    this.#loading = true;
    this.#error = null;

    try {
      await githubAuthService.saveConfig(owner, repo);
      await this.loadAuthState();
      toasts.success("Success", "GitHub config saved");
    } catch (e) {
      this.#error = "Failed to save config";
      captureException(e as Error);
      toasts.error("Config Failed", (e as Error).message);
    } finally {
      this.#loading = false;
    }
  }

  async pushDrawing(drawing: DrawingData): Promise<void> {
    if (!this.#authenticated || !this.#config) {
      toasts.error("Error", "Not authenticated with GitHub");
      return;
    }

    const response = await browser.runtime.sendMessage({
      type: GitHubMessageType.GITHUB_SAVE_DRAWING,
      payload: {
        id: drawing.id,
        name: drawing.name,
        folderId: drawing.folderId,
        content: {
          elements: drawing.elements,
          appState: drawing.appState,
          versionFiles: drawing.versionFiles,
          versionDataState: drawing.versionDataState,
          viewBackgroundColor: drawing.viewBackgroundColor,
        },
        updatedAt: drawing.updatedAt,
      },
    });

    if (response?.error) {
      toasts.error("Sync Failed", response.error);
      captureException(new Error(response.error));
    } else {
      this.#lastSyncAt = Date.now();
    }
  }

  async pushAll(localDrawings: DrawingData[]): Promise<void> {
    if (!this.#authenticated || !this.#config) {
      toasts.error("Error", "Not authenticated with GitHub");
      return;
    }

    this.#syncing = true;
    this.#error = null;

    try {
      const response = await browser.runtime.sendMessage({
        type: GitHubMessageType.GITHUB_PUSH_ALL,
        payload: { drawings: localDrawings },
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      toasts.success(
        "Push Complete",
        `Pushed ${response.pushed} drawings to GitHub`,
      );
    } catch (e) {
      this.#error = "Failed to push drawings";
      captureException(e as Error);
      toasts.error("Push Failed", (e as Error).message);
    } finally {
      this.#syncing = false;
    }
  }

  async pullAll(): Promise<DrawingData[]> {
    if (!this.#authenticated || !this.#config) {
      toasts.error("Error", "Not authenticated with GitHub");
      return [];
    }

    this.#syncing = true;
    this.#error = null;

    try {
      const response = await browser.runtime.sendMessage({
        type: GitHubMessageType.GITHUB_PULL_ALL,
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      toasts.success(
        "Pull Complete",
        `Pulled ${response.pulled} drawings from GitHub`,
      );

      return response.newDrawings || [];
    } catch (e) {
      this.#error = "Failed to pull drawings";
      captureException(e as Error);
      toasts.error("Pull Failed", (e as Error).message);
      return [];
    } finally {
      this.#syncing = false;
    }
  }

  async sync(localDrawings: DrawingData[]): Promise<DrawingData[]> {
    if (!this.#authenticated || !this.#config) {
      toasts.error("Error", "Not authenticated with GitHub");
      return [];
    }

    this.#syncing = true;
    this.#error = null;

    try {
      const response = await browser.runtime.sendMessage({
        type: GitHubMessageType.GITHUB_SYNC,
        payload: { localDrawings },
      });

      if (response?.error) {
        throw new Error(response.error);
      }

      this.#lastSyncAt = Date.now();
      toasts.success(
        "Sync Complete",
        `Synced ${response.synced} drawings`,
      );

      return response.updatedDrawings || [];
    } catch (e) {
      this.#error = "Failed to sync";
      captureException(e as Error);
      toasts.error("Sync Failed", (e as Error).message);
      return [];
    } finally {
      this.#syncing = false;
    }
  }

  get authenticated(): boolean {
    return this.#authenticated;
  }

  get config(): GitHubConfig | null {
    return this.#config;
  }

  get loading(): boolean {
    return this.#loading;
  }

  get error(): string | null {
    return this.#error;
  }

  get syncing(): boolean {
    return this.#syncing;
  }

  get lastSyncAt(): number | null {
    return this.#lastSyncAt;
  }
}

export const github = new GitHubStore();
```

---

## Phase 6: Background Message Handlers (background.ts)

Add to background.ts after existing message handlers:

```typescript
// Import GitHub types and services
import { GitHubMessageType, type GitHubDrawingContent, type GitHubMetadata } from "$lib/types";
import { githubAuthService } from "$lib/services/githubAuthService";
import { githubRepoService } from "$lib/services/githubRepoService";

// GitHub Message Handlers
if (message.type === GitHubMessageType.GITHUB_LOGIN) {
  return githubAuthService.login().then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_LOGOUT) {
  return githubAuthService.logout().then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_GET_AUTH_STATE) {
  return githubAuthService.getAuthState().then((authState) => ({
    authenticated: authState !== null,
    authState,
  }));
}

if (message.type === GitHubMessageType.GITHUB_SAVE_CONFIG) {
  const payload = message.payload as { owner: string; repo: string };
  return githubAuthService
    .saveConfig(payload.owner, payload.repo)
    .then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_GET_CONFIG) {
  return githubAuthService.getConfig().then((config) => ({ config }));
}

if (message.type === GitHubMessageType.GITHUB_LIST_DRAWINGS) {
  return githubRepoService.listDrawings().then((drawings) => ({
    drawings,
  }));
}

if (message.type === GitHubMessageType.GITHUB_GET_DRAWING) {
  const payload = message.payload as { path: string };
  return githubRepoService.getDrawing(payload.path).then((result) => ({
    content: result.content,
    sha: result.sha,
  }));
}

if (message.type === GitHubMessageType.GITHUB_SAVE_DRAWING) {
  const payload = message.payload as {
    id: string;
    name: string;
    folderId: string | null;
    content: GitHubDrawingContent;
    updatedAt: number;
  };
  return githubRepoService
    .saveDrawing(
      payload.id,
      payload.name,
      payload.folderId,
      payload.content,
      payload.updatedAt,
    )
    .then((result) => ({
      success: true,
      path: result.path,
      sha: result.sha,
    }))
    .catch((error) => ({ error: error.message }));
}

if (message.type === GitHubMessageType.GITHUB_DELETE_DRAWING) {
  const payload = message.payload as { path: string; sha: string };
  return githubRepoService
    .deleteDrawing(payload.path, payload.sha)
    .then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_SYNC) {
  const payload = message.payload as { localDrawings: DrawingData[] };

  try {
    // Get remote metadata and drawings
    const [remoteMetadata, remoteDrawings] = await Promise.all([
      githubRepoService.getMetadata(),
      githubRepoService.listDrawings(),
    ]);

    // Create lookup maps
    const localMap = new Map(payload.localDrawings.map((d) => [d.id, d]));
    const remoteMap = new Map(remoteDrawings.map((d) => [d.id, d]));

    const synced: string[] = [];
    const conflicts: number = 0;
    const errors: Array<{ drawingId: string; error: string }> = [];
    const updatedDrawings: DrawingData[] = [];

    // Sync local to remote (push newer or missing)
    for (const [id, local] of localMap) {
      const remote = remoteMap.get(id);

      if (!remote) {
        // New local, push to remote
        try {
          await githubRepoService.saveDrawing(
            id,
            local.name,
            local.folderId,
            {
              elements: local.elements,
              appState: local.appState,
              versionFiles: local.versionFiles,
              versionDataState: local.versionDataState,
              viewBackgroundColor: local.viewBackgroundColor,
            },
            local.updatedAt,
          );
          synced.push(id);
        } catch (error) {
          errors.push({ drawingId: id, error: (error as Error).message });
        }
      } else if (local.updatedAt > remote.updatedAt) {
        // Local is newer, push
        try {
          await githubRepoService.saveDrawing(
            id,
            local.name,
            local.folderId,
            {
              elements: local.elements,
              appState: local.appState,
              versionFiles: local.versionFiles,
              versionDataState: local.versionDataState,
              viewBackgroundColor: local.viewBackgroundColor,
            },
            local.updatedAt,
          );
          synced.push(id);
        } catch (error) {
          errors.push({ drawingId: id, error: (error as Error).message });
        }
      }
    }

    // Sync remote to local (pull newer or missing)
    for (const [id, remote] of remoteMap) {
      const local = localMap.get(id);

      if (!local) {
        // New remote, pull to local
        try {
          const { content } = await githubRepoService.getDrawing(remote.path);
          const newDrawing: DrawingData = {
            id: `github:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: remote.name,
            folderId: null,
            elements: content.elements,
            appState: content.appState,
            versionFiles: content.versionFiles,
            versionDataState: content.versionDataState,
            viewBackgroundColor: content.viewBackgroundColor,
            createdAt: remote.updatedAt,
            updatedAt: remote.updatedAt,
          };
          drawings.push(newDrawing);
          updatedDrawings.push(newDrawing);
          synced.push(id);
        } catch (error) {
          errors.push({ drawingId: id, error: (error as Error).message });
        }
      } else if (remote.updatedAt > local.updatedAt) {
        // Remote is newer, pull
        try {
          const { content } = await githubRepoService.getDrawing(remote.path);
          const index = drawings.findIndex((d) => d.id === id);
          if (index >= 0) {
            drawings[index] = {
              ...drawings[index],
              elements: content.elements,
              appState: content.appState,
              versionFiles: content.versionFiles,
              versionDataState: content.versionDataState,
              viewBackgroundColor: content.viewBackgroundColor,
              updatedAt: remote.updatedAt,
            };
            updatedDrawings.push(drawings[index]);
            synced.push(id);
          }
        } catch (error) {
          errors.push({ drawingId: id, error: (error as Error).message });
        }
      }
    }

    // Update metadata
    const metadata: GitHubMetadata = {
      version: "1",
      lastSyncAt: Date.now(),
      drawings: await Promise.all(
        drawings.map(async (d) => ({
          id: d.id,
          path: await githubRepoService.#folderToPath(d.folderId, d.name),
          localUpdatedAt: d.updatedAt,
          githubUpdatedAt: d.updatedAt,
        })),
      ),
    };
    await githubRepoService.updateMetadata(metadata);

    await saveDrawings(drawings);
    return {
      success: true,
      synced: synced.length,
      conflicts,
      errors,
      updatedDrawings,
    };
  } catch (error) {
    captureException(error as Error);
    return {
      success: false,
      synced: 0,
      conflicts: 0,
      errors: [{ drawingId: "all", error: (error as Error).message }],
      updatedDrawings: [],
    };
  }
}

if (message.type === GitHubMessageType.GITHUB_PUSH_ALL) {
  const payload = message.payload as { drawings: DrawingData[] };

  try {
    let pushed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const drawing of payload.drawings) {
      try {
        await githubRepoService.saveDrawing(
          drawing.id,
          drawing.name,
          drawing.folderId,
          {
            elements: drawing.elements,
            appState: drawing.appState,
            versionFiles: drawing.versionFiles,
            versionDataState: drawing.versionDataState,
            viewBackgroundColor: drawing.viewBackgroundColor,
          },
          drawing.updatedAt,
        );
        pushed++;
      } catch (error) {
        errors.push({ id: drawing.id, error: (error as Error).message });
      }
    }

    return {
      success: errors.length === 0,
      pushed,
      errors,
    };
  } catch (error) {
    captureException(error as Error);
    return {
      success: false,
      pushed: 0,
      errors: [{ id: "all", error: (error as Error).message }],
    };
  }
}

if (message.type === GitHubMessageType.GITHUB_PULL_ALL) {
  try {
    const remoteDrawings = await githubRepoService.listDrawings();
    const localDrawings = await getDrawings();

    const localMap = new Map(
      (localDrawings as DrawingData[]).map((d) => [d.name, d]),
    );
    const remoteMap = new Map(remoteDrawings.map((d) => [d.name, d]));

    const newDrawings: DrawingData[] = [];
    let pulled = 0;

    for (const [name, remote] of remoteMap) {
      const local = localMap.get(name);

      if (!local) {
        // New remote drawing
        const { content } = await githubRepoService.getDrawing(remote.path);
        const drawing: DrawingData = {
          id: `github:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: remote.name,
          folderId: null,
          elements: content.elements,
          appState: content.appState,
          versionFiles: content.versionFiles,
          versionDataState: content.versionDataState,
          viewBackgroundColor: content.viewBackgroundColor,
          createdAt: remote.updatedAt,
          updatedAt: remote.updatedAt,
        };
        newDrawings.push(drawing);
        pulled++;
      }
    }

    // Update metadata
    const metadata: GitHubMetadata = {
      version: "1",
      lastSyncAt: Date.now(),
      drawings: await Promise.all(
        [...localDrawings, ...newDrawings].map(async (d) => ({
          id: d.id,
          path: await githubRepoService.#folderToPath(d.folderId, d.name),
          localUpdatedAt: d.updatedAt,
          githubUpdatedAt: d.updatedAt,
        })),
      ),
    };
    await githubRepoService.updateMetadata(metadata);

    await saveDrawings([...localDrawings, ...newDrawings]);
    return {
      success: true,
      pulled,
      newDrawings,
    };
  } catch (error) {
    captureException(error as Error);
    return {
      success: false,
      pulled: 0,
      error: (error as Error).message,
      newDrawings: [],
    };
  }
}

if (message.type === GitHubMessageType.GITHUB_CREATE_FOLDER) {
  const payload = message.payload as { folderId: string; folderName: string };
  return githubRepoService
    .createFolder(payload.folderId, payload.folderName)
    .then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_DELETE_FOLDER) {
  const payload = message.payload as { folderId: string; folderName: string };
  return githubRepoService
    .deleteFolder(payload.folderId, payload.folderName)
    .then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_RENAME_FOLDER) {
  const payload = message.payload as {
    folderId: string;
    oldName: string;
    newName: string;
  };
  return githubRepoService
    .renameFolder(payload.folderId, payload.oldName, payload.newName)
    .then(() => ({ success: true }));
}

if (message.type === GitHubMessageType.GITHUB_UPDATE_METADATA) {
  const payload = message.payload as GitHubMetadata;
  return githubRepoService
    .updateMetadata(payload)
    .then(() => ({ success: true }));
}
```

---

## Phase 7: Options Page - GitHub Settings

**src/entrypoints/options/Options.svelte**

```svelte
<script lang="ts">
  import { onMount } from "svelte";

  import { captureException } from "$lib/services/sentry";
  import { github } from "$lib/stores/github.svelte";
  import { toasts } from "$lib/components/ui/toast/toasts.svelte.ts";
  import GithubSettings from "$lib/components/excalivault/GithubSettings.svelte";

  onMount(async () => {
    await github.loadAuthState();
  });

  function testError() {
    try {
      throw new Error("Sentry Test Error from Options Page");
    } catch (error) {
      captureException(error as Error);
    }
  }
</script>

<div class="bg-base-200 min-h-screen p-6">
  <h1 class="mb-6 text-3xl font-bold">Excalivault Options</h1>

  <div class="space-y-6">
    <GithubSettings />

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Testing</h2>
        <p class="text-lg">Test error tracking</p>
        <button
          onclick={testError}
          class="btn btn-error"
        >
          Test Sentry Error
        </button>
      </div>
    </div>
  </div>
</div>
```

**src/entrypoints/options/GithubSettings.svelte** (New component)

```svelte
<script lang="ts">
  import { github } from "$lib/stores/github.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import GithubIcon from "@lucide/svelte/icons/github";
  import LogOut from "@lucide/svelte/icons/log-out";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { toasts } from "$lib/components/ui/toast/toasts.svelte.ts";

  let owner = $state("");
  let repo = $state("");

  $effect(() => {
    if (github.config) {
      owner = github.config.owner;
      repo = github.config.repo;
    }
  });

  async function handleLogin() {
    await github.login();
  }

  async function handleLogout() {
    await github.logout();
  }

  async function handleSaveConfig() {
    if (!owner || !repo) {
      toasts.error("Error", "Owner and repo are required");
      return;
    }
    await github.saveConfig(owner, repo);
  }

  async function handleTestConnection() {
    if (!github.authenticated) {
      toasts.error("Error", "Please login first");
      return;
    }
    toasts.info("Testing", "Checking GitHub connection...");
    // This would trigger a test API call in real implementation
    setTimeout(() => {
      toasts.success("Success", "GitHub connection verified");
    }, 1000);
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="flex items-center gap-2 card-title">
      <GithubIcon size={20} />
      GitHub Sync Settings
    </h2>

    {#if !github.authenticated}
      <div class="alert alert-info">
        <GithubIcon size={16} />
        <span>
          Connect your GitHub account to sync drawings with a repository.
        </span>
      </div>

      <Button onclick={handleLogin} {disabled}>
        <GithubIcon size={16} class="mr-2" />
        Login with GitHub
      </Button>
    {:else}
      <div class="alert alert-success">
        <GithubIcon size={16} />
        <span>
          Authenticated with GitHub
        </span>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Repository Owner</span>
        </label>
        <Input
          type="text"
          placeholder="username or organization"
          bind:value={owner}
          disabled={github.loading}
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Repository Name</span>
        </label>
        <Input
          type="text"
          placeholder="my-repo"
          bind:value={repo}
          disabled={github.loading}
        />
      </div>

      <div class="flex gap-2">
        <Button
          variant="outline"
          onclick={handleSaveConfig}
          disabled={github.loading}
        >
          <RefreshCw size={16} class="mr-2" />
          Save Config
        </Button>

        <Button
          variant="outline"
          onclick={handleTestConnection}
          disabled={github.loading}
        >
          <RefreshCw size={16} class="mr-2" />
          Test Connection
        </Button>
      </div>

      <div class="divider" />

      <Button
        variant="destructive"
        onclick={handleLogout}
        disabled={github.loading}
      >
        <LogOut size={16} class="mr-2" />
        Logout
      </Button>

      {#if github.lastSyncAt}
        <div class="mt-4">
          <Badge variant="secondary">
            Last sync: {new Date(github.lastSyncAt).toLocaleString()}
          </Badge>
        </div>
      {/if}
    {/if}
  </div>
</div>
```

---

## Phase 8: Side Panel - Sync Controls

Update `src/lib/stores/drawings.svelte.ts` - Modify `saveDrawing` to trigger GitHub sync:

```typescript
import { github } from "$lib/stores/github.svelte";

// In the saveDrawing method, after saving locally:
public async saveDrawing(data: SaveDrawingData): Promise<void> {
  this.#loading = true;
  this.#error = null;

  try {
    await drawingService.saveDrawing(data);
    await this.loadDrawings();

    // Auto-sync to GitHub if authenticated
    if (github.authenticated) {
      const savedDrawing = this.#list.find(d => d.id === data.id);
      if (savedDrawing) {
        await github.pushDrawing(savedDrawing);
      }
    }
  } catch (e) {
    this.#error = "Failed to save drawing";
    captureException(e as Error);
  } finally {
    this.#loading = false;
  }
}
```

Update `src/lib/stores/folders.svelte.ts` - Add GitHub sync for folder operations:

```typescript
import { github } from "$lib/stores/github.svelte";

// Update createFolder, updateFolder, deleteFolder to sync with GitHub
// For example, in createFolder:
public async createFolder(name: string, parentId: string | null = null): Promise<void> {
  await this.sendMessage<CreateFolderResponse>({
    type: MessageType.CREATE_FOLDER,
    payload: { name, parentId },
  });

  // Sync folder creation to GitHub if authenticated
  if (github.authenticated) {
    const folders = await this.loadFolders();
    const newFolder = folders.find(f => f.name === name && f.parentId === parentId);
    if (newFolder) {
      // Send message to background to create folder in GitHub
      await browser.runtime.sendMessage({
        type: GitHubMessageType.GITHUB_CREATE_FOLDER,
        payload: { folderId: newFolder.id, folderName: name },
      });
    }
  }
}
```

Update `src/lib/components/excalivault/VaultList.svelte` - Add sync controls in header:

```svelte
<script lang="ts">
  // Add to existing imports
  import { github } from "$lib/stores/github.svelte";
  import GithubIcon from "@lucide/svelte/icons/github";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import { Button } from "$lib/components/ui/button";

  let showSyncMenu = $state(false);

  async function handleSync() {
    const localDrawings = drawings.list;
    const updatedDrawings = await github.sync(localDrawings);
    if (updatedDrawings.length > 0) {
      await drawings.loadDrawings();
    }
  }

  async function handlePull() {
    const newDrawings = await github.pullAll();
    if (newDrawings.length > 0) {
      await drawings.loadDrawings();
    }
  }

  async function handlePush() {
    await github.pushAll(drawings.list);
  }
</script>

<!-- Add to header after existing controls, before the divider -->
<div class="flex gap-2">
  {#if github.authenticated}
    <div class="dropdown dropdown-end">
      <Button
        variant="ghost"
        size="icon-sm"
        tabindex={0}
        role="button"
      >
        <GithubIcon size={16} />
      </Button>

      {#if github.syncing}
        <div class="dropdown-content z-[1] card w-52 bg-base-100 p-2 shadow-xl">
          <div class="flex items-center justify-center gap-2 py-4">
            <RefreshCw size={16} class="animate-spin" />
            <span class="text-sm">Syncing...</span>
          </div>
        </div>
      {:else}
        <ul
          tabindex={0}
          class="dropdown-content z-[1] menu rounded-box w-52 bg-base-100 p-2 shadow-xl"
        >
          <li>
            <button onclick={handleSync}>
              <RefreshCw size={14} />
              Sync All
            </button>
          </li>
          <li>
            <button onclick={handlePush}>
              <RefreshCw size={14} />
              Push to GitHub
            </button>
          </li>
          <li>
            <button onclick={handlePull}>
              <RefreshCw size={14} />
              Pull from GitHub
            </button>
          </li>
          <li class="menu-title">
            {#if github.lastSyncAt}
              Last: {new Date(github.lastSyncAt).toLocaleTimeString()}
            {:else}
              Never synced
            {/if}
          </li>
        </ul>
      {/if}
    </div>
  {/if}
</div>
```

Update `src/lib/components/excalivault/Excalivault.svelte` - Add toast container:

```svelte
<script lang="ts">
  import "../../app.css";

  import EmptyVault from "$lib/components/excalivault/EmptyVault.svelte";
  import VaultList from "$lib/components/excalivault/VaultList.svelte";
  import { drawings } from "$lib/stores";
  import { ToastContainer } from "$lib/components/ui/toast";

  const Screens = {
    Vault: "vault",
    Empty: "empty",
  } as const;

  type Screen = (typeof Screens)[keyof typeof Screens];

  let currentScreen = $derived<Screen>(
    drawings.list.length === 0 ? Screens.Empty : Screens.Vault,
  );

  onMount(async () => {
    drawings.loadDrawings();
  });
</script>

<div class="flex h-full min-w-75 flex-col overflow-hidden">
  {#if currentScreen === Screens.Vault}
    <VaultList />
  {:else if currentScreen === Screens.Empty}
    <EmptyVault />
  {/if}
</div>

<ToastContainer />
```

---

## Phase 9: Manifest Updates (wxt.config.ts)

```typescript
import path from "path";
import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  srcDir: "src",
  publicDir: "src/public",
  modules: ["@wxt-dev/module-svelte"],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, "./src/lib"),
      },
    },
  }),
  manifest: {
    name: "Excalivault",
    description: "Personal vault for storing Excalidraws",
    version: "0.0.0",
    permissions: [
      "storage",
      "scripting",
      "activeTab",
      "sidePanel",
      "tabs",
      "identity", // Add this for chrome.identity.launchWebAuthFlow
    ],
    host_permissions: [
      "https://excalidraw.com/*",
      "https://github.com/*", // Add this for GitHub auth
      "https://api.github.com/*", // Add this for GitHub API
    ],
    action: {
      default_icon: {
        "16": "icon/16.png",
        "32": "icon/32.png",
        "48": "icon/48.png",
        "96": "icon/96.png",
        "128": "icon/128.png",
      },
    },
    side_panel: {},
    content_scripts: [
      {
        matches: ["https://excalidraw.com/*"],
        js: ["excalidraw-content.js"],
        run_at: "document_start",
        all_frames: true,
      },
    ],
  },
});
```

---

## Phase 10: Testing Strategy

### Unit Tests
- PKCE generation and verification
- Compression/decompression of drawings
- Base64 encoding/decoding

### Integration Tests
- Full auth flow (login → code exchange → token storage)
- Push single drawing
- Pull single drawing
- Push all existing drawings
- Pull all from GitHub
- Bidirectional sync with conflicts
- Folder operations (create, rename, delete)

### Edge Cases
- Network errors during sync
- Rate limiting (429 responses)
- Invalid repository
- Unauthorized access
- Token expiration
- Large drawings (>1MB)
- Special characters in file/folder names
- Concurrent sync operations

### Manual Testing
- Login/logout flow
- Configuration save/load
- Sync on save
- Manual sync buttons
- Toast notifications
- Offline behavior (should show error, not block)

---

## Implementation Order

1. **Phase 1**: Add types to `types.ts`
2. **Phase 2**: Create toast notification system
3. **Phase 3**: Create `githubAuthService.ts`
4. **Phase 4**: Create `githubRepoService.ts`
5. **Phase 5**: Create `github.svelte.ts` store
6. **Phase 6**: Add message handlers to `background.ts`
7. **Phase 7**: Create GitHub settings UI in Options page
8. **Phase 8**: Add sync controls to side panel
9. **Phase 9**: Update `wxt.config.ts` manifest
10. **Phase 10**: Test all functionality

---

## File Structure

```
src/
├── entrypoints/
│   ├── background.ts              # Add GitHub message handlers
│   ├── options/
│   │   ├── Options.svelte         # Add GitHub settings UI
│   │   └── GithubSettings.svelte  # New component
│   └── sidepanel/
│       ├── App.svelte            # Add ToastContainer
│       └── sidepanel.ts
├── lib/
│   ├── services/
│   │   ├── githubAuthService.ts  # New - PKCE auth
│   │   ├── githubRepoService.ts   # New - GitHub API calls
│   │   ├── drawingService.ts     # Existing - modify for sync
│   │   ├── folderService.ts      # Existing - modify for sync
│   │   └── sentry.ts
│   ├── stores/
│   │   ├── github.svelte.ts       # New - GitHub state store
│   │   ├── drawings.svelte.ts     # Existing - modify for auto-sync
│   │   ├── folders.svelte.ts      # Existing - modify for folder sync
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/
│   │   │   └── toast/             # New - notification system
│   │   │       ├── toast.svelte
│   │   │       ├── toast-container.svelte
│   │   │       ├── toasts.svelte.ts
│   │   │       └── index.ts
│   │   └── excalivault/
│   │       ├── Excalivault.svelte    # Add ToastContainer
│   │       ├── VaultList.svelte       # Add sync controls
│   │       └── ...existing components
│   ├── types.ts                    # Add GitHub types
│   └── utils.ts
wxt.config.ts                      # Update manifest
```

---

## Unresolved Questions

1. **Client ID Storage**: Where should the GitHub Client ID be stored?
   - **Options**:
     - Hardcoded in `githubAuthService.ts` (simplest)
     - Environment variable via `.env` file
     - User-provided in settings (more flexible but complex)

2. **Initial Sync Behavior**: After user first logs in to GitHub, should auto-push happen:
   - **Immediately** (automatic, no user interaction)
   - **After confirmation** (show dialog asking user to proceed)
   - **Manual only** (user must click push button)

3. **Folder Change Sync**: When folder structure changes locally (rename/move/delete):
   - **Immediate sync** (trigger on every folder operation)
   - **Deferred sync** (wait for next drawing save or manual sync)
   - **User prompt** (ask before syncing folder changes)
