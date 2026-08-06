import { createContext, useContext, useMemo } from 'react';
import type { GnomeResolvedColorScheme, GnomeResolvedContrast } from '../theme/resolveTheme';
import type { GnomeThemeTokens } from '../theme/tokens.generated';
import { lightTheme } from '../theme/tokens.generated';
import type { GnomeAccentColor, GnomeColorScheme, GnomeContrast, GnomeDir } from './resolveContext';

export interface GnomeContextValue {
  locale: string | undefined;
  dir: GnomeDir;
  numberFormat: Intl.NumberFormatOptions | undefined;
  dateTimeFormat: Intl.DateTimeFormatOptions | undefined;
  colorScheme: GnomeColorScheme;
  resolvedColorScheme: GnomeResolvedColorScheme;
  contrast: GnomeContrast;
  resolvedContrast: GnomeResolvedContrast;
  accentColor: GnomeAccentColor;
  theme: GnomeThemeTokens;
}

export const GnomeContext = createContext<GnomeContextValue>({
  locale: undefined,
  dir: 'ltr',
  numberFormat: undefined,
  dateTimeFormat: undefined,
  colorScheme: 'system',
  resolvedColorScheme: 'light',
  contrast: 'system',
  resolvedContrast: 'normal',
  accentColor: 'blue',
  theme: lightTheme,
});

/** Returns the locale set by the nearest `GnomeProvider`, or `undefined` to use the device locale. */
export function useLocale(): string | undefined {
  return useContext(GnomeContext).locale;
}

/** Returns the text direction set by the nearest `GnomeProvider`. Defaults to the app's `I18nManager.isRTL` state. */
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

/** Returns the resolved color scheme (`"light"` or `"dark"`), accounting for the OS preference when `colorScheme` is `"system"`. */
export function useResolvedColorScheme(): GnomeResolvedColorScheme {
  return useContext(GnomeContext).resolvedColorScheme;
}

/** Returns the contrast preference set by the nearest `GnomeProvider`. Defaults to `"system"`. */
export function useContrast(): GnomeContrast {
  return useContext(GnomeContext).contrast;
}

/** Returns the resolved contrast (`"normal"` or `"more"`), accounting for the OS accessibility setting when `contrast` is `"system"`. */
export function useResolvedContrast(): GnomeResolvedContrast {
  return useContext(GnomeContext).resolvedContrast;
}

/** Returns the accent color set by the nearest `GnomeProvider`. Defaults to `"blue"`. */
export function useAccentColor(): GnomeAccentColor {
  return useContext(GnomeContext).accentColor;
}

/** Returns the fully-resolved theme tokens (colors, spacing, typography, …) for the nearest `GnomeProvider`, accent-adjusted. */
export function useGnomeTheme(): GnomeThemeTokens {
  return useContext(GnomeContext).theme;
}
