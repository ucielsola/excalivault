export function useAutoFocus(
  element: () => HTMLInputElement | undefined,
  shouldFocus: () => boolean,
) {
  $effect(() => {
    if (shouldFocus()) {
      element()?.focus();
    }
  });
}
