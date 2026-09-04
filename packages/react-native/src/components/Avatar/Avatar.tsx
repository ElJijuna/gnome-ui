import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Image, Text, View } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Named color palette for the initials fallback.
 * Mirrors libadwaita's avatar color set.
 */
export type AvatarColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'brown'
  | 'teal'
  | 'slate';

export interface AvatarProps {
  /**
   * Full name used to generate initials and — when `color` is omitted —
   * to deterministically pick a background color.
   */
  name?: string;
  /** Image URL. When provided the initials fallback is hidden. */
  src?: string;
  /** Accessible label. Defaults to `name`, then `"Avatar"`. */
  alt?: string;
  /** Size of the avatar. Defaults to `"md"`. */
  size?: AvatarSize;
  /**
   * Override the auto-derived background color for the initials fallback.
   * When omitted a color is derived from `name` via a stable hash.
   */
  color?: AvatarColor;
  style?: StyleProp<ViewStyle>;
}

const COLOR_LIST: AvatarColor[] = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
  'teal',
  'slate',
];

const SIZE_BOX: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 };

/**
 * Initials font size as a multiple of the theme's base body size — ports the
 * source CSS's `.initials { font-size: 0.42em }` overridden per size
 * (`sm` 0.5em, `md` 0.6em, `lg` 1em, `xl` 1.4em), which is relative to the
 * *inherited* ambient font size (the avatar box itself sets none), not to
 * the avatar's own box size.
 */
const SIZE_INITIALS_RATIO: Record<AvatarSize, number> = { sm: 0.5, md: 0.6, lg: 1, xl: 1.4 };

/** Stable, non-cryptographic hash → index into COLOR_LIST. */
function nameToColor(name: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }

  return COLOR_LIST[hash % COLOR_LIST.length];
}

/** Extract up to 2 initials from a name string. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

interface ColorSwatch {
  backgroundColor: string;
  initialsColor: string;
}

function getColorSwatch(theme: GnomeThemeTokens, color: AvatarColor): ColorSwatch {
  switch (color) {
    case 'blue':
      return { backgroundColor: theme.blue3, initialsColor: '#fff' };
    case 'green':
      return { backgroundColor: theme.green4, initialsColor: '#fff' };
    case 'yellow':
      // Yellow needs dark initials for contrast, independent of color scheme.
      return { backgroundColor: theme.yellow4, initialsColor: 'rgba(0, 0, 0, 0.8)' };
    case 'orange':
      return { backgroundColor: theme.orange4, initialsColor: '#fff' };
    case 'red':
      return { backgroundColor: theme.red3, initialsColor: '#fff' };
    case 'purple':
      return { backgroundColor: theme.purple3, initialsColor: '#fff' };
    case 'brown':
      return { backgroundColor: theme.brown3, initialsColor: '#fff' };
    case 'teal':
      // Not a real @gnome-ui/core token — the web CSS hardcodes this hex too.
      return { backgroundColor: '#2190a4', initialsColor: '#fff' };
    case 'slate':
      return { backgroundColor: theme.dark2, initialsColor: '#fff' };
  }
}

/**
 * Circular avatar with image or initials fallback.
 *
 * Follows the Adwaita `AdwAvatar` pattern — deterministic color from name,
 * up to two initials when no image is supplied. Rebuilt with `View`/`Image`/
 * `Text` rather than ported from `@gnome-ui/react`'s DOM-based JSX, but
 * mirrors its prop API and color-hash/initials math (pure JS, ported
 * verbatim).
 *
 * The outer container carries `role="img"` + `accessibilityLabel` — RN's
 * newer web-aligned `Role` union has an `"img"` value, a direct 1:1 port of
 * the web version's `role="img"`, no substitution needed (same as
 * `ProgressBar`'s `role="progressbar"`). The image/initials underneath are
 * hidden from the accessibility tree
 * (`accessibilityElementsHidden`/`importantForAccessibility="no"`, mirroring
 * the web version's `aria-hidden` on both), so a screen reader gets one
 * stop, not two — same reasoning as `SpinButton`'s hidden −/+ buttons.
 *
 * The web CSS's `box-shadow: inset 0 0 0 1px …` ring (drawn on top, doesn't
 * affect layout) becomes a real 1px `borderWidth`/`borderColor` here (RN has
 * no inset shadow) — the same substitution `Slider`'s thumb border already
 * used for a ring effect, at the cost of a negligible 1px content-box inset
 * the web version doesn't have.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Avatar.html
 */
export const Avatar = ({ name = '', src, alt, size = 'md', color, style }: AvatarProps) => {
  const theme = useGnomeTheme();
  const resolvedColorScheme = useResolvedColorScheme();

  const resolvedColor = color ?? (name ? nameToColor(name) : 'blue');
  const initials = getInitials(name);
  const box = SIZE_BOX[size];
  const { backgroundColor, initialsColor } = getColorSwatch(theme, resolvedColor);
  const ringColor =
    resolvedColorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <View
      accessible
      role="img"
      accessibilityLabel={alt ?? (name || undefined) ?? 'Avatar'}
      style={[
        {
          width: box,
          height: box,
          borderRadius: theme.radiusPill,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: src ? undefined : backgroundColor,
          borderWidth: 1,
          borderColor: ringColor,
        },
        style,
      ]}
    >
      {src ? (
        <Image
          testID="avatar-image"
          source={{ uri: src }}
          accessibilityElementsHidden
          importantForAccessibility="no"
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            fontFamily: theme.fontFamily,
            fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
            fontSize: theme.fontSizeBody * SIZE_INITIALS_RATIO[size],
            lineHeight: theme.fontSizeBody * SIZE_INITIALS_RATIO[size],
            color: initialsColor,
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};
