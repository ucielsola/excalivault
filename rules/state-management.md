# State Management Rules

## Store Pattern

Class-based Svelte 5 stores with `$state` runes:

```typescript
class StoreName {
  #loading = $state<boolean>(false); // Async stores
  #error = $state<string | null>(null); // Async stores
  #items = $state<ItemType[]>([]); // Data stores

  // Async pattern
  public async load(): Promise<void> {
    this.#loading = true;
    this.#error = null;
    try {
      this.#items = await service.load();
    } catch (e) {
      this.#error = "Error message";
      captureException(e as Error);
    } finally {
      this.#loading = false;
    }
  }

  get loading(): boolean {
    return this.#loading;
  }
  get items(): ItemType[] {
    return this.#items;
  }
}

export const storeName = new StoreName();
```

## Key Rules

1. **Use service layer only** - Never call `browser` API directly in stores
1. **Follow naming pattern** - For runes to work correctly, the store files should be named `*.svelte.ts`
1. **Cross-store deps** - Import stores at top level, call methods directly (no circular deps)
1. **Optimistic updates** - Update local state first, revert on failure
1. **Naming**: `#private = $state<Type>()`, `get name()`, `set name(value)`, `public async method()`
1. **Export singleton** from `src/lib/stores/index.ts`
