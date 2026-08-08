import { type RefObject, useEffect, useState } from 'react';

export interface ElementSize {
  /** Content-box width in px. `0` until the first measurement. */
  width: number;
  /** Content-box height in px. `0` until the first measurement. */
  height: number;
}

/**
 * Reactive content-box size of an element, tracked via `ResizeObserver`.
 *
 * The container-level sibling of `useBreakpoint` (which watches the
 * viewport): pass a ref to any element and get its size back reactively,
 * for layouts that adapt to the space they're given rather than the window
 * size — the GNOME HIG `AdwBreakpointBin` pattern.
 *
 * Returns `{ width: 0, height: 0 }` until the ref is attached and the first
 * measurement lands.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { width } = useElementSize(ref);
 *
 * <div ref={ref}>{width < 400 ? <CompactLayout /> : <WideLayout />}</div>
 */
export function useElementSize<T extends Element>(ref: RefObject<T | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();

    setSize({ width: rect.width, height: rect.height });

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;

      if (!entry) {
        return;
      }

      // contentBoxSize is more reliable than contentRect for inline/block sizing
      const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const height = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;

      setSize({ width, height });
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
