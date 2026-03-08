# File Structure Rules

## src/lib/ Organization

```
lib/
├── components/
│   ├── ui/              # Reusable UI primitives
│   └── excalivault/     # Domain-specific components
├── hooks/               # Svelte 5 hooks
├── services/            # External communication layer
├── stores/              # Svelte 5 state management
├── utils/               # Utility modules
├── index.ts             # Barrel exports
├── types.ts             # Global types
└── utils.ts             # Shared utilities
```

## Directory Rules

### components/ui/
- Reusable UI components (button, input, dialog, etc.)
- **Pattern:** One folder per component with `index.ts`

```bash
components/ui/
  button/
    button.svelte
    index.ts
```

### components/excalivault/
- Domain-specific components
- **Domain-based organization** - Flat structure per domain (max 2 levels)
- No nested subdomains (unlike `ui/` which uses subdirectories)

```bash
components/excalivault/
  main/                # Main vault view domain (11 components, flat)
    MainView.svelte
    VaultNavigator.svelte
    CurrentDrawing.svelte
    SaveActionsBar.svelte
    VaultListItem.svelte
    FolderItem.svelte
    FolderList.svelte
    FolderCreation.svelte
    SearchBar.svelte
    EmptyState.svelte
    index.ts
  settings/             # Settings view domain (2 components, flat)
    SettingsView.svelte
    Settings.svelte
    index.ts
  welcome/              # Welcome/onboarding domain (1 component)
    WelcomeScreen.svelte
    index.ts
  dialogs/              # Cross-cutting dialog components
    DialogManager.svelte
    DeleteConfirmDialog.svelte
    OverwriteConfirmDialog.svelte
    FolderSelectDialog.svelte
    FolderSelectItem.svelte
    SavePanel.svelte
    SaveCurrent.svelte
    index.ts
  shared/               # Cross-cutting shared utilities
    InlineInput.svelte
    VaultLogo.svelte
    index.ts
  layout/               # App-level layout components
    VaultLayout.svelte
    VaultHeader.svelte
    Footer.svelte
    ExcalivaultContainer.svelte
    AlertContainer.svelte
    index.ts
  Excalivault.svelte      # Root router component
  index.ts
```

### hooks/
- Svelte 5 hooks with `.svelte.ts` extension
- Export from `index.ts`

```typescript
// hooks/useAutoFocus.svelte.ts
export function useAutoFocus() { ... }

// hooks/index.ts
export { useAutoFocus } from './useAutoFocus.svelte';
```

### services/
- Singleton classes for browser API/runtime communication
- One file per service
- **Pattern:** `nameService.ts` → `export const nameService = new NameService();`

```typescript
// services/itemService.ts
class ItemService {
  private async sendMessage<T>(message: Message): Promise<T> { ... }
  public async loadItems(): Promise<Item[]> { ... }
}

export const itemService = new ItemService();
```

### stores/
- Svelte 5 store classes (see [state-management.md](./state-management.md))
- One file per store

### utils/
- Organized utility modules
- One file per utility, lowercase filename

```bash
utils/
  contentHash.ts      # computeContentHash()
  dateFormat.ts       # formatDate()
  folderColors.ts     # COLOR_VALUES[]
```

### Root Files

**types.ts:**
- Global type definitions
- Re-export from `lib/index.ts`

**utils.ts:**
- Shared utilities (cn, type helpers)
- Used across entire app

**index.ts:**
- Barrel exports for lib
- Re-export from sub-modules only

```typescript
// lib/index.ts
export * from "./stores";
export * from "./types";
```

## Component Organization Patterns

### When to Split vs Merge Components

**✅ Split into separate components when:**
- Component is used in multiple places (reusable)
- Has complex internal state that could be isolated
- Different logical concerns that can be tested independently
- Example: `InlineInput` is reusable across multiple rename flows

**✅ Merge into single component when:**
- Sub-components are only used by one parent (not reusable elsewhere)
- Splits create unnecessary abstraction layers
- Parent just orchestrates display/rename/actions modes
- Example: `VaultListItem` and `FolderItem` merged Display/Rename/Actions into single component

**Anti-pattern to avoid:**
```svelte
<!-- AVOID: Excessive splitting for single-use components -->
<VaultListItem>
  <VaultListItemDisplay />    <!-- Only used here -->
  <VaultListItemRename />      <!-- Only used here -->
  <VaultListItemActions />     <!-- Only used here -->
</VaultListItem>

<!-- PREFER: Single component with conditional rendering -->
<VaultListItem>
  {#if isRenaming}
    <InlineInput ... />
  {:else}
    <button ...>Display</button>
    <DropdownMenu ...>Actions</DropdownMenu>
  {/if}
</VaultListItem>
```

### Domain vs Technical Organization

**Excavault uses domain-based organization** (not technical concern separation):

```
components/excalivault/
  main/         # Business domain (main vault view)
  settings/      # Business domain (settings view)
  welcome/       # Business domain (onboarding)
  dialogs/       # Technical concern (cross-cutting)
  shared/        # Technical concern (cross-cutting utilities)
  layout/        # Technical concern (cross-cutting layout)
```

**When to use domains:**
- Business features that are logically distinct (main vs settings vs welcome)
- Each domain has its own view/components
- Clear business boundary

**When to use technical organization:**
- Cross-cutting concerns (dialogs, layout, shared utilities)
- Components used across multiple domains
- Technical infrastructure

**Comparison:**

| Aspect | `lib/hooks/stores/utils/` | `lib/components/excalivault/` |
|---------|----------------------------|--------------------------------|
| **Organization** | Technical concern | Business domain |
| **Example** | `hooks/`, `services/`, `stores/` | `main/`, `settings/`, `welcome/` |
| **Why** | Separation of technical layers | Separation of business features |
| **When to nest** | Never (flat) | Never (flat domains, max 2 levels) |

**Never nest subdomains in excalivault/**:
- ❌ `main/list-view/items/VaultListItem.svelte` (3 levels - too deep)
- ✅ `main/VaultListItem.svelte` (2 levels - correct)
- Only add subdirectories when domain hits 10+ components

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Service | `nameService` | `drawingService` |
| Store | lowercase | `drawings`, `folders` |
| Hook | `useName` | `useAutoFocus`, `useOutsideClick` |
| Utility | lowercase | `contentHash`, `dateFormat` |
| UI Component folder | lowercase | `button`, `dropdown-menu` |
| Excalivault component | PascalCase | `VaultList.svelte` |

## Import Aliases

Use `$lib` for lib imports:
```typescript
import { drawings } from "$lib/stores";
import { type DrawingData } from "$lib/types";
import Button from "$lib/components/ui/button";
```