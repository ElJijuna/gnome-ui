import type { IconDefinition } from '@gnome-ui/icons';
import { Close } from '@gnome-ui/icons';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, BackHandler, Dimensions, Easing, Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'classic' | 'wide';

export interface DrawerRailItem {
  /** Stable unique identifier. */
  id: string;
  /** Icon shown for this rail entry. */
  icon: IconDefinition;
  /** Accessible name, also used as the tooltip. */
  label: string;
  /** Whether this entry represents the currently visible drawer/panel. */
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface DrawerProps {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Edge that the drawer slides in from. Defaults to `"right"`. */
  side?: DrawerSide;
  /** Preset drawer width. Defaults to `"classic"`. */
  size?: DrawerSize;
  /** Optional drawer heading. */
  title?: ReactNode;
  /** Drawer content when a prop is preferred over `children`. */
  content?: ReactNode;
  /** Drawer content. Used when `content` is not provided. */
  children?: ReactNode;
  /** Called when the user dismisses the drawer with the Android back button or the backdrop. */
  onClose?: () => void;
  /** Whether pressing the backdrop closes the drawer. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /**
   * Narrow icon rail rendered on the drawer's inner edge (the edge facing
   * the backdrop), for switching between related drawers or panels without
   * closing the drawer. Purely presentational — pressing an entry only
   * calls its `onPress`; the caller decides what happens (swap `content`,
   * open a different drawer, etc).
   */
  rail?: DrawerRailItem[];
  style?: StyleProp<ViewStyle>;
  /** Forwarded to the backdrop — useful for testing. */
  testID?: string;
}

const DrawerDepthContext = createContext(0);

const DRAWER_PRESET_WIDTH: Record<DrawerSize, number> = { classic: 420, wide: 640 };
const DRAWER_DEPTH_SCALE = 0.85;
const DRAWER_MIN_WIDTH = 240;

/**
 * Slide-in panel for supplementary content, anchored to the left or right
 * edge. Mirrors `@gnome-ui/react`'s `Drawer`.
 *
 * Rebuilt with `View`/`Modal` rather than ported from the web version's
 * `createPortal(document.body)` + manual focus trap + Escape listener:
 * `Modal` already floats above everything with no portal target needed,
 * and `BackHandler`'s `hardwareBackPress` is the Android analog of the
 * Escape listener (the same `Dialog`/`BottomSheet` precedent). Focus
 * trapping has no port — no DOM `Tab`/`document.activeElement` concept in
 * RN's touch-first model.
 *
 * **Floats with a margin on every side, all four corners rounded** — the
 * backdrop `Pressable` carries `padding: theme.space3` (matching the
 * `@gnome-ui/react` source's own recent update to the same floating-card
 * look, not a divergence), and the drawer itself gets a uniform
 * `borderRadius` instead of the flat-edge-on-the-anchored-side look a
 * flush-to-the-screen-edge panel would need. Positioning within that
 * padded backdrop uses `justifyContent: 'flex-end'`/`'flex-start'` on the
 * backdrop (not the web CSS's `margin-left/right: auto` on the drawer
 * itself) — confirmed empirically (a throwaway build with saturated debug
 * colors standing in for the real theme colors, screenshotted on-device)
 * that `justifyContent` renders correctly while auto-margins were, at
 * best, unverified for this RN/Yoga version; `BottomSheet` already proves
 * the same `justifyContent: 'flex-end'` mechanism works on this exact
 * setup, just on the vertical axis instead of horizontal. On a phone-width
 * screen the `classic`/`wide` presets (420/640, sized for wider viewports)
 * get capped to fill essentially the entire available width after the
 * margin either way, so the anchored side becomes visually obvious mainly
 * on tablets — the same responsive behavior the web version would show at
 * an equally narrow browser width, not an RN-specific gap.
 *
 * **No drag-to-dismiss, unlike `BottomSheet`**: the web source only
 * defines entrance keyframes for both the backdrop and the panel, so this
 * follows `Dialog`'s simpler shape (a single `progress` `Animated.Value`
 * replayed via `useEffect` keyed on `open`, no separate exit animation or
 * lagging `visible` state) rather than `BottomSheet`'s
 * `PanResponder`-plus-timed-exit machinery.
 *
 * **The slide distance needs no `onLayout` measurement**, unlike
 * `BottomSheet`'s content-driven height: the drawer's width is a value
 * this component already computes in JS (`size`'s preset, scaled down by
 * `DrawerDepthContext` depth, capped by the available space after the
 * backdrop's margin) — RN's `transform` has no percentage-of-self units
 * (the same `BottomSheet`/`Avatar`/`Slider` pitfall), but since the exact
 * pixel width is already known synchronously, `translateX` can animate
 * from that known offset to `0` immediately, with no first-frame
 * imprecision to accept.
 *
 * **`DrawerDepthContext` (nested-drawer width auto-scaling) ports 1:1** —
 * pure React Context state, no DOM dependency at all. A `Drawer` opened
 * from within another drawer's `content`/`children` is detected via
 * context and scales its own preset width down (`0.85^depth`, floored at
 * `DRAWER_MIN_WIDTH`) so stacked drawers read as a drill-in hierarchy
 * instead of identical overlapping panels.
 *
 * **`rail` reuses the newly-added `IconButton`** (itself just `Button` +
 * `Icon` + optional `Tooltip`, the same composition `@gnome-ui/react`'s own
 * `IconButton` already is) — `aria-pressed` becomes
 * `accessibilityState={{ selected: item.active }}`, the closest RN
 * equivalent for a toggleable icon button with no dedicated visual
 * "pressed" style on either platform's source.
 *
 * `backdrop-filter: blur(4px)` has no port — no native blur view
 * dependency exists in this package, the same gap already dropped from
 * `Sidebar`'s blurred `variant`/`BottomSheet`'s backdrop. `role="dialog"` +
 * `accessibilityViewIsModal` port 1:1 from `Dialog`'s own precedent.
 *
 * @see https://developer.gnome.org/hig/patterns/containers.html
 */
export const Drawer = ({
  open,
  side = 'right',
  size = 'classic',
  title,
  content,
  children,
  onClose,
  closeOnBackdrop = true,
  rail,
  style,
  testID,
}: DrawerProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();
  const depth = useContext(DrawerDepthContext);

  const body = content !== undefined ? content : children;

  const presetWidth = DRAWER_PRESET_WIDTH[size];
  const scaledWidth =
    depth > 0
      ? Math.max(DRAWER_MIN_WIDTH, Math.round(presetWidth * DRAWER_DEPTH_SCALE ** depth))
      : presetWidth;
  const maxAvailableWidth = Dimensions.get('window').width - theme.space3 * 2;
  const drawerWidth = Math.min(scaledWidth, maxAvailableWidth);

  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    progress.setValue(0);

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [open, reducedMotion, progress, theme.durationNormal, theme.easingDefault]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose?.();

      return true;
    });

    return () => subscription.remove();
  }, [open, onClose]);

  const offset = side === 'left' ? -drawerWidth : drawerWidth;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });

  const shadow =
    scheme === 'dark'
      ? { shadowOpacity: 0.45, shadowRadius: 24, elevation: 12 }
      : { shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 };

  const rail_ =
    rail && rail.length > 0 ? (
      <View
        style={{
          width: 56,
          flexShrink: 0,
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: theme.space3,
          [side === 'right' ? 'borderRightWidth' : 'borderLeftWidth']: 1,
          borderColor: theme.cardShadeColor,
        }}
      >
        {rail.map((item) => (
          <IconButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            tooltip={item.label}
            tooltipPlacement={side === 'right' ? 'left' : 'right'}
            variant="flat"
            size="sm"
            disabled={item.disabled}
            accessibilityState={{ selected: !!item.active, disabled: !!item.disabled }}
            onPress={item.onPress}
          />
        ))}
      </View>
    ) : null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <AnimatedPressable
        testID={testID}
        onPress={closeOnBackdrop ? onClose : undefined}
        accessible={false}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
          padding: theme.space3,
          backgroundColor: theme.dialogBackdropColor,
          opacity: progress,
        }}
      >
        <Pressable onPress={() => {}} accessible={false} style={{ width: drawerWidth }}>
          <Animated.View
            accessible
            role="dialog"
            accessibilityViewIsModal
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                overflow: 'hidden',
                borderRadius: theme.radiusXl,
                backgroundColor: theme.dialogBgColor,
                shadowColor: '#000',
                shadowOffset: { width: side === 'left' ? 4 : -4, height: 0 },
                ...shadow,
                transform: [{ translateX }],
              },
              style,
            ]}
          >
            {side === 'right' && rail_}

            <View style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.space2,
                    padding: theme.space4,
                    paddingBottom: theme.space2,
                  }}
                >
                  <Text
                    variant="title-4"
                    style={{
                      flex: 1,
                      fontWeight: String(theme.fontWeightBold) as TextStyle['fontWeight'],
                    }}
                  >
                    {title}
                  </Text>
                  {onClose && (
                    <Button
                      variant="flat"
                      shape="circular"
                      size="sm"
                      accessibilityLabel="Close"
                      onPress={onClose}
                    >
                      <Icon icon={Close} size="sm" />
                    </Button>
                  )}
                </View>
              )}

              {body !== undefined && (
                <View
                  style={{
                    flex: 1,
                    padding: theme.space4,
                    paddingTop: title ? 0 : theme.space4,
                  }}
                >
                  <DrawerDepthContext.Provider value={depth + 1}>
                    {typeof body === 'string' ? <Text variant="body">{body}</Text> : body}
                  </DrawerDepthContext.Provider>
                </View>
              )}
            </View>

            {side === 'left' && rail_}
          </Animated.View>
        </Pressable>
      </AnimatedPressable>
    </Modal>
  );
};
