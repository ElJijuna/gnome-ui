import { forwardRef, type ReactNode, useContext } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Pressable, View as RNView } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

import { SidebarFilterContext, useSidebarCollapsed } from './Sidebar';

export interface SidebarItemProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  /** Primary label. */
  label: string;
  /**
   * Icon placed at the leading edge. Rendered as-is — size/color it
   * yourself. Web's `icon` takes an `@gnome-ui/icons` `IconDefinition`;
   * this package has no SVG icon system, so it's a plain `ReactNode` here,
   * same as `ActionRow`'s `leading` and `TabItem`'s `icon`.
   */
  icon?: ReactNode;
  /** Marks this item as the currently active view. */
  active?: boolean;
  /** Trailing widget — badge, count, button, icon… */
  suffix?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Individual navigation row inside a `Sidebar` or `SidebarSection`.
 *
 * Automatically hidden (renders nothing) when the nearest `Sidebar`'s
 * `filter` is active and `label` doesn't match. In collapsed (rail) mode
 * the label and suffix are hidden and the icon centers — `label` still
 * reaches screen readers via `accessibilityLabel`.
 *
 * Dropped relative to `@gnome-ui/react`'s `SidebarItem`: `tooltip` (no
 * `Tooltip` port yet, and RN's touch-first model has no hover to trigger
 * one from), `menuItems` (context menu — no portal/positioning primitive
 * exists in this package yet), and `onDrop`/`acceptTypes` (HTML5
 * drag-and-drop has no RN equivalent without a gesture-handler dependency
 * this package doesn't have).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 */
export const SidebarItem = forwardRef<View, SidebarItemProps>(function SidebarItem(
  { label, icon, active = false, suffix, disabled, style, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();
  const collapsed = useSidebarCollapsed();
  const filterValue = useContext(SidebarFilterContext);

  const isFiltered =
    filterValue.length > 0 && !label.toLowerCase().includes(filterValue.toLowerCase());

  if (isFiltered) {
    return null;
  }

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: !!disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: 8,
          paddingHorizontal: theme.space2,
          borderRadius: theme.radiusMd,
          opacity: disabled ? theme.opacityDisabled : 1,
          backgroundColor: active
            ? theme.accentBgColor
            : pressed
              ? theme.hoverOverlay
              : 'transparent',
        },
        collapsed && { justifyContent: 'center', paddingHorizontal: 0 },
        style,
      ]}
      {...pressableProps}
    >
      {icon && <RNView style={{ flexShrink: 0, opacity: active ? 1 : 0.85 }}>{icon}</RNView>}

      {!collapsed && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            flex: 1,
            fontSize: theme.fontSizeBody,
            fontWeight: String(
              active ? theme.fontWeightSemibold : theme.fontWeightNormal,
            ) as TextStyle['fontWeight'],
            color: active ? theme.accentFgColor : theme.sidebarFgColor,
          }}
        >
          {label}
        </Text>
      )}

      {!collapsed && suffix && <RNView style={{ flexShrink: 0 }}>{suffix}</RNView>}
    </Pressable>
  );
});
