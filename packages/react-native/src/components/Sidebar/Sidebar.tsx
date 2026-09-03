import { Children, createContext, Fragment, forwardRef, type ReactNode, useContext } from 'react';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { View as RNView, ScrollView } from 'react-native';

import { Separator } from '@/components/Separator';
import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

import { isChildVisible } from './filterUtils';

// ─── Contexts ───────────────────────────────────────────────────────────────

/** Provides the collapsed state to all descendant `SidebarSection`/`SidebarItem`. */
// eslint-disable-next-line react-refresh/only-export-components
export const SidebarCollapsedContext = createContext(false);

/** Returns `true` when the nearest `Sidebar` is in collapsed (icon-only/rail) mode. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSidebarCollapsed() {
  return useContext(SidebarCollapsedContext);
}

/** Provides the active filter string to all descendant `SidebarItem`/`SidebarSection`. */
// eslint-disable-next-line react-refresh/only-export-components
export const SidebarFilterContext = createContext('');

// ─── Props ──────────────────────────────────────────────────────────────────

export interface SidebarProps extends Omit<ViewProps, 'style'> {
  children?: ReactNode;
  /**
   * When `true`, collapses the sidebar to icon-only (rail) mode. Labels and
   * section titles are hidden.
   */
  collapsed?: boolean;
  /**
   * Controlled filter string. `SidebarItem`s whose `label` does not match
   * (case-insensitive substring) are hidden, and empty `SidebarSection`s are
   * hidden entirely. Unlike the web version this never renders a search
   * input itself — pair it with your own `TextField` (or the future
   * `SearchBar` port) and drive this prop from its value.
   */
  filter?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Lateral navigation panel following the Adwaita `.navigation-sidebar` style.
 *
 * Compose with `SidebarSection` (named groups) and `SidebarItem` (rows).
 * Consecutive top-level children get a `Separator` inserted between them —
 * same divider-on-index-boundary technique `BoxedList` uses for its rows —
 * standing in for the web version's `.section + .section` adjacent-sibling
 * CSS rule, which RN has no equivalent of.
 *
 * Dropped relative to `@gnome-ui/react`'s `Sidebar`: `searchable` (would
 * pull in a `SearchBar`, not yet ported to this package — use `filter` with
 * your own input instead), `mode`/auto page-layout switch (depends on the
 * web-only `useBreakpoint` hook), `variant` (tinted/blurred backgrounds —
 * the blurred variant needs a native blur view this package doesn't depend
 * on), and the `<nav>` landmark role (RN's `AccessibilityRole` union has no
 * "navigation" value).
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 */
export const Sidebar = forwardRef<View, SidebarProps>(function Sidebar(
  { children, collapsed = false, filter = '', style, ...viewProps },
  ref,
) {
  const theme = useGnomeTheme();
  const isFilterActive = filter.length > 0;
  const items = Children.toArray(children)
    .filter(Boolean)
    .filter((child) => isChildVisible(child, filter));

  const hasMatches = !isFilterActive || items.length > 0;

  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      <SidebarFilterContext.Provider value={filter}>
        <RNView
          ref={ref}
          style={[
            {
              flexShrink: 0,
              width: collapsed ? theme.layoutSidebarRailWidth : theme.layoutSidebarDefaultWidth,
              backgroundColor: theme.sidebarBgColor,
              borderRightWidth: 1,
              borderRightColor: theme.headerbarBorderColor,
            },
            style,
          ]}
          {...viewProps}
        >
          <ScrollView contentContainerStyle={{ padding: theme.space1 }}>
            {isFilterActive && !hasMatches ? (
              <Text
                variant="caption"
                color="dim"
                style={{ textAlign: 'center', padding: theme.space4 }}
              >
                No items match your search.
              </Text>
            ) : (
              items.map((child, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: children have no natural stable id
                <Fragment key={i}>
                  {i > 0 && (
                    <Separator
                      testID="sidebar-separator"
                      style={{ marginVertical: theme.space1 }}
                    />
                  )}
                  {child}
                </Fragment>
              ))
            )}
          </ScrollView>
        </RNView>
      </SidebarFilterContext.Provider>
    </SidebarCollapsedContext.Provider>
  );
});
