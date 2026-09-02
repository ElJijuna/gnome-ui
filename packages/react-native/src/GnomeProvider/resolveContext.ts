import type { GnomeResolvedColorScheme, GnomeResolvedContrast } from '@/theme/resolveTheme';
import type { GnomeThemeTokens } from '@/theme/tokens.generated';

export type GnomeColorScheme = GnomeResolvedColorScheme | 'system';
export type GnomeContrast = GnomeResolvedContrast | 'system';
export type GnomeDir = 'ltr' | 'rtl';
export type GnomeNamedAccentColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'brown';
export type GnomeAccentColor = GnomeNamedAccentColor | (string & {});

export const NAMED_ACCENT_COLORS = new Set<GnomeNamedAccentColor>([
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
]);

/**
 * Resolves a `'light' | 'dark' | 'system'` preference against the OS color
 * scheme. `systemColorScheme` is typed loosely (rather than as
 * `GnomeResolvedColorScheme`) so RN's `useColorScheme()` — which can also
 * report `'unspecified'` on Android, besides `null`/`undefined` — can be
 * passed straight through; anything other than `'dark'` resolves to light.
 */
export function resolveColorScheme(
  preference: GnomeColorScheme,
  systemColorScheme: string | null | undefined,
): GnomeResolvedColorScheme {
  if (preference !== 'system') {
    return preference;
  }

  return systemColorScheme === 'dark' ? 'dark' : 'light';
}

/** Resolves a `'normal' | 'more' | 'system'` preference against the OS high-contrast setting. */
export function resolveContrast(
  preference: GnomeContrast,
  systemHighContrast: boolean,
): GnomeResolvedContrast {
  if (preference !== 'system') {
    return preference;
  }

  return systemHighContrast ? 'more' : 'normal';
}

/**
 * Returns `theme` with `accentColor`/`accentBgColor` (and, outside
 * high-contrast, `focusRingColor`) overridden for a non-default accent.
 *
 * Named palette colors (`"green"`, `"red"`, …) resolve to the matching
 * Adwaita shade for the current color scheme, mirroring
 * `@gnome-ui/react`'s `GnomeProvider`. High-contrast variants keep their
 * own fixed, maximum-contrast focus ring regardless of accent — the same
 * behavior `tokens.css` encodes by not deriving it from `--gnome-accent-color`
 * under `prefers-contrast: more`.
 */
export function applyAccentColor(
  theme: GnomeThemeTokens,
  accentColor: GnomeAccentColor,
  resolvedColorScheme: GnomeResolvedColorScheme,
  resolvedContrast: GnomeResolvedContrast,
): GnomeThemeTokens {
  if (accentColor === 'blue') {
    return theme;
  }

  const isNamed = NAMED_ACCENT_COLORS.has(accentColor as GnomeNamedAccentColor);
  const shade = resolvedColorScheme === 'dark' ? 2 : 3;
  const accent = isNamed
    ? (theme[`${accentColor}${shade}` as keyof GnomeThemeTokens] as string)
    : accentColor;
  const accentBg = isNamed
    ? (theme[`${accentColor}3` as keyof GnomeThemeTokens] as string)
    : accentColor;

  return {
    ...theme,
    accentColor: accent,
    accentBgColor: accentBg,
    ...(resolvedContrast === 'normal' ? { focusRingColor: accent } : {}),
  };
}
