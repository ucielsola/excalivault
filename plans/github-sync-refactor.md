# GitHub Sync Refactor Plan

## Overview
Add GitHub repository sync functionality with PKCE OAuth, auto-sync, offline handling, and hard deletion support.

## Phase 1: Data Structure Changes

### Minimal Changes
- Keep flat localStorage structure (efficient for UI operations)
- No changes to `DrawingData` or `FolderData` types
- Maintain `folderId`/`parentId` foreign keys

### Add Computed Nested Structure
```typescript
interface VaultTreeNode {
  type: 'folder' | 'drawing';
  id: string;
  name: string;
  parentId: string | null;
  children: VaultTreeNode[];
  // ... fields from DrawingData or FolderData
}
```

### New Types
```typescript
interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;  // User-configured (default: 'main')
  token?: string;
  lastSyncAt?: number;
  autoSync: boolean;
  autoSyncDebounceMs: number;  // Default: 30000 (30s)
}

interface SyncResult {
  pushed: { folders: number; drawings: number };
  pulled: { folders: number; drawings: number };
  conflicts: { localWon: number; remoteWon: number };
}

interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  dataType: 'folder' | 'drawing';
  timestamp: number;
}
```

---

## Phase 2: GitHub OAuth (PKCE Flow)

### New Service
Create `src/lib/services/githubAuthService.ts`:
- Generate code_verifier, code_challenge
- Open GitHub OAuth window with PKCE
- Exchange code for access_token
- Store in browser.storage.local
- Refresh token handling if needed

### New Types
Add to `src/lib/types.ts`:
- GitHub OAuth PKCE types
- Auth state management

---

## Phase 3: GitHub Sync Service

### New Service
Create `src/lib/services/githubSyncService.ts`

### Key Methods
```typescript
class GitHubSyncService {
  connect(owner, repo, branch): Promise<void>
  disconnect(): Promise<void>
  push(): Promise<SyncResult>    // Local → GitHub
  pull(): Promise<SyncResult>    // GitHub → Local
  sync(): Promise<SyncResult>    // Bidirectional, last-wins
  
  // Auto-sync
  scheduleAutoSync(): void
  cancelAutoSync(): void
  triggerSync(): Promise<SyncResult>
  
  // Offline handling
  queueChange(change: PendingChange): void
  syncPendingChanges(): Promise<SyncResult>
  
  // Helpers
  private toGitHubTree(folders, drawings): GitHubNode[]
  private fromGitHubTree(nodes): { folders, drawings }
  private compareTimestamps(local, remote): 'local' | 'remote'
  private resolveConflict(local, remote, winner): MergedData
}
```

### File Structure Mapping
```
repo-root/
  ├── .excalivault.json          # Metadata (folder IDs, sync state)
  ├── folder-1/
  │   ├── subfolder/
  │   │   └── drawing.json
  │   └── root-drawing.json
  └── another-drawing.json
```

### Latest Wins Logic
```typescript
if (local.updatedAt > remote.updatedAt) {
  // local wins, push to GitHub
} else {
  // remote wins, pull to local
}
```

### Offline Queue Handling
- Store pending changes in browser.storage.local
- Sync pending changes on next successful connection
- Deduplicate changes (same item, multiple updates = latest only)

### Auto-sync Behavior
- Debounce 30s after any save/update/delete
- Sync pending changes when extension opens
- Manual sync button available anytime

---

## Phase 4: UI Changes

### New Components
- `GitHubSettings.svelte` - Config owner/repo/branch, connect button, auto-sync toggle, sync status
- `SyncStatus.svelte` - Show last sync time, pending changes badge, sync in progress indicator
- `BranchSelector.svelte` - Dropdown to select/create branch

### Update Existing
- `Settings.svelte` - Add GitHub config section with branch selection
- Add sync status indicator in header/footer
- Add manual sync button in toolbar

### New Store
Create `src/lib/stores/github.svelte.ts`:
```typescript
class GitHubStore {
  config: GitHubConfig | null
  isConnected: boolean
  isSyncing: boolean
  lastSyncAt: number | null
  pendingChanges: PendingChange[]
  syncError: string | null
  
  connect(owner, repo, branch, autoSync): Promise<void>
  disconnect(): Promise<void>
  sync(): Promise<SyncResult>
  toggleAutoSync(enabled): void
}
```

---

## Phase 5: Background Script Updates

### Add to `src/entrypoints/background.ts`
- GitHub sync message handlers
- Auto-sync scheduling with debounce
- Offline change queue management
- Hard deletion handling (permanent, no trash)
- Network status monitoring for auto-sync

### New Message Types
Add to `src/lib/types.ts`:
- `CONNECT_GITHUB`, `DISCONNECT_GITHUB`
- `PUSH_TO_GITHUB`, `PULL_FROM_GITHUB`, `SYNC_GITHUB`
- `GET_SYNC_STATUS`, `GET_PENDING_CHANGES`

---

## Phase 6: Migration Strategy

### No Data Migration Needed
- Flat structure stays in localStorage

### GitHub Repo Initialization
- First sync creates `.excalivault.json` metadata
- Maps folder IDs to paths for future syncs
- User selects branch (default: main)

### Metadata File Structure
```json
{
  "version": 1,
  "folderPaths": {
    "folder-abc-123": "folder-1/subfolder",
    "folder-def-456": "folder-1"
  },
  "branch": "main",
  "lastSyncAt": 1234567890
}
```

### Hard Deletion Behavior
- Delete from localStorage immediately
- Delete from GitHub on next sync
- No undo/restore mechanism

---

## Phase 7: Testing

### Unit Tests
- Tree flattening/unflattening utilities
- Timestamp comparison logic
- Conflict resolution
- Offline change queue
- Debounce timing

### Integration Tests
- Full sync flow (push/pull)
- OAuth flow (mocked)
- Auto-sync scheduling
- Offline → online sync recovery
- Branch switching
- Edge cases (empty repo, new folder, deleted items)

### Manual Testing
- Real GitHub repo with test data
- Multiple device sync scenario
- Network error handling
- Auto-sync with rapid changes
- Branch creation/selection

---

## Decisions Made

### Sync Scope
- **Entire vault sync**: Sync all folders and drawings in repo root

### Authentication
- **GitHub OAuth using PKCE flow**: Secure, no secrets in client

### Conflict Resolution
- **Latest wins (by timestamp)**: Compare `updatedAt`, newer overwrites older

### Branch Strategy
- **User-configured**: Default to 'main', but user can choose

### Sync Frequency
- **Auto-sync**: Debounce 30s after changes, manual trigger available

### File Size Limits
- **No limits**: Drawing JSONs can be any size

### Offline Handling
- **Queue changes**: Store pending changes, sync when reconnected

### Delete Handling
- **Hard deletion**: Permanent, no trash/undo

---

## Estimated Complexity
~3-4 weeks

## Risk Level
Medium - keeps existing data model intact, adds sync layer
