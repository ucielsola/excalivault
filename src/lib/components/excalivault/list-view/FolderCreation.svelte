<script lang="ts">
  import { FolderOpen, Check, X } from "@lucide/svelte";
  import { COLOR_VALUES, FOLDER_COLORS, getFolderBadgeClass } from "$lib/utils/folderColors";
  import type { FolderColorValue } from "$lib/utils/folderColors";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";

  interface Props {
    onConfirm: (name: string, color: string) => void;
    onCancel: () => void;
  }

  let { onConfirm, onCancel }: Props = $props();

  let name = $state("");
  let color = $state(COLOR_VALUES[Math.floor(Math.random() * COLOR_VALUES.length)] as FolderColorValue);
  let inputRef = $state<HTMLInputElement>();
  let ignoreBlur = $state(false);
  let colorMenuOpen = $state(false);
  let justChangedColor = $state(false);

  $effect(() => {
    if (inputRef) {
      window.requestAnimationFrame(() => {
        if (inputRef) {
          inputRef.focus();
          inputRef.select();
        }
      });
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && name.trim()) {
      ignoreBlur = true;
      onConfirm(name.trim(), color);
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  function handleBlur() {
    if (ignoreBlur || justChangedColor) {
      ignoreBlur = false;
      justChangedColor = false;
      return;
    }
    if (name.trim()) {
      onConfirm(name.trim(), color);
    } else {
      onCancel();
    }
  }

  function handleColorPickerMouseDown(e: MouseEvent) {
    e.preventDefault();
    ignoreBlur = true;
  }

  function handleColorPickerMouseDownUp(_e: MouseEvent) {
    ignoreBlur = false;
  }

  function handleConfirm() {
    if (name.trim()) {
      ignoreBlur = true;
      onConfirm(name.trim(), color);
    }
  }

  function handleColorChange(newColor: string) {
    justChangedColor = true;
    color = newColor as FolderColorValue;
    colorMenuOpen = false;
    setTimeout(() => inputRef?.focus(), 0);
  }
</script>

<div class="flex items-center gap-2">
  <FolderOpen
    size={14}
    class={getFolderBadgeClass(color) + " shrink-0"}
  />
  <input
    bind:this={inputRef}
    bind:value={name}
    onkeydown={handleKeyDown}
    onblur={handleBlur}
    placeholder="Folder name..."
    class="border-primary/40 bg-input text-foreground focus:ring-primary min-w-0 flex-1 rounded border px-1.5 py-0.5 font-mono text-[11px] focus:ring-1 focus:outline-none"
  />
  <DropdownMenu bind:open={colorMenuOpen}>
    <DropdownMenuTrigger>
      <button
        onmousedown={handleColorPickerMouseDown}
        onmouseup={handleColorPickerMouseDownUp}
        aria-label="Choose folder color"
        class="border-border hover:border-primary/50 flex h-5 w-5 items-center justify-center rounded border transition-colors"
      >
        <div
          class="h-3 w-3 rounded-full"
          style="background-color: {color}"
        ></div>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-40">
      {#each Object.entries(FOLDER_COLORS) as [colorName, colorValue] (colorName)}
        <DropdownMenuItem
          class="flex items-center gap-2"
          onclick={() => handleColorChange(colorValue)}
        >
          <div
            class="h-3 w-3 rounded-full"
            style="background-color: {colorValue}"
          ></div>
          <span class="capitalize">{colorName}</span>
        </DropdownMenuItem>
      {/each}
    </DropdownMenuContent>
  </DropdownMenu>
  <button
    onmousedown={(e) => e.preventDefault()}
    onclick={handleConfirm}
    class="text-primary hover:bg-primary/10 flex h-5 w-5 items-center justify-center rounded"
  >
    <Check size={11} />
  </button>
  <button
    onmousedown={(e) => e.preventDefault()}
    onclick={onCancel}
    class="text-muted-foreground hover:bg-secondary flex h-5 w-5 items-center justify-center rounded"
  >
    <X size={11} />
  </button>
</div>
