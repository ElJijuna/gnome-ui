import { forwardRef, type ReactNode } from 'react';
import type { StyleProp, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import { Text as RNText, View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface HeaderBarProps extends Omit<ViewProps, 'style'> {
  /** Centered title. Pass a string or a custom element. */
  title?: ReactNode;
  /** Controls placed at the leading (left) edge — back button, menu, etc. */
  start?: ReactNode;
  /** Controls placed at the trailing (right) edge — actions, overflow menu, etc. */
  end?: ReactNode;
  /**
   * When true the header bar blends into the window chrome (no bottom
   * border). Use for the topmost bar of a full-window layout.
   */
  flat?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Title bar with centered title and leading/trailing action slots.
 *
 * Mirrors the Adwaita `AdwHeaderBar` pattern. Use `flat` buttons
 * (`<Button variant="flat">`) inside the header bar per GNOME HIG.
 *
 * Rebuilt with flexbox rather than ported from `@gnome-ui/react`'s CSS
 * Grid (`1fr auto 1fr`) — RN has no grid layout, but the same true-centering
 * effect (the title stays centered in the full width regardless of how
 * wide `start`/`end` are, rather than centering only in the leftover gap
 * between them) comes from giving both side slots `flex: 1` with the title
 * left unflexed in between, since both sides then always claim equal
 * leftover space. The web version's `<header>` element has no RN
 * equivalent; `accessibilityRole="header"` is deliberately *not* applied to
 * the outer `View` since that role means "text heading" in RN's
 * accessibility tree (see `Text`'s heading variants), not "landmark
 * container" the way HTML's `<header>` does.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.HeaderBar.html
 * @see https://developer.gnome.org/hig/patterns/containers/header-bars.html
 */
export const HeaderBar = forwardRef<View, HeaderBarProps>(function HeaderBar(
  { title, start, end, flat = false, style, ...viewProps },
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
          paddingHorizontal: theme.space2,
          minHeight: 47,
          backgroundColor: theme.headerbarBgColor,
          borderBottomWidth: flat ? 0 : 1,
          borderBottomColor: theme.headerbarBorderColor,
        },
        style,
      ]}
      {...viewProps}
    >
      <RNView style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}>
        {start}
      </RNView>

      <RNView
        accessibilityLiveRegion="polite"
        style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.space1 }}
      >
        {typeof title === 'string' ? (
          <RNText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: theme.fontFamily,
              fontSize: theme.fontSizeBody,
              fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
              lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightHeading),
              color: theme.headerbarFgColor,
            }}
          >
            {title}
          </RNText>
        ) : (
          title
        )}
      </RNView>

      <RNView
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme.space1,
        }}
      >
        {end}
      </RNView>
    </RNView>
  );
});
