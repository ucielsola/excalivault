<script lang="ts">
  import InlineInput from "$lib/components/excalivault/shared/InlineInput.svelte";

  interface Props {
    initial: string;
    onConfirm: (name: string) => void;
    onCancel: () => void;
  }

  let { initial, onConfirm, onCancel }: Props = $props();
</script>

<InlineInput
  {initial}
  onConfirm={onConfirm}
  onCancel={onCancel}
/>
