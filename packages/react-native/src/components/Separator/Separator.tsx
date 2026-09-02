import { forwardRef } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends Omit<ViewProps, 'style'> {
  /** Direction of the dividing line. Defaults to `"horizontal"`. */
  orientation?: SeparatorOrientation;
  style?: StyleProp<ViewStyle>;
}

/**
 * Thin dividing line that separates groups of content.
 *
 * Color is driven entirely by `theme.cardShadeColor`, which already
 * resolves correctly per color scheme, so — unlike `Switch`/`Checkbox`/
 * `RadioButton` — there's no `useResolvedColorScheme()` branching needed
 * here.
 *
 * Rebuilt as a plain `View` rather than ported from `@gnome-ui/react`'s
 * `<hr>`/`<div role="separator">`: RN's `AccessibilityRole` union has no
 * `"separator"` value, so — since a divider carries no information a
 * screen reader user needs — it's excluded from the accessibility tree
 * entirely with `accessible={false}`, the RN-idiomatic way to mark a
 * purely decorative element, rather than reaching for a role that doesn't
 * exist.
 *
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const Separator = forwardRef<View, SeparatorProps>(function Separator(
  { orientation = 'horizontal', style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <RNView
      ref={ref}
      accessible={false}
      style={[
        { backgroundColor: theme.cardShadeColor, flexShrink: 0 },
        orientation === 'vertical'
          ? { width: 1, height: '100%', alignSelf: 'stretch' }
          : { width: '100%', height: 1 },
        style,
      ]}
      {...viewProps}
    />
  );
});
