import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { Pressable, Text as RNText, View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps extends Omit<ViewProps, 'style'> {
  /**
   * Visual emphasis level.
   * - `info` (default) — neutral, accent-colored. Use for tips and notices.
   * - `warning` — yellow. Use for recoverable problems.
   * - `error` — red. Use for failures that need attention.
   * - `success` — green. Use for confirmations.
   */
  variant?: BannerVariant;
  /** The message text. Keep it short — one or two sentences. */
  children: ReactNode;
  /**
   * Label for the optional action button placed at the trailing end.
   * When provided, `onAction` should also be supplied.
   */
  actionLabel?: string;
  /** Called when the user presses the action button. */
  onAction?: () => void;
  /**
   * When true a dismiss (×) button is shown at the trailing edge.
   * Provide `onDismiss` to handle removal from the list.
   */
  dismissible?: boolean;
  /** Called when the user presses the dismiss button. */
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Persistent message strip displayed at the top of a view, following the
 * Adwaita `AdwBanner` pattern. Use for important information that persists
 * until the user acts or explicitly dismisses it — unlike `Toast`, it never
 * auto-dismisses.
 *
 * RN's `AccessibilityRole` union has no "status" value (the web version's
 * `role="status"`); `"alert"` is the closest available role, paired with
 * `accessibilityLiveRegion="polite"` (Android's live-region API) as the
 * nearest match to `aria-live="polite"` — the same substitution `Toast`
 * already established for the identical web role pair. Since the banner
 * itself is a plain `View` (not `Pressable` — only its buttons are
 * interactive), `accessible` is set explicitly alongside `accessibilityRole`,
 * per the `BoxedList` lesson that a bare `View` isn't an accessibility
 * element by default.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Banner.html
 * @see https://developer.gnome.org/hig/patterns/feedback/banners.html
 */
export const Banner = ({
  variant = 'info',
  children,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  style,
  ...viewProps
}: BannerProps) => {
  const theme = useGnomeTheme();

  const colors = {
    info: { bg: theme.accentBgColor, fg: theme.accentFgColor },
    warning: { bg: theme.warningBgColor, fg: theme.warningFgColor },
    error: { bg: theme.errorBgColor, fg: theme.errorFgColor },
    success: { bg: theme.successBgColor, fg: theme.successFgColor },
  }[variant];

  // Mirrors the source CSS's per-variant :active overlay: a light overlay on
  // the darker info/error/success backgrounds, a dark one on the light
  // warning background.
  const pressedOverlay =
    variant === 'warning' ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.25)';

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: 10,
          paddingHorizontal: theme.space4,
          minHeight: 44,
          width: '100%',
          backgroundColor: colors.bg,
        },
        style,
      ]}
      {...viewProps}
    >
      <Text variant="body" style={{ flex: 1, minWidth: 0, color: colors.fg }}>
        {children}
      </Text>

      {(actionLabel || dismissible) && (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space1, flexShrink: 0 }}
        >
          {actionLabel && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              onPress={onAction}
              style={({ pressed }) => ({
                paddingVertical: 4,
                paddingHorizontal: theme.space2,
                borderRadius: theme.radiusMd,
                backgroundColor: pressed ? pressedOverlay : 'transparent',
              })}
            >
              <RNText
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSizeBody,
                  fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                  color: colors.fg,
                }}
              >
                {actionLabel}
              </RNText>
            </Pressable>
          )}

          {dismissible && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={4}
              onPress={onDismiss}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radiusMd,
                opacity: pressed ? 1 : 0.6,
                backgroundColor: pressed ? pressedOverlay : 'transparent',
              })}
            >
              <RNText style={{ fontSize: theme.fontSizeBody, color: colors.fg }}>{'×'}</RNText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};
