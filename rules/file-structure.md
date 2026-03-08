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
- Can have subdirectories for features

```bash
components/excalivault/
  dialogs/
    DeleteDialog.svelte
    index.ts
  VaultList.svelte
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