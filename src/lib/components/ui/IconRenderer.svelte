<script lang="ts">
  import { FolderOpen } from '@lucide/svelte';

  interface Props {
    name: string;
    size?: number;
    color?: string;
    class?: string;
  }

  let { name, size = 14, color, class: className }: Props = $props();

  let icon = $state<any>(FolderOpen);
  let lastIconName = $state<string>("");

  async function loadIcon(iconName: string) {
    if (iconName === lastIconName) return;

    lastIconName = iconName;

    try {
      const icons = await import('@lucide/svelte');
      const iconComponent = icons[iconName as keyof typeof icons];
      if (iconComponent) {
        icon = iconComponent;
      } else {
        console.warn(`Icon not found: ${iconName}, falling back to FolderOpen`);
        icon = FolderOpen;
      }
    } catch (e) {
      console.warn(`Error loading icon ${iconName}, falling back to FolderOpen`, e);
      icon = FolderOpen;
    }
  }

  $effect(() => {
    loadIcon(name);
  });
</script>

{#if icon}
  {@const Icon = icon}
  <svelte:component this={Icon} {size} {color} class={className} />
{/if}
