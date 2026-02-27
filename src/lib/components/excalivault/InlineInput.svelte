<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import XIcon from "@lucide/svelte/icons/x";

  let {
    initial = "",
    onConfirm = (_value: string) => {},
    onCancel = () => {},
    placeholder = "",
    autoFocus = true,
  }: {
    initial?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    placeholder?: string;
    autoFocus?: boolean;
  } = $props();

  let value = $state(initial);
  let inputRef = $state<HTMLInputElement>();

  $effect(() => {
    if (autoFocus && inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && value.trim()) {
      onConfirm(value.trim());
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  function handleBlur() {
    if (value.trim()) {
      onConfirm(value.trim());
    } else {
      onCancel();
    }
  }

  function handleConfirm() {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  }
</script>

<div class="flex items-center gap-1">
  <input
    bind:this={inputRef}
    bind:value
    onkeydown={handleKeyDown}
    onblur={handleBlur}
    {placeholder}
    class="border-primary/40 bg-input text-foreground focus:ring-primary min-w-0 flex-1 rounded border px-1.5 py-0.5 font-mono text-[11px] focus:ring-1 focus:outline-none"
  />
  <button
    onmousedown={(e) => e.preventDefault()}
    onclick={handleConfirm}
    class="text-primary hover:bg-primary/10 flex h-5 w-5 items-center justify-center rounded"
  >
    <CheckIcon size={11} />
  </button>
  <button
    onmousedown={(e) => e.preventDefault()}
    onclick={onCancel}
    class="text-muted-foreground hover:bg-secondary flex h-5 w-5 items-center justify-center rounded"
  >
    <XIcon size={11} />
  </button>
</div>
