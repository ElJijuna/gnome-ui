import { describe, expect, it } from '@jest/globals';
import { darkTheme, highContrastTheme, lightTheme } from '@/theme/tokens.generated';
import { applyAccentColor, resolveColorScheme, resolveContrast } from './resolveContext';

describe('resolveColorScheme', () => {
  it('passes explicit light/dark through unchanged', () => {
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });

  it('follows the system scheme when set to "system"', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
  });

  it('falls back to light when the system scheme is unknown', () => {
    expect(resolveColorScheme('system', null)).toBe('light');
    expect(resolveColorScheme('system', undefined)).toBe('light');
  });
});

describe('resolveContrast', () => {
  it('passes explicit normal/more through unchanged', () => {
    expect(resolveContrast('normal', true)).toBe('normal');
    expect(resolveContrast('more', false)).toBe('more');
  });

  it('follows the system signal when set to "system"', () => {
    expect(resolveContrast('system', true)).toBe('more');
    expect(resolveContrast('system', false)).toBe('normal');
  });
});

describe('applyAccentColor', () => {
  it('returns the theme unchanged for the default "blue" accent', () => {
    expect(applyAccentColor(lightTheme, 'blue', 'light', 'normal')).toBe(lightTheme);
  });

  it('resolves a named accent to the matching shade for light mode', () => {
    const theme = applyAccentColor(lightTheme, 'green', 'light', 'normal');

    expect(theme.accentColor).toBe(lightTheme.green3);
    expect(theme.accentBgColor).toBe(lightTheme.green3);
    expect(theme.focusRingColor).toBe(lightTheme.green3);
  });

  it('resolves a named accent to the matching shade for dark mode', () => {
    const theme = applyAccentColor(darkTheme, 'green', 'dark', 'normal');

    expect(theme.accentColor).toBe(darkTheme.green2);
    expect(theme.accentBgColor).toBe(darkTheme.green3);
    expect(theme.focusRingColor).toBe(darkTheme.green2);
  });

  it('does not override focusRingColor under high contrast', () => {
    const theme = applyAccentColor(highContrastTheme, 'green', 'light', 'more');

    expect(theme.accentColor).toBe(highContrastTheme.green3);
    expect(theme.focusRingColor).toBe(highContrastTheme.focusRingColor);
  });

  it('passes an arbitrary color string through as-is', () => {
    const theme = applyAccentColor(lightTheme, '#ff00ff', 'light', 'normal');

    expect(theme.accentColor).toBe('#ff00ff');
    expect(theme.accentBgColor).toBe('#ff00ff');
  });

  it('leaves unrelated tokens untouched', () => {
    const theme = applyAccentColor(lightTheme, 'green', 'light', 'normal');

    expect(theme.space2).toBe(lightTheme.space2);
    expect(theme.radiusMd).toBe(lightTheme.radiusMd);
  });
});
