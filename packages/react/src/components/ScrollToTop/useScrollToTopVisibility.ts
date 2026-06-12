import { useEffect, useState } from 'react';

import type { ScrollToTopVisible } from './ScrollToTop';

interface UseScrollToTopVisibilityOptions {
  /** See {@link ScrollToTopVisible}. */
  visible: ScrollToTopVisible;
  /** Pixels scrolled before returning `true` in `"auto"` mode. */
  threshold: number;
  /** Element to observe. Defaults to `window` when `undefined`. */
  scrollTarget?: HTMLElement | Window;
}

/**
 * Returns `true` when the `ScrollToTop` button should be rendered.
 *
 * - `visible === "always"` → always `true`; no scroll listener is attached.
 * - `visible === "auto"` → attaches a passive `scroll` listener on `scrollTarget`
 *   (or `window`) and returns `true` once the scroll offset exceeds `threshold`.
 *   Reverts to `false` when the user scrolls back below the threshold.
 *
 * This is an internal hook — not exported from the package.
 */
export function useScrollToTopVisibility({
  visible,
  threshold,
  scrollTarget,
}: UseScrollToTopVisibilityOptions): boolean {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    if (visible === 'always') {
      return;
    }

    const target = scrollTarget ?? window;

    const getScrollY = () =>
      target === window ? window.scrollY : (target as HTMLElement).scrollTop;

    const check = () => setIsScrolledPast(getScrollY() > threshold);

    check();
    target.addEventListener('scroll', check, { passive: true });
    return () => target.removeEventListener('scroll', check);
  }, [visible, threshold, scrollTarget]);

  return visible === 'always' || isScrolledPast;
}
