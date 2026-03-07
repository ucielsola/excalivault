<script lang="ts">
  let {
    onEnter,
    onEsc,
  }: {
    onEnter?: () => void;
    onEsc?: () => void;
  } = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && onEnter) {
      onEnter();
    }
    if (event.key === "Escape" && onEsc) {
      onEsc();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
