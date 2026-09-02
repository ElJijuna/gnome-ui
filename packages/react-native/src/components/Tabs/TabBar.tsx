import { forwardRef, type ReactNode } from 'react';
import type { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScrollView as RNScrollView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface TabBarProps extends Omit<ScrollViewProps, 'style' | 'horizontal' | 'children'> {
  children?: ReactNode;
  /** Accessible label for the tab list. */
  accessibilityLabel?: string;
  /**
   * Removes the header-bar background so the tab bar blends into any surface.
   * Use when placing the bar inside a card, content area, or custom container.
   * Mirrors the `.inline` style class.
   */
  inline?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Horizontal, horizontally-scrollable tab bar that holds `TabItem` elements.
 *
 * Rebuilt on a horizontal `ScrollView` rather than ported from
 * `@gnome-ui/react`'s `overflow-x: auto` `<div role="tablist">` — RN's
 * `AccessibilityRole` union does include `"tablist"`, so that semantic
 * carries over directly, but the web version's roving-tabindex ← → / Home /
 * End keyboard navigation doesn't: RN's touch-first focus model has no
 * per-app arrow-key convention to port, so it's dropped here rather than
 * faking it.
 *
 * `style={{ flexGrow: 0 }}` on the `ScrollView` is deliberate, not
 * decorative — a horizontal `ScrollView` with no explicit `flexGrow` can
 * stretch to fill the cross-axis of whatever flex column it's placed in
 * (confirmed the hard way debugging the example app's own tab-like
 * `ControlsBar`), so it's baked in here once rather than left for every
 * consumer to rediscover.
 *
 * @see https://developer.gnome.org/hig/patterns/nav/tabs.html
 */
export const TabBar = forwardRef<ScrollView, TabBarProps>(function TabBar(
  { children, inline = false, accessibilityLabel = 'Tabs', style, ...scrollViewProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <RNScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      accessible
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexGrow: 0,
          backgroundColor: inline ? 'transparent' : theme.headerbarBgColor,
          borderBottomWidth: inline ? 0 : 1,
          borderBottomColor: theme.headerbarBorderColor,
        },
        style,
      ]}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingHorizontal: theme.space1,
        gap: 2,
        minHeight: 40,
      }}
      {...scrollViewProps}
    >
      {children}
    </RNScrollView>
  );
});
