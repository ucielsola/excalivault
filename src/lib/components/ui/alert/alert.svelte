<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import { tv, type VariantProps } from "tailwind-variants";

  import { cn } from "$lib/utils.js";

  export const alertVariants = tv({
    base: "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success: "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700",
        info: "border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-700",
        warning: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });

  export type AlertVariant = VariantProps<typeof alertVariants>["variant"];

  export type AlertProps = HTMLAttributes<HTMLDivElement> & {
    variant?: AlertVariant;
    children?: () => void;
  };
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    children,
    ...restProps
  }: AlertProps = $props();
</script>

<div
  class={cn(alertVariants({ variant }), className)}
  data-slot="alert"
  role="alert"
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
