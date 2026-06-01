import { type ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  type GnomeAccentColor,
  type GnomeColorScheme,
  GnomeContext,
  type GnomeDir,
} from './GnomeContext';

const NAMED_ACCENT_COLORS = new Set<string>([
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
]);

export interface GnomeProviderProps {
  /**
   * BCP 47 locale tag (e.g. `"es-ES"`, `"de-DE"`).
   * When omitted, components fall back to the browser locale.
   */
  locale?: string;
  /** Text direction. Defaults to `"ltr"`. */
  dir?: GnomeDir;
  /**
   * Global defaults for number formatting.
   *
   * Use `{ notation: "compact", compactDisplay: "short" }` for compact
   * values such as `1K`; omit it or set `{ notation: "standard" }` for
   * full values such as `1,000`.
   */
  numberFormat?: Intl.NumberFormatOptions;
  /** Global defaults for date/time formatting. */
  dateTimeFormat?: Intl.DateTimeFormatOptions;
  /**
   * Color scheme preference. When set to `"system"` (default), the OS
   * preference is respected via `prefers-color-scheme`. When set to
   * `"light"` or `"dark"`, the `data-theme` attribute is applied to
   * `document.documentElement` to force that theme.
   */
  colorScheme?: GnomeColorScheme;
  /**
   * Accent color. Accepts a named GNOME palette color (`"blue"`, `"green"`,
   * `"yellow"`, `"orange"`, `"red"`, `"purple"`, `"brown"`) or any CSS color
   * string (e.g. `"#ff0000"`). Named colors are theme-aware and use the
   * correct shade for light/dark mode automatically. Defaults to `"blue"`.
   */
  accentColor?: GnomeAccentColor;
  children: ReactNode;
}

function getSystemIsDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Provides locale, text direction, color scheme, and accent color to all descendant gnome-ui components. */
export function GnomeProvider({
  locale,
  dir = 'ltr',
  numberFormat,
  dateTimeFormat,
  colorScheme = 'system',
  accentColor = 'blue',
  children,
}: GnomeProviderProps) {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (colorScheme !== 'system') {
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    mq.addEventListener('change', forceUpdate);

    return () => mq.removeEventListener('change', forceUpdate);
  }, [colorScheme]);

  useEffect(() => {
    const root = document.documentElement;

    if (colorScheme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', colorScheme);
    }
  }, [colorScheme]);

  const resolvedColorScheme =
    colorScheme === 'system' ? (getSystemIsDark() ? 'dark' : 'light') : colorScheme;

  useEffect(() => {
    const root = document.documentElement;

    if (accentColor === 'blue') {
      root.style.removeProperty('--gnome-accent-color');
      root.style.removeProperty('--gnome-accent-bg-color');

      return;
    }

    if (NAMED_ACCENT_COLORS.has(accentColor)) {
      const shade = resolvedColorScheme === 'dark' ? '2' : '3';

      root.style.setProperty('--gnome-accent-color', `var(--gnome-${accentColor}-${shade})`);
      root.style.setProperty('--gnome-accent-bg-color', `var(--gnome-${accentColor}-3)`);
    } else {
      root.style.setProperty('--gnome-accent-color', accentColor);
      root.style.setProperty('--gnome-accent-bg-color', accentColor);
    }
  }, [accentColor, resolvedColorScheme]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      numberFormat,
      dateTimeFormat,
      colorScheme,
      resolvedColorScheme,
      accentColor,
    }),
    [locale, dir, numberFormat, dateTimeFormat, colorScheme, resolvedColorScheme, accentColor],
  );

  return <GnomeContext.Provider value={value}>{children}</GnomeContext.Provider>;
}
