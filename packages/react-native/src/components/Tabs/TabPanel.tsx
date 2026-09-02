import { forwardRef, type ReactNode } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

export interface TabPanelProps extends Omit<ViewProps, 'style'> {
  /** Controls whether this panel is visible. */
  active?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Content panel associated with a `TabItem`.
 *
 * Web's `id` (paired with `TabItem`'s `panelId`, together wiring up
 * `aria-controls`) is dropped on both sides here — RN has no ARIA
 * relationship attributes for it to drive, so track which tab is active in
 * your own state (index, key, whatever) and pass the matching panel
 * `active={true}` directly, rather than reaching for an id-matching
 * convention with nothing underneath it.
 *
 * Hidden panels stay mounted with `display: 'none'` rather than being
 * conditionally unmounted — same as the web version keeping them in the
 * DOM via the `hidden` attribute — so a panel's internal state (scroll
 * position, form input, etc.) survives switching tabs away and back. RN
 * has no `"tabpanel"` value in its `AccessibilityRole` union (unlike
 * `TabBar`'s `"tablist"` and `TabItem`'s `"tab"`, both of which do exist),
 * so no role is set here — same reasoning as `Separator` dropping a role
 * RN doesn't have rather than reaching for an inaccurate substitute.
 */
export const TabPanel = forwardRef<View, TabPanelProps>(function TabPanel(
  { active = false, style, children, ...viewProps },
  ref,
) {
  return (
    <RNView ref={ref} style={[{ display: active ? 'flex' : 'none' }, style]} {...viewProps}>
      {children}
    </RNView>
  );
});
