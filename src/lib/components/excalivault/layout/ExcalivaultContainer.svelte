<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import { drawings, folders, vaultList } from "$lib/stores";
  import { useAutoFocus, useOutsideClick } from "$lib/hooks";

  interface Props {
    children: Snippet<[setListRef: (ref: HTMLDivElement) => void]>;
  }

  let { children }: Props = $props();

  let listRef = $state<HTMLDivElement | null>(null);

  function setListRef(ref: HTMLDivElement) {
    listRef = ref;
  }

  onMount(async () => {
    await drawings.loadDrawings();
    folders.loadFolders();
    drawings.detectActiveDrawingByContent();
  });

  useAutoFocus(
    () => vaultList.newCopyInputRef,
    () => vaultList.saveMode === "new" && vaultList.savePanelOpen,
  );

  useOutsideClick(() => listRef, () => {
    vaultList.menuOpenId = null;
  });
</script>

<div class="flex h-full flex-col overflow-hidden">
  {@render children(setListRef)}
</div>
