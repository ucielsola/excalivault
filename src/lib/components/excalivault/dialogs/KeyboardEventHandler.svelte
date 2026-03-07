<script lang="ts">
  let {
    active = true,
    onEnter,
    onEsc,
  }: {
    active?: boolean;
    onEnter?: () => void;
    onEsc?: () => void;
  } = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (!active) return;

    if (event.key === "Enter" && onEnter) {
      event.preventDefault();
      onEnter();
    }
    if (event.key === "Escape" && onEsc) {
      event.preventDefault();
      onEsc();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
