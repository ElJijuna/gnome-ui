import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { Text, View } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'new' | 'accent' | 'neutral';

export interface StatusBadgeProps extends Omit<ViewProps, 'style'> {
  /**
   * Visual style. Defaults to `"neutral"`.
   * - `success` — green, for published / active states.
   * - `warning` — yellow, for beta / pending states.
   * - `error`   — red, for failed / rejected states.
   * - `new`     — purple, for newly released / featured items.
   * - `accent`  — blue, for highlighted / primary states.
   * - `neutral` — muted overlay, for draft / archived / inactive states.
   */
  variant?: StatusBadgeVariant;
  /** Short human-readable label. String/number render as a themed label; other nodes render as-is. */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface VariantColors {
  backgroundColor: string;
  color: string;
}

function getVariantColors(theme: GnomeThemeTokens, variant: StatusBadgeVariant): VariantColors {
  switch (variant) {
    case 'success':
      return { backgroundColor: theme.successBgColor, color: theme.successFgColor };
    case 'warning':
      return { backgroundColor: theme.warningBgColor, color: theme.warningFgColor };
    case 'error':
      return { backgroundColor: theme.errorBgColor, color: theme.errorFgColor };
    case 'new':
      return { backgroundColor: theme.newBgColor, color: theme.newFgColor };
    case 'accent':
      return { backgroundColor: theme.accentBgColor, color: theme.accentFgColor };
    case 'neutral':
      return { backgroundColor: theme.hoverOverlay, color: theme.windowFgColor };
  }
}

/**
 * Pill-shaped text label for entity status — published, beta, new, etc.,
 * mirroring `@gnome-ui/react`'s `StatusBadge`.
 *
 * Unlike `Badge` (numeric counts, optional anchor/dot mode), `StatusBadge`
 * is a simpler sibling designed purely for short human-readable state
 * labels — no anchor positioning, no dot mode, no counter. The variant
 * color mapping reuses `Badge`'s exact `getVariantColors` shape (this
 * component gets its own copy rather than importing `Badge`'s internal
 * helper, since it isn't exported — same small-duplicated-helper precedent
 * as `dimColor` across `TextField`/`SearchBar`/`PasswordField`), plus a
 * `new` (purple) variant `Badge` doesn't have. `neutral`'s background is
 * `theme.hoverOverlay` — a translucent overlay, matching the source CSS's
 * `--gnome-hover-overlay` exactly — rather than `Badge`'s own flat
 * `light4`/`dark2` neutral, since this component's source CSS genuinely
 * differs from `Badge`'s on that one variant.
 *
 * `children` follows the same convention `Badge` already established:
 * string/number renders as a themed `Text` label, any other node renders
 * as-is.
 *
 * @example
 * <StatusBadge variant="success">published</StatusBadge>
 * <StatusBadge variant="warning">beta</StatusBadge>
 * <StatusBadge variant="new">new</StatusBadge>
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/badges.html
 */
export const StatusBadge = ({
  variant = 'neutral',
  children,
  style,
  ...viewProps
}: StatusBadgeProps) => {
  const theme = useGnomeTheme();
  const { backgroundColor, color } = getVariantColors(theme, variant);

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingVertical: 2,
          paddingHorizontal: 8,
          borderRadius: theme.radiusPill,
          backgroundColor,
        },
        style,
      ]}
      {...viewProps}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={{
            fontFamily: theme.fontFamily,
            fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
            fontSize: 11,
            lineHeight: 15,
            letterSpacing: 0.22,
            color,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};
