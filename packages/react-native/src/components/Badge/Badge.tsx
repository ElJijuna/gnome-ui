import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Text, View } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';
import type { GnomeResolvedColorScheme, GnomeThemeTokens } from '@/theme';

export type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeProps {
  /**
   * Visual style. Defaults to `"accent"`.
   * - `accent`  — blue, for counts and highlights.
   * - `success` — green, for positive status.
   * - `warning` — yellow, for cautionary status.
   * - `error`   — red, for failures or urgent counts.
   * - `neutral` — gray, for inactive or secondary counts.
   */
  variant?: BadgeVariant;
  /**
   * When true, renders a small dot with no label — used for unread/online indicators.
   * The `children` are ignored in dot mode.
   */
  dot?: boolean;
  /** Number or short text to display. Keep to 1–3 characters. String/number render as a themed label; other nodes render as-is. */
  children?: ReactNode;
  /**
   * When provided, the badge is positioned over this child element at the
   * top-right corner.
   */
  anchor?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface VariantColors {
  backgroundColor: string;
  color: string;
}

function getVariantColors(
  theme: GnomeThemeTokens,
  colorScheme: GnomeResolvedColorScheme,
  variant: BadgeVariant,
): VariantColors {
  switch (variant) {
    case 'accent':
      return { backgroundColor: theme.accentBgColor, color: theme.accentFgColor };
    case 'success':
      return { backgroundColor: theme.successBgColor, color: theme.successFgColor };
    case 'warning':
      return { backgroundColor: theme.warningBgColor, color: theme.warningFgColor };
    case 'error':
      return { backgroundColor: theme.errorBgColor, color: theme.errorFgColor };
    case 'neutral':
      return {
        backgroundColor: colorScheme === 'dark' ? theme.dark2 : theme.light4,
        color: theme.windowFgColor,
      };
  }
}

/**
 * Counter or status indicator, optionally overlaid on another element.
 *
 * Rebuilt with `View`/`Text` rather than ported from `@gnome-ui/react`'s
 * DOM-based JSX, but mirrors its prop API. `children` renders as a themed
 * `Text` label when it's a string or number (the common case — counts and
 * short text); any other node renders as-is, the same convention `Button`'s
 * `children` already established.
 *
 * The web CSS's `box-shadow: 0 0 0 2px var(--gnome-window-bg-color)` ring
 * (always present, separating the badge from whatever's behind it) has no
 * RN equivalent that avoids affecting layout — RN's `border*` shrinks the
 * content box instead of drawing outside it. Reproduced instead with an
 * outer wrapping `View` (2px padding, `theme.windowBgColor` background,
 * pill radius) around the actual colored badge, so the ring appears to
 * spread outward exactly like the web version's non-blurred shadow, without
 * eating into the badge's own text padding.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/badges.html
 */
export const Badge = ({ variant = 'accent', dot = false, children, anchor, style }: BadgeProps) => {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();
  const { backgroundColor, color } = getVariantColors(theme, colorScheme, variant);

  const badgeEl = (
    <View
      testID="badge-ring"
      style={[
        {
          padding: 2,
          borderRadius: theme.radiusPill,
          backgroundColor: theme.windowBgColor,
        },
        anchor
          ? {
              position: 'absolute' as const,
              top: dot ? -2 : -4,
              right: dot ? -2 : -4,
              zIndex: 1,
            }
          : null,
      ]}
    >
      <View
        testID="badge"
        style={[
          {
            minWidth: dot ? 10 : 18,
            height: dot ? 10 : 18,
            paddingHorizontal: dot ? 0 : 5,
            borderRadius: theme.radiusPill,
            backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        {!dot &&
          (typeof children === 'string' || typeof children === 'number' ? (
            <Text
              style={{
                fontFamily: theme.fontFamily,
                fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                fontSize: 11,
                lineHeight: 13,
                color,
              }}
            >
              {children}
            </Text>
          ) : (
            children
          ))}
      </View>
    </View>
  );

  if (anchor) {
    return (
      <View style={{ alignSelf: 'flex-start' }}>
        {anchor}
        {badgeEl}
      </View>
    );
  }

  return badgeEl;
};
