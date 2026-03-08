export function useOutsideClick(
  element: () => HTMLElement | null,
  callback: () => void,
) {
  $effect(() => {
    function handleClick(e: MouseEvent) {
      const el = element();
      if (el && !el.contains(e.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  });
}
