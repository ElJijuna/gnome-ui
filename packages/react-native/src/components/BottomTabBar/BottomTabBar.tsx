import type { AnyIconDefinition } from '@gnome-ui/icons';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface BottomTabBarItem<V extends string = string> {
  /** The value reported to `onChange` when this tab is pressed. */
  value: V;
  /** Label shown below the icon. */
  label: string;
  /** Icon shown while this tab is not the selected one. */
  icon: AnyIconDefinition;
  /**
   * Icon shown while this tab *is* selected — the filled-vs-outline
   * convention iOS/Android system tab bars both use (e.g. a hollow heart
   * outline that becomes solid when active). Optional: omit to reuse
   * `icon` for both states, tinted differently.
   */
  activeIcon?: AnyIconDefinition;
  /**
   * Notification indicator. `true` renders a small dot (unread/pending,
   * no count); a `number` renders a counted badge (values above 99 render
   * as `"99+"`, matching `TabItem`'s own count-badge convention).
   */
  badge?: number | boolean;
  /** Disables this one tab. */
  disabled?: boolean;
}

export interface BottomTabBarProps<V extends string = string> {
  /** The tabs to render, in order. */
  items: BottomTabBarItem<V>[];
  /** The currently selected tab's value. */
  value: V;
  /** Called when the user presses a tab. */
  onChange: (value: V) => void;
  /**
   * Extra bottom padding, in addition to the bar's own vertical padding —
   * pass your own `useSafeAreaInsets().bottom` here so the bar clears the
   * home indicator / gesture area on notched devices. This package takes
   * no dependency on `react-native-safe-area-context` itself (the same
   * "no new peer dependency without a deliberate decision" standard
   * `AnimatedIcon`'s `react-native-svg` addition was held to) — the
   * consumer's own app almost certainly already has it for its root
   * layout, so threading the value in here is cheaper than this package
   * depending on it too. Defaults to `0`.
   */
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Fixed bottom navigation bar — the iOS/Android "tab bar" pattern (Music,
 * Instagram, most system apps): a small, fixed set of top-level
 * destinations, each an icon + label, always visible at the foot of the
 * screen. No GNOME/libadwaita widget mirrors this (desktop apps don't use
 * bottom navigation), so this is an original component for this package,
 * not a port — built to fill a real gap once mobile "modern app shell"
 * navigation was requested.
 *
 * Distinct from the existing `TabBar`/`TabItem` (an in-page, horizontally
 * scrollable content switcher mirroring `@gnome-ui/react`'s `Tabs`) — that
 * one reuses `headerbarFgColor` for every tab's label regardless of
 * selection state, signaling "active" purely via a background pill +
 * bold weight + accent underline, never by tinting the icon/label
 * themselves. A bottom tab bar's whole visual signature is the opposite:
 * the active icon+label *are* the app's accent color. `Icon`'s `color`
 * prop can't express that on its own — it only resolves to a fixed
 * named-palette swatch (`color="blue"` always means `theme.blue3`, never
 * whatever accent the app actually configured via `GnomeProvider
 * accentColor`) — so this is the first consumer of `Icon`'s new
 * `tintColor` prop, passing `theme.accentColor` directly for the selected
 * tab and leaving it unset (dimmed default) for the rest.
 *
 * The optional notification indicator reuses the real `Badge` component
 * for the dot/pill itself, but positions it manually rather than through
 * `Badge`'s own `anchor` mode — `anchor` wraps `[anchor, badge]` in a
 * `View` with a hardcoded `alignSelf: 'flex-start'`, which is fine for
 * `Badge`'s usual context (a row where the anchor is meant to hug the
 * start) but silently broke centering here: a bare icon (no badge) is a
 * direct child of this component's centered column, while a badged icon's
 * extra `anchor`-mode wrapper overrode that centering and pinned itself to
 * the left edge — the two looked visibly misaligned side by side. Every
 * tab now gets the identical `position: 'relative'` wrapper shape
 * regardless of whether it has a badge, so centering behaves identically
 * across all of them; the badge itself is a plain (non-`anchor`) `Badge`,
 * absolutely positioned and re-sized for this icon's actual scale (`size="lg"`
 * is only 20px — `Badge`'s own default dot/offset sizing assumes a much
 * larger anchor like an avatar or `IconButton`, and would otherwise nearly
 * cover the icon rather than sit as a small corner accent). Press feedback
 * is the same `pressed ? theme.activeOverlay : 'transparent'` recipe every
 * other `Pressable` in this package already uses.
 *
 * `bottomInset` stands in for real safe-area awareness without this
 * package taking on `react-native-safe-area-context` as a dependency —
 * see its own doc comment.
 *
 * @example
 * <BottomTabBar
 *   items={[
 *     { value: 'home', label: 'Home', icon: HomeOutline, activeIcon: HomeFilled },
 *     { value: 'search', label: 'Search', icon: Search },
 *     { value: 'profile', label: 'Profile', icon: Person, badge: true },
 *   ]}
 *   value={tab}
 *   onChange={setTab}
 *   bottomInset={insets.bottom}
 * />
 */
export const BottomTabBar = <V extends string = string>({
  items,
  value,
  onChange,
  bottomInset = 0,
  style,
  testID,
}: BottomTabBarProps<V>) => {
  const theme = useGnomeTheme();

  return (
    <View
      testID={testID}
      accessible
      role="tablist"
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.headerbarBgColor,
          borderTopWidth: 1,
          borderTopColor: theme.headerbarBorderColor,
          paddingTop: 8,
          paddingBottom: 4 + bottomInset,
        },
        style,
      ]}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const icon = selected ? (item.activeIcon ?? item.icon) : item.icon;
        const tint = selected ? theme.accentColor : theme.windowFgColor;

        const iconEl = (
          <Icon
            icon={icon}
            size="lg"
            tintColor={selected ? theme.accentColor : undefined}
            style={selected ? undefined : { opacity: theme.opacityDim }}
          />
        );

        return (
          <Pressable
            key={item.value}
            testID={testID ? `${testID}-${item.value}` : undefined}
            disabled={item.disabled}
            role="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled: !!item.disabled }}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              gap: 2,
              paddingVertical: 4,
              backgroundColor: pressed ? theme.activeOverlay : 'transparent',
              opacity: item.disabled ? theme.opacityDisabled : 1,
            })}
          >
            <View style={{ position: 'relative' }}>
              {iconEl}

              {item.badge !== undefined && item.badge !== false && (
                <View style={{ position: 'absolute', top: -4, end: -6 }}>
                  <Badge
                    variant="error"
                    dot={item.badge === true}
                    style={
                      item.badge === true
                        ? { minWidth: 8, height: 8 }
                        : { minWidth: 14, height: 14, paddingHorizontal: 3 }
                    }
                  >
                    {typeof item.badge === 'number'
                      ? item.badge > 99
                        ? '99+'
                        : item.badge
                      : undefined}
                  </Badge>
                </View>
              )}
            </View>

            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.fontSizeCaption,
                fontWeight: String(
                  selected ? theme.fontWeightSemibold : theme.fontWeightNormal,
                ) as TextStyle['fontWeight'],
                color: tint,
                opacity: selected ? 1 : theme.opacityDim,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
