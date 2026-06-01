import { createContext, useContext, useMemo } from 'react';

export type GnomeDir = 'ltr' | 'rtl';
export type GnomeColorScheme = 'light' | 'dark' | 'system';
export type GnomeNamedAccentColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'brown';
export type GnomeAccentColor = GnomeNamedAccentColor | (string & {});

export interface GnomeContextValue {
  locale: string | undefined;
  dir: GnomeDir;
  numberFormat: Intl.NumberFormatOptions | undefined;
  dateTimeFormat: Intl.DateTimeFormatOptions | undefined;
  colorScheme: GnomeColorScheme;
  resolvedColorScheme: 'light' | 'dark';
  accentColor: GnomeAccentColor;
}

export const GnomeContext = createContext<GnomeContextValue>({
  locale: undefined,
  dir: 'ltr',
  numberFormat: undefined,
  dateTimeFormat: undefined,
  colorScheme: 'system',
  resolvedColorScheme: 'light',
  accentColor: 'blue',
});

/** Returns the locale set by the nearest `GnomeProvider`, or `undefined` to use the browser locale. */
export function useLocale(): string | undefined {
  return useContext(GnomeContext).locale;
}

/** Returns the text direction set by the nearest `GnomeProvider`. Defaults to `"ltr"`. */
export function useDir(): GnomeDir {
  return useContext(GnomeContext).dir;
}

/** Returns an `Intl.NumberFormat` configured from `GnomeProvider` defaults plus local overrides. */
export function useNumberFormatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const { locale, numberFormat } = useContext(GnomeContext);

  return useMemo(
    () => new Intl.NumberFormat(locale, { ...numberFormat, ...options }),
    [locale, numberFormat, options],
  );
}

/** Returns an `Intl.DateTimeFormat` configured from `GnomeProvider` defaults plus local overrides. */
export function useDateTimeFormatter(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const { locale, dateTimeFormat } = useContext(GnomeContext);

  return useMemo(
    () => new Intl.DateTimeFormat(locale, { ...dateTimeFormat, ...options }),
    [locale, dateTimeFormat, options],
  );
}

/** Returns the color scheme preference set by the nearest `GnomeProvider`. Defaults to `"system"`. */
export function useColorScheme(): GnomeColorScheme {
  return useContext(GnomeContext).colorScheme;
}

/** Returns the resolved color scheme (`"light"` or `"dark"`), accounting for the system preference when `colorScheme` is `"system"`. */
export function useResolvedColorScheme(): 'light' | 'dark' {
  return useContext(GnomeContext).resolvedColorScheme;
}

/** Returns the accent color set by the nearest `GnomeProvider`. Defaults to `"blue"`. */
export function useAccentColor(): GnomeAccentColor {
  return useContext(GnomeContext).accentColor;
}
