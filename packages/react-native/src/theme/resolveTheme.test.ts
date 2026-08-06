import { describe, expect, it } from 'vitest';

import { resolveGnomeTheme } from './resolveTheme';
import {
  darkTheme,
  highContrastDarkTheme,
  highContrastTheme,
  lightTheme,
} from './tokens.generated';

describe('resolveGnomeTheme', () => {
  it('defaults to the light theme', () => {
    expect(resolveGnomeTheme({ colorScheme: 'light' })).toBe(lightTheme);
  });

  it('returns the dark theme', () => {
    expect(resolveGnomeTheme({ colorScheme: 'dark' })).toBe(darkTheme);
  });

  it('returns the high-contrast light theme', () => {
    expect(resolveGnomeTheme({ colorScheme: 'light', contrast: 'more' })).toBe(highContrastTheme);
  });

  it('returns the high-contrast dark theme', () => {
    expect(resolveGnomeTheme({ colorScheme: 'dark', contrast: 'more' })).toBe(
      highContrastDarkTheme,
    );
  });
});

describe('generated tokens', () => {
  it('resolves semantic colors against the Adwaita palette', () => {
    expect(lightTheme.accentColor).toBe(lightTheme.blue3);
    expect(darkTheme.accentColor).toBe(darkTheme.blue2);
    expect(highContrastTheme.accentColor).toBe(highContrastTheme.blue5);
    expect(highContrastDarkTheme.accentColor).toBe(highContrastDarkTheme.blue1);
  });

  it('converts rem-based font sizes to dp numbers', () => {
    expect(lightTheme.fontSizeBody).toBe(16);
    expect(lightTheme.fontSizeCaption).toBe(12);
  });

  it('converts px-based spacing to dp numbers', () => {
    expect(lightTheme.space1).toBe(6);
    expect(lightTheme.radiusMd).toBe(8);
  });

  it('exposes a single resolvable font family name', () => {
    expect(lightTheme.fontFamily).toBe('Adwaita Sans');
    expect(lightTheme.fontFamilyMono).toBe('Adwaita Mono');
  });
});
