import { Close, DialogInformation, DialogWarning } from '@gnome-ui/icons';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Icon, type IconColor } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type CalloutVariant = 'info' | 'warning' | 'tip';

export interface CalloutProps extends Omit<ViewProps, 'style'> {
  /**
   * Visual emphasis level.
   * - `info` (default) — neutral, accent-colored. General contextual notes.
   * - `warning` — yellow. Recoverable problems or things to double-check.
   * - `tip` — green. Optional suggestions or shortcuts.
   */
  variant?: CalloutVariant;
  /** The message content. */
  children: ReactNode;
  /** When true a dismiss (×) button is shown at the trailing edge. */
  dismissible?: boolean;
  /** Called when the user presses the dismiss button. */
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_ICON = {
  info: DialogInformation,
  warning: DialogWarning,
  tip: DialogInformation,
};

/**
 * `Icon`'s `color` prop only accepts a fixed named-swatch palette (no
 * `currentColor`/arbitrary-hex equivalent in RN) — but `blue3`/`green4`
 * resolve to the exact same hex as `accentBgColor`/`successBgColor` in
 * every theme variant this package ships, so `info`/`tip` are an exact
 * match, not an approximation. `warning`'s `yellow4` is deliberately
 * darker than `warningBgColor` itself, the same contrast intent as the
 * source CSS's own `color-mix(in srgb, warning 70%, black)` icon tint.
 */
const VARIANT_ICON_COLOR: Record<CalloutVariant, IconColor> = {
  info: 'blue',
  warning: 'yellow',
  tip: 'green',
};

/**
 * The source CSS's `color-mix(in srgb, <color> 10%/15%, transparent)`
 * tinted backgrounds (`info`/`tip` are 10%, `warning` is 15%) have no RN
 * equivalent — resolved as an 8-digit `#RRGGBBAA` alpha suffix on the
 * variant's own hex token instead, the same substitution `Chip`'s
 * selected-state tint and `Blockquote`'s tinted backgrounds already
 * established. `0x1A` ≈ 10%, `0x26` ≈ 15%.
 */
const VARIANT_TINT: Record<CalloutVariant, string> = {
  info: '1a',
  warning: '26',
  tip: '1a',
};

/**
 * Inline, dismissible admonition box for contextual help text within forms
 * and cards. Mirrors `@gnome-ui/react`'s `Callout`.
 *
 * Unlike `Banner` (a persistent, edge-to-edge strip at the top of a view)
 * and `Toast` (a temporary notification), `Callout` is a contained, tinted
 * box meant to sit inline alongside the content it annotates.
 *
 * `role="note"` ports 1:1 from RN's newer web-aligned `Role` union (the
 * same one `Dialog`/`Tooltip` already use) — `accessible` is set alongside
 * it, per the `BoxedList` lesson that a bare `View` isn't an accessibility
 * element by default. The leading icon is decorative, hidden from
 * assistive tech the same way `Blockquote`'s own icon is.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/
 */
export const Callout = ({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  style,
  ...viewProps
}: CalloutProps) => {
  const theme = useGnomeTheme();

  const variantColor = {
    info: theme.accentBgColor,
    warning: theme.warningBgColor,
    tip: theme.successBgColor,
  }[variant];

  return (
    <View
      role="note"
      accessible
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.space2,
          padding: theme.space2,
          paddingHorizontal: theme.space3,
          borderRadius: theme.radiusMd,
          borderStartWidth: 3,
          borderStartColor: variantColor,
          backgroundColor: `${variantColor}${VARIANT_TINT[variant]}`,
        },
        style,
      ]}
      {...viewProps}
    >
      <View style={{ marginTop: 2 }} accessibilityElementsHidden importantForAccessibility="no">
        <Icon icon={VARIANT_ICON[variant]} size="md" color={VARIANT_ICON_COLOR[variant]} />
      </View>

      <Text variant="body" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </Text>

      {dismissible && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={4}
          onPress={onDismiss}
          style={({ pressed }) => [
            {
              flexShrink: 0,
              marginTop: -2,
              padding: 4,
              borderRadius: theme.radiusMd,
              opacity: pressed ? 1 : 0.6,
              backgroundColor: pressed ? theme.activeOverlay : 'transparent',
            },
          ]}
        >
          <View pointerEvents="none">
            <Icon icon={Close} size="sm" />
          </View>
        </Pressable>
      )}
    </View>
  );
};
