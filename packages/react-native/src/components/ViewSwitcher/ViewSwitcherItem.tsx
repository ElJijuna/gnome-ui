import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, TextStyle, View } from 'react-native';
import { Pressable, Text as RNText, View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface ViewSwitcherItemProps
  extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  /** Display label. */
  label: string;
  /**
   * Icon placed before the label. Rendered as-is — size/color it yourself.
   * Web's `icon` takes an `@gnome-ui/icons` `IconDefinition`; this package
   * has no SVG icon system, so it's a plain `ReactNode` here, same as
   * `TabItem`'s `icon`.
   */
  icon?: ReactNode;
  /** Marks this item as the currently active view. */
  active?: boolean;
  disabled?: boolean;
}

/**
 * Individual option inside a `ViewSwitcher`.
 *
 * Renders with `accessibilityRole="radio"` so the group reads as a proper
 * radio group. The pressed-state tint on non-active items
 * (`theme.activeOverlay`) isn't a stand-in approximation here — its light
 * (`rgba(0, 0, 0, 0.12)`) and dark (`rgba(255, 255, 255, 0.14)`) values
 * happen to match the web version's `:active` colors exactly, so it's
 * reused directly rather than hand-rolled.
 */
export const ViewSwitcherItem = forwardRef<View, ViewSwitcherItemProps>(function ViewSwitcherItem(
  { label, icon, active = false, disabled, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: active, disabled: !!disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space1,
        paddingVertical: 5,
        paddingHorizontal: theme.space2,
        borderRadius: theme.radiusPill - 3,
        opacity: disabled ? theme.opacityDisabled : 1,
        backgroundColor: active
          ? theme.headerbarBgColor
          : pressed
            ? theme.activeOverlay
            : 'transparent',
      })}
      {...pressableProps}
    >
      {icon && <RNView style={{ flexShrink: 0 }}>{icon}</RNView>}

      <RNText
        style={{
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSizeBody,
          fontWeight: String(
            active ? theme.fontWeightSemibold : theme.fontWeightNormal,
          ) as TextStyle['fontWeight'],
          color: theme.headerbarFgColor,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
});
