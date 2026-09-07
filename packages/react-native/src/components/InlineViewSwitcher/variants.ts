import type { TextStyle, ViewStyle } from 'react-native';

import type { GnomeThemeTokens } from '@/theme';

export type InlineViewSwitcherVariant = 'default' | 'flat' | 'round' | 'pill';

export interface VariantStyles {
  container: ViewStyle;
  /** Same values as `container.gap`/`container.padding`, kept as plain
   *  numbers so the overflow math can add them up — `ViewStyle` types them
   *  as `DimensionValue`, which may be a percentage string. */
  gap: number;
  padding: number;
  item: ViewStyle;
  iconOnlyItem: ViewStyle;
  indicator: ViewStyle;
  /** Inset of the indicator from the container's top/bottom edge. */
  indicatorInset: number;
  activeTextColor: string;
  idleTextColor: string;
}

/**
 * The four `.default`/`.flat`/`.round`/`.pill` CSS blocks, resolved against
 * the theme. Every `color-mix(in srgb, accent N%, transparent)` becomes an
 * 8-digit `#RRGGBBAA` hex off `theme.accentBgColor` (the `Chip`/`ToggleGroup`
 * precedent, which keeps the tint following the app's configurable accent),
 * and every `box-shadow` is dropped — the theme generator keeps shadow
 * tokens in `raw` only and `Card` already settled that a border, or the
 * surface contrast itself, carries the same separation on RN.
 */
export function getVariantStyles(
  theme: GnomeThemeTokens,
  variant: InlineViewSwitcherVariant,
  isDark: boolean,
): VariantStyles {
  const surfaceBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : theme.light3;
  const accentTint = `${theme.accentBgColor}${isDark ? '40' : '26'}`;
  const accentRing = `${theme.accentBgColor}${isDark ? '80' : '66'}`;

  switch (variant) {
    case 'flat':
      return {
        container: {
          backgroundColor: 'transparent',
          borderRadius: theme.radiusMd,
          padding: 2,
          gap: 2,
        },
        gap: 2,
        padding: 2,
        item: { borderRadius: theme.radiusMd - 2, paddingHorizontal: theme.space2 },
        iconOnlyItem: { paddingHorizontal: 4, minWidth: 28 },
        indicator: { backgroundColor: accentTint, borderRadius: theme.radiusMd - 2 },
        indicatorInset: 2,
        activeTextColor: theme.accentColor,
        idleTextColor: theme.windowFgColor,
      };

    case 'round':
      return {
        container: {
          backgroundColor: theme.cardBgColor,
          borderWidth: 1,
          borderColor: surfaceBorder,
          borderRadius: theme.radiusPill,
          padding: 2,
          gap: 2,
        },
        gap: 2,
        padding: 2,
        item: { borderRadius: theme.radiusPill, paddingHorizontal: theme.space2 },
        iconOnlyItem: { paddingHorizontal: 4, minWidth: 28 },
        // The only variant whose indicator is the solid accent, not a tint.
        indicator: { backgroundColor: theme.accentBgColor, borderRadius: theme.radiusPill },
        indicatorInset: 2,
        activeTextColor: theme.accentFgColor,
        idleTextColor: theme.windowFgColor,
      };

    case 'pill':
      return {
        container: {
          backgroundColor: theme.hoverOverlay,
          borderRadius: theme.radiusPill,
          padding: 3,
          gap: 2,
        },
        gap: 2,
        padding: 3,
        item: {
          borderRadius: theme.radiusPill,
          paddingVertical: 5,
          paddingHorizontal: theme.space2,
        },
        iconOnlyItem: { paddingHorizontal: 5, minWidth: 28 },
        // Segmented-control look: the indicator is the raised card surface
        // itself, with no accent color anywhere.
        indicator: { backgroundColor: theme.cardBgColor, borderRadius: theme.radiusPill },
        indicatorInset: 3,
        activeTextColor: theme.windowFgColor,
        idleTextColor: theme.windowFgColor,
      };

    default:
      return {
        container: {
          backgroundColor: theme.cardBgColor,
          borderWidth: 1,
          borderColor: surfaceBorder,
          borderRadius: theme.radiusMd,
          padding: 2,
          gap: 2,
        },
        gap: 2,
        padding: 2,
        item: { borderRadius: theme.radiusMd - 2, paddingHorizontal: theme.space2 },
        iconOnlyItem: { paddingHorizontal: 4, minWidth: 28 },
        indicator: {
          backgroundColor: accentTint,
          borderRadius: theme.radiusMd - 2,
          borderWidth: 1,
          borderColor: accentRing,
        },
        indicatorInset: 2,
        activeTextColor: theme.accentColor,
        idleTextColor: theme.windowFgColor,
      };
  }
}

/** Shared by the item label and the menu-sheet rows. */
export function labelTextStyle(theme: GnomeThemeTokens, active: boolean, color: string): TextStyle {
  return {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBody,
    fontWeight: String(
      active ? theme.fontWeightSemibold : theme.fontWeightNormal,
    ) as TextStyle['fontWeight'],
    color,
  };
}
