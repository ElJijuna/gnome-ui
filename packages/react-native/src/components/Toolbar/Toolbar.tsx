import { forwardRef } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface ToolbarProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
}

/**
 * Horizontal action bar following the libadwaita `.toolbar` pattern —
 * mirrors `@gnome-ui/react`'s `Toolbar`. Directly portable: no web-only
 * APIs, just a flex row with fixed padding/gap.
 *
 * Provides `theme.space1` (6 dp) padding and gap — the standard spacing
 * for rows of flat buttons in header bars, action bars, and tool rows.
 * Place a `Spacer` between leading and trailing groups to push trailing
 * items to the end. Use `Button variant="flat"` for buttons that blend
 * into the bar, or `variant="raised"` for one that needs explicit
 * elevation within a flat context.
 *
 * The web CSS's `color`/`font-family` on `.toolbar` are dropped — RN has
 * no style inheritance from a parent `View` down to child `Text`
 * elements the way CSS `color` cascades, so a value here would reach
 * nothing (every child, e.g. `Button`, already sets its own explicit
 * text/icon colors).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1-latest/style-classes.html#toolbar-style-class
 */
export const Toolbar = forwardRef<View, ToolbarProps>(function Toolbar(
  { style, children, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <RNView
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space1,
          padding: theme.space1,
          minHeight: 46,
        },
        style,
      ]}
      {...viewProps}
    >
      {children}
    </RNView>
  );
});
