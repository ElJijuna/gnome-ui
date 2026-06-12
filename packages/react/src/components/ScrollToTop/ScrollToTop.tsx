import { GoUp } from '@gnome-ui/icons';
import { type CSSProperties, forwardRef } from 'react';

import { IconButton } from '../IconButton';
import styles from './ScrollToTop.module.css';
import { useScrollToTopVisibility } from './useScrollToTopVisibility';

/**
 * Controls when the button is rendered.
 *
 * - `"auto"` — hidden until the user scrolls past `threshold` pixels (default).
 * - `"always"` — always rendered regardless of scroll position.
 */
export type ScrollToTopVisible = 'always' | 'auto';

/**
 * Anchor corner or edge for the fixed-position container.
 * The button is inset `--gnome-space-4` (24 px) from each named edge.
 */
export type ScrollToTopPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'top-right'
  | 'top-left'
  | 'top-center';

export interface ScrollToTopProps {
  /**
   * Controls when the button is visible.
   *
   * - `"auto"` (default) — shown only after the user scrolls past `threshold` pixels.
   *   Hides again when they scroll back above the threshold.
   * - `"always"` — permanently visible.
   */
  visible?: ScrollToTopVisible;
  /**
   * Corner or edge where the button is anchored inside the viewport.
   *
   * Default: `"bottom-right"`.
   */
  position?: ScrollToTopPosition;
  /**
   * Number of pixels the user must scroll before the button appears.
   * Only relevant when `visible="auto"`.
   *
   * Default: `300`.
   */
  threshold?: number;
  /**
   * Scrollable element to observe and scroll back to the top.
   * Pass an `HTMLElement` when the scrollable area is a container other than
   * the page (e.g. a drawer, a split-view pane, or a custom scroll region).
   *
   * Defaults to `window`.
   */
  scrollTarget?: HTMLElement | Window;
  /** Additional CSS class applied to the root positioning container. */
  className?: string;
  /** Inline styles applied to the root positioning container. */
  style?: CSSProperties;
}

const POSITION_CLASS: Record<ScrollToTopPosition, string> = {
  'bottom-right': styles.bottom_right,
  'bottom-left': styles.bottom_left,
  'bottom-center': styles.bottom_center,
  'top-right': styles.top_right,
  'top-left': styles.top_left,
  'top-center': styles.top_center,
};

/**
 * Fixed-position OSD button that scrolls the page (or a container) back to the top.
 *
 * - Renders a circular `IconButton` with the `GoUp` icon at the chosen `position`.
 * - When `visible="auto"` (default), the button appears only after the user scrolls
 *   past `threshold` pixels and hides again when they scroll back above it.
 * - The button is semi-transparent at rest (`opacity: 0.5`) and fully opaque on
 *   hover or keyboard focus, so it does not obscure underlying content.
 * - Clicking triggers a smooth scroll to the top via `scrollTo({ top: 0, behavior: "smooth" })`.
 * - Forwards `ref` to the root `<div>` positioning container, not the inner `<button>`.
 *
 * @example
 * // Minimal — appears after 300 px of scroll, anchored bottom-right
 * <ScrollToTop />
 *
 * @example
 * // Always visible, anchored bottom-left
 * <ScrollToTop visible="always" position="bottom-left" />
 *
 * @example
 * // Observe a custom scrollable container
 * const ref = useRef<HTMLDivElement>(null);
 * <div ref={ref} style={{ overflowY: 'auto', height: 400 }}>...</div>
 * <ScrollToTop scrollTarget={ref.current ?? undefined} threshold={150} />
 */
export const ScrollToTop = forwardRef<HTMLDivElement, ScrollToTopProps>(function ScrollToTop(
  { visible = 'auto', position = 'bottom-right', threshold = 300, scrollTarget, className, style },
  ref,
) {
  const isVisible = useScrollToTopVisibility({ visible, threshold, scrollTarget });

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={[styles.root, POSITION_CLASS[position], className].filter(Boolean).join(' ')}
      style={style}
    >
      <IconButton
        icon={GoUp}
        label="Scroll to top"
        variant="osd"
        onClick={() => (scrollTarget ?? window).scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
});
