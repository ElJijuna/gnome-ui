import type { GnomeThemeTokens } from './tokens.generated';
import {
  darkTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
} from './tokens.generated';

export type GnomeResolvedColorScheme = 'light' | 'dark';
export type GnomeResolvedContrast = 'normal' | 'more';

export interface ResolveGnomeThemeOptions {
  colorScheme: GnomeResolvedColorScheme;
  /** @default 'normal' */
  contrast?: GnomeResolvedContrast;
}

export function resolveGnomeTheme({
  colorScheme,
  contrast = 'normal',
}: ResolveGnomeThemeOptions): GnomeThemeTokens {
  if (contrast === 'more') {
    return colorScheme === 'dark' ? highContrastDarkTheme : highContrastTheme;
  }

  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
