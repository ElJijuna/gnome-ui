import { forwardRef, type ReactNode } from 'react';
import type { StyleProp, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface PreferencesGroupProps extends Omit<ViewProps, 'style'> {
  /** Group heading. */
  title?: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Widget placed at the trailing edge of the title row (e.g. a reset `Button`). */
  headerSuffix?: ReactNode;
  /** `BoxedList` rows or any row-shaped content. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Titled section that wraps a `BoxedList` with an optional description,
 * mirroring `AdwPreferencesGroup` and `@gnome-ui/react`'s own
 * `PreferencesGroup`.
 *
 * Use it to group related settings under a named heading. The group is
 * purely a layout and labelling wrapper — it doesn't render the `BoxedList`
 * itself; pass one as `children`.
 *
 * The web's empty `.content` wrapper looks like dead markup but is
 * load-bearing, so it's kept: the group is a 12 dp-gap flex column, and
 * without that wrapper every child would become a flex item of the group and
 * pick up a 12 dp gap between the rows themselves, instead of one gap
 * between the header and the content as a whole.
 *
 * The title is `Text variant="body"` with an explicit semibold weight rather
 * than `variant="heading"`, which is body-sized but **bold** and on the
 * tighter heading line-height — the CSS `.title` is specifically semibold at
 * the body line-height. It keeps the `header` accessibility role anyway
 * (passed explicitly), since a settings-group heading is exactly the kind of
 * landmark a screen reader rotor should list — the same call `StatusPage`
 * makes for its own title.
 *
 * `min-width: 0` on the header text has no port and needs none: it's the
 * classic CSS flexbox override for a min-content floor that Yoga doesn't
 * apply in the first place.
 *
 * @example
 * <PreferencesGroup
 *   title="Appearance"
 *   description="How the app looks on this device."
 *   headerSuffix={<Button variant="flat" onPress={reset}>Reset</Button>}
 * >
 *   <BoxedList>{rows}</BoxedList>
 * </PreferencesGroup>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PreferencesGroup.html
 */
export const PreferencesGroup = forwardRef<View, PreferencesGroupProps>(function PreferencesGroup(
  { title, description, headerSuffix, children, style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const hasHeader = Boolean(title || description || headerSuffix);

  return (
    <RNView ref={ref} style={[{ gap: theme.space2 }, style]} {...viewProps}>
      {hasHeader ? (
        <RNView style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.space2 }}>
          <RNView style={{ flex: 1, gap: 2 }}>
            {title ? (
              <Text
                variant="body"
                accessibilityRole="header"
                style={{
                  fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                }}
              >
                {title}
              </Text>
            ) : null}

            {description ? (
              <Text variant="caption" color="dim">
                {description}
              </Text>
            ) : null}
          </RNView>

          {headerSuffix ? <RNView style={{ flexShrink: 0 }}>{headerSuffix}</RNView> : null}
        </RNView>
      ) : null}

      <RNView>{children}</RNView>
    </RNView>
  );
});
