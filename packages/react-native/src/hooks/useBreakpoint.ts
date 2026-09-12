import { useWindowDimensions } from 'react-native';

/**
 * GNOME / libadwaita canonical breakpoints (in dp, assuming 1 sp = 1 dp at 1× density).
 *
 * | Name     | Max width | Pattern triggered |
 * |----------|-----------|--------------------|
 * | `narrow` | ≤ 400 dp  | Collapse split views; sidebar becomes overlay |
 * | `medium` | ≤ 550 dp  | Move ViewSwitcher to a bottom bar |
 * | `wide`   | ≤ 860 dp  | Collapse outer pane in nested split views |
 *
 * Identical thresholds to `@gnome-ui/react`'s `useBreakpoint` — only the
 * measurement source differs (`useWindowDimensions` instead of
 * `window.innerWidth`/a `resize` listener).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Breakpoint.html
 */
export const GNOME_BREAKPOINTS = {
  /** ≤ 400 dp — split views collapse to single pane */
  narrow: 400,
  /** ≤ 550 dp — ViewSwitcher moves to bottom bar */
  medium: 550,
  /** ≤ 860 dp — outer pane of nested split views collapses */
  wide: 860,
} as const;

export type GnomeBreakpointName = keyof typeof GNOME_BREAKPOINTS;

export interface BreakpointState {
  /** Width ≤ 400 dp — split views are collapsed. */
  isNarrow: boolean;
  /** Width ≤ 550 dp — medium or narrower. */
  isMedium: boolean;
  /** Width ≤ 860 dp — wide or narrower. */
  isWide: boolean;
  /** Current window width in dp. */
  width: number;
}

function computeBreakpointState(width: number): BreakpointState {
  return {
    isNarrow: width <= GNOME_BREAKPOINTS.narrow,
    isMedium: width <= GNOME_BREAKPOINTS.medium,
    isWide: width <= GNOME_BREAKPOINTS.wide,
    width,
  };
}

/**
 * Tracks the window width against GNOME / libadwaita breakpoints.
 *
 * Built on `useWindowDimensions` (not `Dimensions.get` + a manual listener),
 * since it already re-renders its subscribers on every rotation/resize —
 * there is no CSS media query to lean on here, unlike the web version.
 *
 * @example
 * const { isNarrow, isMedium } = useBreakpoint();
 * // isNarrow → true when the window is ≤ 400 dp wide (split views should collapse)
 * // isMedium → true when ≤ 550 dp (use a bottom ViewSwitcher instead)
 */
export function useBreakpoint(): BreakpointState {
  const { width } = useWindowDimensions();

  return computeBreakpointState(width);
}

// ─── Responsive values ────────────────────────────────────────────────────────

/** The widest bucket, above every breakpoint, is `base`. */
export type GnomeBreakpointBucket = GnomeBreakpointName | 'base';

/**
 * A value that may vary by breakpoint: either the value itself, or a map of
 * breakpoint names to values.
 *
 * The buckets are max-widths, so the map reads like stacked `max-width`
 * media queries — `base` is the widest, and the narrowest matching entry
 * wins:
 *
 * ```ts
 * { base: 3, wide: 2, narrow: 1 }
 * // ≤ 400 dp → 1 | ≤ 860 dp → 2 | wider → 3
 * // (550 dp matches `wide`, since no `medium` entry is given)
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
 * Bucket a width falls into. The same thresholds serve `useBreakpoint` and
 * `BreakpointBin` — a breakpoint applies to whatever it's measured against,
 * window or container alike.
 *
 * A width of `0` means "not measured yet" and reports `base`, so the first
 * render matches the widest layout rather than flashing the narrowest one.
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
