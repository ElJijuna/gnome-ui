import { useCallback, useEffect, useState } from 'react';

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
  const getState = useCallback((): BreakpointState => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;

    return {
      isNarrow: width <= GNOME_BREAKPOINTS.narrow,
      isMedium: width <= GNOME_BREAKPOINTS.medium,
      isWide: width <= GNOME_BREAKPOINTS.wide,
      width,
    };
  }, []);

  const [state, setState] = useState<BreakpointState>(getState);

  useEffect(() => {
    const handler = () => setState(getState());

    window.addEventListener('resize', handler, { passive: true });

    return () => window.removeEventListener('resize', handler);
  }, [getState]);

  return state;
}

// ─── Responsive values ────────────────────────────────────────────────────────

/** The widest bucket, above every breakpoint, is `base`. */
export type GnomeBreakpointBucket = GnomeBreakpointName | 'base';

/**
 * A value that may vary by breakpoint: either the value itself, or a map of
 * breakpoint names to values.
 *
 * The buckets are max-widths, so the map reads like stacked `max-width` media
 * queries — `base` is the widest, and the narrowest matching entry wins:
 *
 * ```ts
 * { base: 3, wide: 2, narrow: 1 }
 * // ≤ 400 px → 1 | ≤ 860 px → 2 | wider → 3
 * // (550 px matches `wide`, since no `medium` entry is given)
 * ```
 */
export type ResponsiveValue<T> = T | ({ base?: T } & Partial<Record<GnomeBreakpointName, T>>);

/** Narrowest first, so a lookup can walk from the current bucket outwards. */
const BUCKET_FALLBACKS: Record<GnomeBreakpointBucket, GnomeBreakpointBucket[]> = {
  narrow: ['narrow', 'medium', 'wide', 'base'],
  medium: ['medium', 'wide', 'base'],
  wide: ['wide', 'base'],
  base: ['base'],
};

/**
 * Bucket a width falls into. The same thresholds serve the viewport and any
 * container measured with `useElementSize` — the `AdwBreakpointBin` pattern,
 * where a breakpoint applies to whatever you attach it to.
 *
 * A width of `0` means "not measured yet" and reports `base`, so the first
 * paint matches the server rather than flashing the narrowest layout.
 */
export function bucketForWidth(width: number): GnomeBreakpointBucket {
  if (width <= 0) {
    return 'base';
  }
  if (width <= GNOME_BREAKPOINTS.narrow) {
    return 'narrow';
  }
  if (width <= GNOME_BREAKPOINTS.medium) {
    return 'medium';
  }
  if (width <= GNOME_BREAKPOINTS.wide) {
    return 'wide';
  }
  return 'base';
}

/** True when `value` is a breakpoint map rather than a plain value. */
export function isResponsiveMap<T>(value: ResponsiveValue<T> | undefined): boolean {
  return typeof value === 'object' && value !== null;
}

/** Pick the entry for `bucket`, falling back outwards to the wider ones. */
export function resolveResponsive<T>(
  value: ResponsiveValue<T> | undefined,
  bucket: GnomeBreakpointBucket,
  fallback: T,
): T {
  if (value === undefined) {
    return fallback;
  }
  if (!isResponsiveMap(value)) {
    return value as T;
  }

  const map = value as Partial<Record<GnomeBreakpointBucket, T>>;
  for (const key of BUCKET_FALLBACKS[bucket]) {
    const entry = map[key];
    if (entry !== undefined) {
      return entry;
    }
  }
  return fallback;
}
