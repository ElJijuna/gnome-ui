import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Text, View } from 'react-native';

import { Avatar, type AvatarColor, type AvatarSize } from '@/components/Avatar';
import { useGnomeTheme } from '@/GnomeProvider';

export interface AvatarGroupItem {
  name?: string;
  src?: string;
  alt?: string;
  color?: AvatarColor;
}

export interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  /** Max visible avatars before showing the overflow chip. Defaults to `5`. */
  max?: number;
  /** Size applied to all avatars and the overflow chip. Defaults to `"md"`. */
  size?: AvatarSize;
  /** Accessible label for the group. Auto-generated from names when omitted. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const OVERLAP: Record<AvatarSize, number> = { sm: 6, md: 8, lg: 12, xl: 16 };
const CHIP_BOX: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 };
const CHIP_FONT_SIZE: Record<AvatarSize, number> = { sm: 8, md: 9.6, lg: 14, xl: 17.6 };

/**
 * Overlapping stack of `Avatar`s with a "+N" overflow indicator. Mirrors
 * `@gnome-ui/react`'s `AvatarGroup`.
 *
 * The web version's separating ring around each overlapping avatar is two
 * layered `box-shadow`s (an inset 1px dark/light border plus an outset 2px
 * window-colored ring) — RN can only give a `View` one border, so this
 * keeps just the outer window-colored ring (`borderWidth: 2,
 * borderColor: theme.windowBgColor`, overriding `Avatar`'s own subtle 1px
 * ring via its `style` prop), since that's the ring doing the actual
 * "stay visually distinct from the avatar behind you" work — the inner
 * hairline is a decorative nicety, not a behavior gap. The overflow chip
 * reuses `Avatar`'s own per-size box dimensions (`sm`/`md`/`lg`/`xl` →
 * 24/32/48/64) so it lines up exactly with the avatars beside it.
 *
 * `role="group"` + `accessibilityLabel` ports 1:1 from RN's newer
 * web-aligned `Role` union (the same `Avatar`/`Badge`/`LevelBar`
 * precedent) — the label is auto-generated from `avatars[].name` (joined,
 * plus "and N more" when overflowing) exactly like the web version, unless
 * overridden. The overflow chip's `+N` text is hidden from the
 * accessibility tree (`accessibilityElementsHidden`/
 * `importantForAccessibility="no"`) in favor of the chip's own
 * `accessibilityLabel="+N more"` — the same one-stop-not-two reasoning
 * `SpinButton`/`Avatar` already established for a decorative inner glyph.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Avatar.html
 */
export const AvatarGroup = ({
  avatars,
  max = 5,
  size = 'md',
  accessibilityLabel,
  style,
  testID,
}: AvatarGroupProps) => {
  const theme = useGnomeTheme();

  const visible = avatars.length > max ? avatars.slice(0, max) : avatars;
  const overflowCount = avatars.length > max ? avatars.length - max : 0;

  const allNames = avatars
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ');

  const label =
    accessibilityLabel ??
    (allNames
      ? overflowCount > 0
        ? `${allNames} and ${overflowCount} more`
        : allNames
      : 'Avatar group');

  const overlap = OVERLAP[size];

  return (
    <View
      testID={testID}
      accessible
      role="group"
      accessibilityLabel={label}
      style={[{ flexDirection: 'row', alignItems: 'center' }, style]}
    >
      {visible.map((item, index) => (
        <Avatar
          key={`${item.name ?? ''}-${item.src ?? ''}-${index}`}
          name={item.name}
          src={item.src}
          alt={item.alt ?? item.name}
          color={item.color}
          size={size}
          style={{
            marginStart: index === 0 ? 0 : -overlap,
            borderWidth: 2,
            borderColor: theme.windowBgColor,
          }}
        />
      ))}

      {overflowCount > 0 && (
        <View
          accessible
          accessibilityLabel={`+${overflowCount} more`}
          style={{
            width: CHIP_BOX[size],
            height: CHIP_BOX[size],
            marginStart: -overlap,
            borderRadius: theme.radiusPill,
            borderWidth: 2,
            borderColor: theme.windowBgColor,
            backgroundColor: theme.dark2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              fontFamily: theme.fontFamily,
              fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
              fontSize: CHIP_FONT_SIZE[size],
              color: '#fff',
            }}
          >
            {`+${overflowCount}`}
          </Text>
        </View>
      )}
    </View>
  );
};
