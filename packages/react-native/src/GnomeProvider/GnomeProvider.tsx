import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  I18nManager,
  Platform,
  useColorScheme as useSystemColorScheme,
} from 'react-native';
import { resolveGnomeTheme } from '@/theme/resolveTheme';
import { GnomeContext } from './GnomeContext';
import type { GnomeAccentColor, GnomeColorScheme, GnomeContrast, GnomeDir } from './resolveContext';
import { applyAccentColor, resolveColorScheme, resolveContrast } from './resolveContext';

export interface GnomeProviderProps {
  /** BCP 47 locale tag (e.g. `"es-ES"`, `"de-DE"`). When omitted, components fall back to the device locale. */
  locale?: string;
  /**
   * Text direction exposed via context for consumers to branch on (e.g.
   * mirroring icons or flipping a row's layout). Defaults to the app's
   * actual `I18nManager.isRTL` state.
   *
   * Unlike the web `GnomeProvider`, this does **not** call
   * `I18nManager.forceRTL()` — RN's layout direction is a single global
   * flag that requires an app reload to take effect and is normally set
   * once at app bootstrap, not scoped per provider tree.
   */
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
   * Color scheme preference. `"system"` (default) follows
   * `Appearance`/`useColorScheme()`. `"light"`/`"dark"` force that scheme
   * regardless of the OS setting.
   * @default 'system'
   */
  colorScheme?: GnomeColorScheme;
  /**
   * High-contrast preference. `"system"` (default) follows the OS
   * accessibility setting where one exists — Android's "High text
   * contrast" (`AccessibilityInfo.isHighTextContrastEnabled`) or iOS's
   * "Increase Contrast" (`AccessibilityInfo.isDarkerSystemColorsEnabled`)
   * — and falls back to `"normal"` where neither is available (e.g. web).
   * @default 'system'
   */
  contrast?: GnomeContrast;
  /**
   * Accent color. Accepts a named GNOME palette color (`"blue"`, `"green"`,
   * `"yellow"`, `"orange"`, `"red"`, `"purple"`, `"brown"`) or any RN color
   * string (e.g. `"#ff0000"`, `"rgba(0, 0, 0, 0.5)"`). Named colors are
   * theme-aware and use the correct shade for light/dark mode
   * automatically. Defaults to `"blue"`.
   */
  accentColor?: GnomeAccentColor;
  children: ReactNode;
}

/**
 * Subscribes to the OS high-contrast accessibility setting.
 *
 * Android exposes "High text contrast"; iOS exposes "Increase Contrast"
 * (surfaced through `AccessibilityInfo`'s "darker system colors" API,
 * which is what that setting maps to natively). Neither exists on other
 * platforms, so this resolves to `false` there.
 */
function useSystemHighContrast(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query =
      Platform.OS === 'android'
        ? AccessibilityInfo.isHighTextContrastEnabled
        : Platform.OS === 'ios'
          ? AccessibilityInfo.isDarkerSystemColorsEnabled
          : undefined;

    if (!query) {
      return;
    }

    let mounted = true;

    (async () => {
      const value = await query();

      if (mounted) {
        setEnabled(value);
      }
    })();

    const eventName =
      Platform.OS === 'android' ? 'highTextContrastChanged' : 'darkerSystemColorsChanged';
    const subscription = AccessibilityInfo.addEventListener(eventName, setEnabled);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}

/** Provides locale, text direction, color scheme, contrast, accent color, and resolved theme tokens to all descendant gnome-ui components. */
export const GnomeProvider = ({
  locale,
  dir,
  numberFormat,
  dateTimeFormat,
  colorScheme = 'system',
  contrast = 'system',
  accentColor = 'blue',
  children,
}: GnomeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();
  const systemHighContrast = useSystemHighContrast();

  const resolvedColorScheme = resolveColorScheme(colorScheme, systemColorScheme);
  const resolvedContrast = resolveContrast(contrast, systemHighContrast);
  const resolvedDir = dir ?? (I18nManager.isRTL ? 'rtl' : 'ltr');

  const value = useMemo(() => {
    const variantTheme = resolveGnomeTheme({
      colorScheme: resolvedColorScheme,
      contrast: resolvedContrast,
    });
    const theme = applyAccentColor(
      variantTheme,
      accentColor,
      resolvedColorScheme,
      resolvedContrast,
    );

    return {
      locale,
      dir: resolvedDir,
      numberFormat,
      dateTimeFormat,
      colorScheme,
      resolvedColorScheme,
      contrast,
      resolvedContrast,
      accentColor,
      theme,
    };
  }, [
    locale,
    resolvedDir,
    numberFormat,
    dateTimeFormat,
    colorScheme,
    resolvedColorScheme,
    contrast,
    resolvedContrast,
    accentColor,
  ]);

  return <GnomeContext.Provider value={value}>{children}</GnomeContext.Provider>;
};
