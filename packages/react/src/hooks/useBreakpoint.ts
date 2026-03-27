import { useState, useEffect } from "react";

/**
 * GNOME / libadwaita canonical breakpoints (in CSS px, assuming 1 sp = 1 px at 1× density).
 *
 * | Name       | Max width | Pattern triggered |
 * |------------|-----------|-------------------|
 * | `narrow`   | ≤ 400 px  | Collapse split views; sidebar becomes overlay |
 * | `medium`   | ≤ 550 px  | Move ViewSwitcher to a bottom bar |
 * | `wide`     | ≤ 860 px  | Collapse outer pane in nested split views |
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Breakpoint.html
 */
export const GNOME_BREAKPOINTS = {
  /** ≤ 400 px — split views collapse to single pane */
  narrow: 400,
  /** ≤ 550 px — ViewSwitcher moves to bottom bar */
  medium: 550,
  /** ≤ 860 px — outer pane of nested split views collapses */
  wide: 860,
} as const;

export type GnomeBreakpointName = keyof typeof GNOME_BREAKPOINTS;

export interface BreakpointState {
  /** Width ≤ 400 px — split views are collapsed. */
  isNarrow: boolean;
  /** Width ≤ 550 px — medium or narrower. */
  isMedium: boolean;
  /** Width ≤ 860 px — wide or narrower. */
  isWide: boolean;
  /** Current viewport width in px. */
  width: number;
}

/**
 * Tracks the viewport width against GNOME / libadwaita breakpoints.
 *
 * Returns a reactive state object that updates on every window resize.
 * Uses a passive `resize` event listener and cleans up automatically.
 *
 * @example
 * const { isNarrow, isMedium } = useBreakpoint();
 * // isNarrow → true when viewport ≤ 400 px (split views should collapse)
 * // isMedium → true when viewport ≤ 550 px (use ViewSwitcherBar instead)
 */
export function useBreakpoint(): BreakpointState {
  const getState = (): BreakpointState => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1280;
    return {
      isNarrow: width <= GNOME_BREAKPOINTS.narrow,
      isMedium: width <= GNOME_BREAKPOINTS.medium,
      isWide:   width <= GNOME_BREAKPOINTS.wide,
      width,
    };
  };

  const [state, setState] = useState<BreakpointState>(getState);

  useEffect(() => {
    const handler = () => setState(getState());
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  return state;
}
