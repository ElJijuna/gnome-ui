import { forwardRef, type ReactNode } from 'react';
import type { PressableProps, TextStyle, View } from 'react-native';
import { Pressable, Text as RNText, View as RNView } from 'react-native';

import { useGnomeTheme } from '@/GnomeProvider';

export interface TabItemProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  /** Tab label. */
  label: string;
  /**
   * Icon placed before the label. Rendered as-is — size/color it yourself.
   * Web's `icon` takes an `@gnome-ui/icons` `IconDefinition`; this package
   * has no SVG icon system (see [[react-native-port-status]]), so it's a
   * plain `ReactNode` here instead, same as `ActionRow`'s `leading`.
   */
  icon?: ReactNode;
  /** Marks this tab as the currently selected one. */
  active?: boolean;
  /**
   * When provided, a close (×) button is rendered at the trailing edge.
   * Called when the user taps the close button.
   */
  onClose?: () => void;
  /** Accessible label for the close button. Defaults to `"Close tab"`. */
  closeLabel?: string;
  /** Optional count shown as a small badge next to the label. Values above 99 render as "99+". */
  count?: number;
  disabled?: boolean;
}

/**
 * Individual tab button inside a `TabBar`.
 *
 * Web's `panelId` (which sets `aria-controls`) is dropped — RN has no ARIA
 * relationship attributes, so there's nothing for it to wire up; keep the
 * tab ↔ panel link in your own state instead. The count badge is a small
 * inline pill rather than the web version's separate `Badge` component,
 * since `Badge` hasn't been ported to this package yet and pulling in a
 * whole new component just for this one pill would be scope creep.
 *
 * The close button is a nested `Pressable` inside the tab's own
 * `Pressable` — unlike the web version, no explicit "stop propagation" is
 * needed: RN's touch responder system grants an in-progress touch to the
 * innermost view that claims it, so pressing the close button never also
 * fires the outer tab's `onPress`. It also gets a `hitSlop` the web
 * version has no equivalent of, since its 18×18 visual size is well under
 * the ~44pt touch target guidance both major mobile platforms recommend.
 *
 * The label `Text` deliberately has no `flex: 1` (unlike the web version's
 * `.tabLabel`) — the outer `Pressable`'s width here is content-driven
 * (`minWidth`/`maxWidth`, not a definite width), and giving a `flex: 1`
 * child to a row whose own width isn't definite collapses that child to a
 * near-zero width in Yoga (confirmed visually: every label truncated to
 * 3-4 characters despite ample room). CSS flexbox resolves this fine
 * because browsers can grow a flex child within an intrinsically-sized
 * container; Yoga can't. `numberOfLines`/`ellipsizeMode` alone are enough
 * to truncate genuinely-too-long labels against `maxWidth`.
 */
export const TabItem = forwardRef<View, TabItemProps>(function TabItem(
  {
    label,
    icon,
    active = false,
    onClose,
    closeLabel = 'Close tab',
    count,
    disabled,
    ...pressableProps
  },
  ref,
) {
  const theme = useGnomeTheme();

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled: !!disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space1,
        paddingHorizontal: theme.space2,
        minWidth: 80,
        maxWidth: 200,
        minHeight: 40,
        borderRadius: theme.radiusMd,
        opacity: disabled ? theme.opacityDisabled : active ? 1 : 0.7,
        backgroundColor: active
          ? theme.activeOverlay
          : pressed
            ? theme.hoverOverlay
            : 'transparent',
      })}
      {...pressableProps}
    >
      {icon && <RNView style={{ flexShrink: 0 }}>{icon}</RNView>}

      <RNText
        numberOfLines={1}
        ellipsizeMode="tail"
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

      {count !== undefined && (
        <RNView
          style={{
            flexShrink: 0,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.accentBgColor,
          }}
        >
          <RNText
            style={{
              fontFamily: theme.fontFamily,
              fontSize: 11,
              fontWeight: '600' as TextStyle['fontWeight'],
              color: theme.accentFgColor,
            }}
          >
            {count > 99 ? '99+' : count}
          </RNText>
        </RNView>
      )}

      {onClose && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => ({
            flexShrink: 0,
            width: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radiusSm,
            backgroundColor: pressed ? theme.activeOverlay : 'transparent',
          })}
        >
          <RNText
            style={{
              fontFamily: theme.fontFamily,
              fontSize: 15,
              lineHeight: 16,
              color: theme.headerbarFgColor,
            }}
          >
            {'×'}
          </RNText>
        </Pressable>
      )}

      {active && (
        <RNView
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: theme.space2,
            right: theme.space2,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.accentBgColor,
          }}
        />
      )}
    </Pressable>
  );
});
