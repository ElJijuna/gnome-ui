import { forwardRef, type ReactNode, useContext, useImperativeHandle, useState } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Pressable, View as RNView } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';
import { countMatchingItems } from './filterUtils';
import { SidebarFilterContext, useSidebarCollapsed } from './Sidebar';

export interface SidebarSectionHandle {
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
}

export interface SidebarSectionProps extends Omit<ViewProps, 'style'> {
  /** Section heading. Omit for an untitled section (e.g. the first group in a sidebar). */
  title?: string;
  /** Icon rendered left of the title. Rendered as-is — size/color it yourself. */
  icon?: ReactNode;
  /** Whether the section body can be toggled open/closed. Defaults to `false`. */
  collapsible?: boolean;
  /** Initial open state when `collapsible` is true. Defaults to `true`. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Named group of `SidebarItem` entries inside a `Sidebar`.
 *
 * When `collapsible`, the body toggles via the header `Pressable` or
 * imperatively via a `ref` (`expand`/`collapse`/`toggle`) — same
 * `useImperativeHandle` shape as the web version's `SidebarSectionHandle`.
 * The body stays mounted and toggles `display: 'none'` rather than
 * unmounting, the same "stays mounted but hidden" approach `TabPanel` uses,
 * instead of porting the web version's animated CSS-grid collapse (no
 * established animated-height pattern exists yet in this package).
 *
 * In rail (`collapsed`) mode the header — and with it the collapse toggle —
 * is hidden and the body is always shown, matching the web version's rail
 * behavior. When a `Sidebar` filter is active and no descendant matches,
 * the whole section renders nothing.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 */
export const SidebarSection = forwardRef<SidebarSectionHandle, SidebarSectionProps>(
  function SidebarSection(
    {
      title,
      icon,
      collapsible = false,
      defaultOpen = true,
      open: controlledOpen,
      onOpenChange,
      children,
      style,
      ...viewProps
    },
    ref,
  ) {
    const theme = useGnomeTheme();
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const collapsed = useSidebarCollapsed();
    const filterValue = useContext(SidebarFilterContext);

    const setAndNotify = (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }

      onOpenChange?.(next);
    };

    useImperativeHandle(ref, () => ({
      expand: () => setAndNotify(true),
      collapse: () => setAndNotify(false),
      toggle: () => setAndNotify(!open),
    }));

    const hasVisibleChildren =
      filterValue.length === 0 || countMatchingItems(children, filterValue) > 0;

    if (!hasVisibleChildren) {
      return null;
    }

    const isOpen = collapsed ? true : open;
    const showHeader = !collapsed && !!(title || icon);

    const header = (title || icon) && (
      <RNView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space1,
          paddingHorizontal: theme.space1,
          paddingVertical: 2,
          marginTop: 4,
          marginBottom: 2,
        }}
      >
        {icon && <RNView style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</RNView>}
        {title && (
          <Text variant="caption-heading" color="dim" style={{ flex: 1 }} numberOfLines={1}>
            {title}
          </Text>
        )}
        {collapsible && (
          <Text variant="caption" color="dim" style={{ flexShrink: 0 }}>
            {open ? '▾' : '▸'}
          </Text>
        )}
      </RNView>
    );

    return (
      <RNView style={style} {...viewProps}>
        {showHeader &&
          (collapsible ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              accessibilityLabel={title}
              onPress={() => setAndNotify(!open)}
            >
              {header}
            </Pressable>
          ) : (
            header
          ))}

        <RNView
          accessible
          accessibilityRole="list"
          style={{ display: isOpen ? 'flex' : 'none', gap: 2 }}
        >
          {children}
        </RNView>
      </RNView>
    );
  },
);
