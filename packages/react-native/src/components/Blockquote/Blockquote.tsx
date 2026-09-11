import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type BlockquoteVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

export interface BlockquoteProps extends Omit<ViewProps, 'style'> {
  /**
   * Visual emphasis style.
   * - `"default"` (default) — neutral left border; use for general quotations.
   * - `"info"`    — accent blue; use for tips and noteworthy passages.
   * - `"warning"` — yellow; use for cautionary content.
   * - `"error"`   — red; use for critical or deprecated content.
   * - `"success"` — green; use for positive or approved content.
   */
  variant?: BlockquoteVariant;
  /** Optional icon rendered to the left of the quoted text, e.g. an `<Icon>`. */
  icon?: ReactNode;
  /** Attribution rendered below the quote — author name, source title, etc. */
  cite?: ReactNode;
  /** The quoted content. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The source CSS's `color-mix(in srgb, <color> 8%, transparent)` /
 * `14%` tints (warning is the one outlier at 14%, every other variant is
 * 8%) have no RN equivalent — resolved as an 8-digit `#RRGGBBAA` alpha
 * suffix on the variant's own hex token instead, the same substitution
 * `Chip`'s selected-state tint already established. `0x14` ≈ 8%, `0x24` ≈ 14%.
 * `default` has no background tint at all in the source CSS, and its
 * border color (`theme.borderSubtle`) is already an `rgba(...)` string, not
 * a hex token — appending a hex alpha suffix to it would be invalid, so it's
 * handled separately below rather than through this table.
 */
const VARIANT_TINT: Record<Exclude<BlockquoteVariant, 'default'>, string> = {
  info: '14',
  warning: '24',
  error: '14',
  success: '14',
};

/**
 * Styled pull-quote with a colored left border, mirroring `@gnome-ui/react`'s
 * `Blockquote`. Five visual variants share the same severity scale as
 * `Banner`/`Chip`.
 *
 * `<blockquote>`/`<footer>`/`<cite>` have no RN element equivalent — this
 * renders as a plain `View` with no semantic role, the same "no landmark
 * role available" gap `PathBar`'s dropped `<nav>` and `HeaderBar`'s dropped
 * `<header>` already established; the quoted text and citation are plain
 * `Text` reads with no assistive-tech grouping to port.
 *
 * @example
 * <Blockquote variant="info" cite="Ada Lovelace, 1842">
 *   The Analytical Engine has no pretensions to originate anything.
 * </Blockquote>
 *
 * @see https://developer.gnome.org/hig/
 */
export const Blockquote = ({
  variant = 'default',
  icon,
  cite,
  children,
  style,
  ...viewProps
}: BlockquoteProps) => {
  const theme = useGnomeTheme();

  let borderColor = theme.borderSubtle;
  let backgroundColor = 'transparent';

  if (variant !== 'default') {
    const variantColor = {
      info: theme.accentBgColor,
      warning: theme.warningBgColor,
      error: theme.errorBgColor,
      success: theme.successBgColor,
    }[variant];

    borderColor = variantColor;
    backgroundColor = `${variantColor}${VARIANT_TINT[variant]}`;
  }

  return (
    <View
      style={[
        {
          paddingVertical: theme.space2,
          paddingHorizontal: theme.space3,
          borderLeftWidth: 3,
          borderLeftColor: borderColor,
          borderTopRightRadius: theme.radiusSm,
          borderBottomRightRadius: theme.radiusSm,
          backgroundColor,
        },
        style,
      ]}
      {...viewProps}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space2 }}>
        {icon && (
          <View style={{ marginTop: 2 }} accessibilityElementsHidden importantForAccessibility="no">
            {icon}
          </View>
        )}

        <Text variant="body" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </Text>
      </View>

      {cite !== undefined && (
        <View style={{ marginTop: theme.space1 }}>
          <Text variant="caption" color="dim">
            {cite}
          </Text>
        </View>
      )}
    </View>
  );
};
