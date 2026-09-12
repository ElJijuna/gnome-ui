import { PanDown } from '@gnome-ui/icons';
import { type ReactNode, useState } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Popover } from '@/components/Popover';
import { useGnomeTheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export type SplitButtonVariant = 'default' | 'suggested' | 'destructive';

export interface SplitButtonProps {
  /** Label shown in the primary button. */
  label: string;
  /** Visual style. Applies to both the primary and toggle halves. */
  variant?: SplitButtonVariant;
  /** Content rendered inside the popover panel when the arrow is pressed. */
  dropdownContent: ReactNode;
  /** Accessible label for the dropdown toggle button. Defaults to `"More options"`. */
  dropdownLabel?: string;
  /** Called when the primary (label) half is pressed. */
  onPress?: (event: GestureResponderEvent) => void;
  /** Disables both halves. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface VariantColors {
  backgroundColor: string;
  borderColor: string;
  color: string;
  separatorColor: string;
}

/**
 * Mirrors `Button`'s own (unexported) `getVariantColors` for the
 * non-`osd`/non-pressed resting state, so the hand-rolled toggle half below
 * renders pixel-identical colors to the real `Button` used for the primary
 * half — small enough to duplicate rather than export/import across
 * components, same call as `dimColor()`'s duplication elsewhere in this
 * package.
 */
function getVariantColors(theme: GnomeThemeTokens, variant: SplitButtonVariant): VariantColors {
  switch (variant) {
    case 'suggested':
      return {
        backgroundColor: theme.accentBgColor,
        borderColor: 'transparent',
        color: theme.accentFgColor,
        separatorColor: 'rgba(255, 255, 255, 0.25)',
      };
    case 'destructive':
      return {
        backgroundColor: theme.destructiveBgColor,
        borderColor: 'transparent',
        color: theme.destructiveFgColor,
        separatorColor: 'rgba(255, 255, 255, 0.25)',
      };
    default:
      return {
        backgroundColor: theme.cardBgColor,
        borderColor: theme.light3,
        color: theme.windowFgColor,
        separatorColor: theme.light3,
      };
  }
}

/**
 * Primary action button with an attached dropdown arrow, mirroring
 * `AdwSplitButton` and `@gnome-ui/react`'s own `SplitButton`. Pressing the
 * label half fires `onPress`; pressing the arrow half opens a floating
 * panel with `dropdownContent` (menus, options, etc.).
 *
 * The primary half is a real `Button` — its resting/pressed/disabled colors
 * come for free. The arrow half is a hand-rolled `Pressable` rather than a
 * second `Button`: nesting `Popover` (whose `children` clones a prop-level
 * `accessibilityState`/`onPress` onto its trigger) around a full `Button`
 * would silently clobber `Button`'s own internal `accessibilityState={{
 * disabled }}` — RN merges a spread prop object outright, it doesn't merge
 * key-by-key — so the arrow half derives the exact same variant colors via
 * `getVariantColors` above instead, and owns `accessibilityState` itself
 * (only `{ disabled }`, letting `Popover`'s clone merge in `expanded`).
 * The two halves are visually connected by zeroing the shared inner corner
 * radii and painting a 1px separator between them, the RN equivalent of the
 * web CSS's `border-radius` split + `.separator` span.
 *
 * `Popover` supplies the floating panel, `Modal`-based positioning,
 * outside-tap dismissal, and Android back-button handling — no repositioning
 * math of its own needed here, unlike the web version's manual
 * `getBoundingClientRect`/scroll-and-resize-tracking `place()` effect.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SplitButton.html
 */
export const SplitButton = ({
  label,
  variant = 'default',
  dropdownContent,
  dropdownLabel = 'More options',
  onPress,
  disabled = false,
  style,
  testID,
}: SplitButtonProps) => {
  const theme = useGnomeTheme();
  const [open, setOpen] = useState(false);
  const colors = getVariantColors(theme, variant);
  const solid = variant === 'suggested' || variant === 'destructive';

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: 'row',
          alignSelf: 'flex-start',
          alignItems: 'stretch',
          borderRadius: theme.radiusMd,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Button
        variant={variant}
        disabled={disabled}
        onPress={onPress}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        {label}
      </Button>

      <View style={{ width: 1, backgroundColor: colors.separatorColor }} />

      <Popover content={dropdownContent} open={open} onOpenChange={setOpen} placement="bottom">
        <Pressable
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={dropdownLabel}
          accessibilityState={{ disabled }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 34,
            minWidth: 36,
            paddingHorizontal: theme.space1,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderTopRightRadius: theme.radiusMd,
            borderBottomRightRadius: theme.radiusMd,
            backgroundColor: pressed && !solid ? theme.light3 : colors.backgroundColor,
            opacity: disabled ? theme.opacityDisabled : pressed && solid ? 0.85 : 1,
          })}
        >
          <Icon
            icon={PanDown}
            size="md"
            tintColor={colors.color}
            style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
          />
        </Pressable>
      </Popover>
    </View>
  );
};
