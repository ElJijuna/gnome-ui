import type { IconDefinition } from '@gnome-ui/icons';
import { forwardRef } from 'react';
import type { PressableProps, TextStyle, View } from 'react-native';
import { Pressable, Text as RNText, View as RNView } from 'react-native';

import { Icon } from '@/components/Icon';
import { useGnomeTheme, useResolvedColorScheme } from '@/GnomeProvider';

import { useToggleGroup } from './ToggleGroup';

export interface ToggleGroupItemProps
  extends Omit<PressableProps, 'children' | 'style' | 'disabled' | 'onPress'> {
  /** String identifier — becomes the group's `value` when this item is selected. */
  name: string;
  /** Visible label. Omit for icon-only items (pass `accessibilityLabel` instead). */
  label?: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Accessible name. Required for icon-only items; defaults to `label`. */
  accessibilityLabel?: string;
  disabled?: boolean;
}

/**
 * Individual toggle inside a `ToggleGroup`. Can be icon-only, label-only, or
 * icon + label — for icon-only items always pass an `accessibilityLabel` so
 * screen readers can identify the option.
 *
 * The active state's three `color-mix(in srgb, accent N%, transparent)`
 * values resolve to 8-digit `#RRGGBBAA` hexes off `theme.accentBgColor`
 * (always a plain 6-digit hex), the technique `Chip` already established for
 * exactly this selected-tint problem — `26` for 15% and `66` for 40% in
 * light, `40` for 25% and `80` for 50% in dark. The CSS paints its active
 * ring as an `inset 0 0 0 1px` box-shadow, which RN has no equivalent for;
 * it becomes a real `borderWidth: 1` that every item carries at all times
 * (transparent when inactive) so selecting one never shifts the row's
 * layout — the same substitution `AvatarGroup` made for its own ring.
 *
 * `:hover` has no touch counterpart and collapses away; `:active` maps to
 * `Pressable`'s `pressed` state using `theme.activeOverlay`, whose light
 * (`rgba(0, 0, 0, 0.12)`) and dark (`rgba(255, 255, 255, 0.14)`) values are
 * character-for-character the CSS's own `:active` colors — the same
 * coincidence `ViewSwitcherItem` documented and reused. The
 * `background-color`/`box-shadow` transition is dropped rather than
 * rebuilt on `Animated`: `ViewSwitcherItem`, the closest sibling, doesn't
 * animate its own selection either, so there is no reduced-motion handling
 * to wire up here.
 *
 * The icon keeps the default foreground color instead of tracking the
 * active accent text: `Icon` has no `currentColor` equivalent, and its
 * `color` prop is a fixed GNOME palette (`blue`, `green`, …) with no
 * `accent` member — which couldn't follow the app's configurable accent
 * anyway. Same call, same reason, as `Chip`.
 *
 * `icon` is an `IconDefinition` rather than the `ReactNode` the older
 * `ViewSwitcherItem` takes; that component predates `Icon` shipping in this
 * package, while `Chip` and the web version both type it this way.
 */
export const ToggleGroupItem = forwardRef<View, ToggleGroupItemProps>(function ToggleGroupItem(
  { name, label, icon, accessibilityLabel, disabled = false, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const { value, onValueChange } = useToggleGroup();

  const active = value === name;
  const iconOnly = Boolean(icon) && !label;
  const isDark = scheme === 'dark';

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      onPress={() => onValueChange(name)}
      accessibilityRole="radio"
      accessibilityState={{ checked: active, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space1,
        minHeight: 28,
        minWidth: iconOnly ? 28 : undefined,
        paddingVertical: 4,
        paddingHorizontal: iconOnly ? 4 : theme.space2,
        borderRadius: theme.radiusMd - 2,
        borderWidth: 1,
        borderColor: active ? `${theme.accentBgColor}${isDark ? '80' : '66'}` : 'transparent',
        backgroundColor: active
          ? `${theme.accentBgColor}${isDark ? '40' : '26'}`
          : pressed && !disabled
            ? theme.activeOverlay
            : 'transparent',
        opacity: disabled ? theme.opacityDisabled : 1,
      })}
      {...pressableProps}
    >
      {icon ? (
        <RNView style={{ flexShrink: 0 }}>
          <Icon icon={icon} size="md" />
        </RNView>
      ) : null}

      {label ? (
        <RNText
          numberOfLines={1}
          style={{
            fontFamily: theme.fontFamily,
            fontSize: theme.fontSizeBody,
            fontWeight: String(
              active ? theme.fontWeightSemibold : theme.fontWeightNormal,
            ) as TextStyle['fontWeight'],
            color: active ? theme.accentColor : theme.windowFgColor,
          }}
        >
          {label}
        </RNText>
      ) : null}
    </Pressable>
  );
});
