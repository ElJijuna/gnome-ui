import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';

import type { TextColor } from '@/components/Text';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export type ButtonContentIconPosition = 'start' | 'end';

export interface ButtonContentProps extends Omit<ViewProps, 'style'> {
  /** Icon placed next to the label. Rendered as-is — size/color it yourself. */
  icon?: ReactNode;
  /** Text label. */
  label: string;
  /**
   * Position of the icon relative to the label.
   * @default 'start'
   */
  iconPosition?: ButtonContentIconPosition;
  /**
   * Label color. RN has no `currentColor` equivalent, so unlike the web
   * version (which inherits the parent button's text color via CSS), this
   * needs to be told explicitly which color to match — e.g. `"accent"`
   * when placed inside a `suggested` `Button`. Defaults to `"default"`.
   */
  color?: TextColor;
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon + label layout helper for buttons that contain both an icon and
 * text — the same 6 dp gap / vertically-centered row every button in this
 * package already produces internally. Mirrors `AdwButtonContent`.
 *
 * **Mostly redundant with `Button`'s own `leadingIcon`/`trailingIcon`
 * props** — pass those instead for anything that's actually a `Button`,
 * they already lay the icon and (themed, variant-colored) label out
 * identically and need no separate color prop. Reach for `ButtonContent`
 * when composing icon+label content for something that *isn't* this
 * package's `Button` — a bespoke `Pressable`, a `ButtonRow` title slot, a
 * `Chip`'s custom content — anywhere the exact same Adwaita icon/label
 * spacing convention is wanted outside `Button` itself.
 *
 * @example
 * ```tsx
 * <Pressable onPress={save}>
 *   <ButtonContent icon={<Icon icon={DocumentSave} />} label="Save" />
 * </Pressable>
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ButtonContent.html
 */
export const ButtonContent = ({
  icon,
  label,
  iconPosition = 'start',
  color = 'default',
  style,
  ...viewProps
}: ButtonContentProps) => {
  const theme = useGnomeTheme();

  const iconSlot = icon ? (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {icon}
    </View>
  ) : null;

  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', gap: theme.space1 }, style]}
      {...viewProps}
    >
      {iconPosition === 'start' && iconSlot}
      <Text variant="body" color={color}>
        {label}
      </Text>
      {iconPosition === 'end' && iconSlot}
    </View>
  );
};
