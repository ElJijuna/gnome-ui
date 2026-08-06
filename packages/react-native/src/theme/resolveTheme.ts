import {
  darkTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
} from './tokens.generated';

import type { GnomeThemeTokens } from './tokens.generated';

export type GnomeColorScheme = 'light' | 'dark';
export type GnomeContrast = 'normal' | 'more';

export interface ResolveGnomeThemeOptions {
  colorScheme: GnomeColorScheme;
  /** @default 'normal' */
  contrast?: GnomeContrast;
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
