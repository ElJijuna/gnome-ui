import {
  cloneElement,
  type ReactElement,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  MouseEvent,
  NativeSyntheticEvent,
  PressableProps,
  TargetedEvent,
  TextStyle,
} from 'react-native';
import { Animated, Dimensions, Modal, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /**
   * The tooltip label. Keep it short — a noun phrase or brief description.
   * Do not duplicate information already visible on screen.
   */
  label: string;
  /**
   * Preferred placement relative to the trigger.
   * The tooltip flips automatically if there is not enough space.
   * Defaults to `"top"`.
   */
  placement?: TooltipPlacement;
  /**
   * Delay in milliseconds before the tooltip appears, on both the
   * long-press and hover/focus triggers. Defaults to `500`. Set to `0` for
   * instant.
   */
  delay?: number;
  /**
   * The element that triggers the tooltip.
   * Must be a single element built on `Pressable` (e.g. `Button`, `Card`)
   * that forwards its `ref` to the underlying `View`.
   */
  children: ReactElement<PressableProps & { ref?: Ref<View> }>;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

interface Position {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const GAP = 6;
const MARGIN = 8;
const ARROW = 5;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);

    return;
  }

  (ref as { current: T | null }).current = value;
}

function placementRect(trigger: Rect, tooltip: Size, placement: TooltipPlacement) {
  switch (placement) {
    case 'top':
      return {
        top: trigger.y - tooltip.height - GAP,
        left: trigger.x + trigger.width / 2 - tooltip.width / 2,
      };
    case 'bottom':
      return {
        top: trigger.y + trigger.height + GAP,
        left: trigger.x + trigger.width / 2 - tooltip.width / 2,
      };
    case 'left':
      return {
        top: trigger.y + trigger.height / 2 - tooltip.height / 2,
        left: trigger.x - tooltip.width - GAP,
      };
    case 'right':
      return {
        top: trigger.y + trigger.height / 2 - tooltip.height / 2,
        left: trigger.x + trigger.width + GAP,
      };
  }
}

function computePosition(trigger: Rect, tooltip: Size, preferred: TooltipPlacement): Position {
  const { width: vw, height: vh } = Dimensions.get('window');

  const opposite: TooltipPlacement =
    preferred === 'top'
      ? 'bottom'
      : preferred === 'bottom'
        ? 'top'
        : preferred === 'left'
          ? 'right'
          : 'left';
  const placements: TooltipPlacement[] = [preferred, opposite, 'top', 'bottom', 'left', 'right'];

  for (const p of placements) {
    const { top, left } = placementRect(trigger, tooltip, p);
    const fitsH = left >= MARGIN && left + tooltip.width <= vw - MARGIN;
    const fitsV = top >= MARGIN && top + tooltip.height <= vh - MARGIN;

    if (fitsH && fitsV) {
      return {
        top: Math.max(MARGIN, Math.min(top, vh - tooltip.height - MARGIN)),
        left: Math.max(MARGIN, Math.min(left, vw - tooltip.width - MARGIN)),
        placement: p,
      };
    }
  }

  const { top, left } = placementRect(trigger, tooltip, preferred);

  return {
    top: Math.max(MARGIN, Math.min(top, vh - tooltip.height - MARGIN)),
    left: Math.max(MARGIN, Math.min(left, vw - tooltip.width - MARGIN)),
    placement: preferred,
  };
}

/**
 * Informational tooltip following the Adwaita / GNOME HIG pattern.
 *
 * Wraps a single trigger element and shows a floating label. Positioned
 * automatically and flips if there is not enough space, mirroring
 * `@gnome-ui/react`'s `Tooltip`.
 *
 * **Trigger differs from the web version by necessity**: the web `Tooltip`
 * shows only on mouse hover / keyboard focus — touch has no hover state, so
 * it explicitly never shows on touch. RN is touch-first, so the primary
 * trigger here is long-press (`delayLongPress={delay}`, released via
 * `onPressOut`) — the standard mobile "peek" idiom. `onHoverIn`/`onHoverOut`
 * are also wired for hover-capable input (trackpad/mouse on iPad or a
 * pointer-driven RN target) and `onFocus`/`onBlur` for external-keyboard
 * accessibility, both delayed the same way the web version delays hover.
 *
 * Built on RN's own `Modal` (transparent, `pointerEvents="box-none"`), the
 * same portal-substitute `Dialog` uses — no DOM `Portal` equivalent exists.
 * Unlike `Dialog`, `visible` is set synchronously on trigger (not gated on
 * the async `measureInWindow` result): the trigger's on-screen rect and the
 * tooltip's own rendered size each resolve independently into state, and a
 * separate effect computes the final position only once both have arrived.
 * Gating `visible` itself on `measureInWindow`'s callback was tried first
 * and dropped — that callback never fires in this package's Jest
 * environment (no real native view to measure), which would make the
 * component untestable, and in production it would also lose a real
 * quick-tap-then-release press if the callback resolved after `onPressOut`
 * had already fired.
 *
 * `role="tooltip"` ports 1:1 — RN's newer web-aligned `Role` union (the
 * same one `Dialog` uses for `role="dialog"`) already has a `"tooltip"`
 * value, no substitution needed. `aria-describedby` has no RN equivalent
 * (no cross-platform description-relationship prop exists), so the label is
 * set as the trigger's `accessibilityHint` instead — read after the
 * trigger's own label by VoiceOver/TalkBack, the nearest analog. The CSS
 * arrow reuses the same zero-size / transparent-border-on-three-sides
 * triangle trick as the web version — RN Views support per-side
 * `border*Color` just like CSS, the same technique `Spinner`'s ring
 * already relies on, applied here to a triangle instead of an arc.
 *
 * Not ported: repositioning on scroll/resize while visible (the web
 * version listens for both) — RN has no global scroll event, and a
 * long-press is naturally cancelled by a scroll gesture starting, so the
 * window to go stale is negligible for the touch trigger; orientation
 * change mid-hover is an accepted edge case for a component this transient.
 * `tooltipBgColor`/`tooltipFgColor` are not real `@gnome-ui/core` tokens
 * (only referenced as CSS var fallbacks, never defined) — hardcoded to the
 * same literal light/dark values as the web fallback, the same workaround
 * `Spinner`'s track color already established for this class of gap.
 *
 * @example
 * <Tooltip label="Save file">
 *   <Button accessibilityLabel="Save"><Icon icon={Save} /></Button>
 * </Tooltip>
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/tooltips.html
 */
export const Tooltip = ({
  label,
  placement: preferredPlacement = 'top',
  delay = 500,
  children,
}: TooltipProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();

  const [visible, setVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [tooltipSize, setTooltipSize] = useState<Size | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<View>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    clearTimer();
    setVisible(true);
  }, [clearTimer]);

  const openDelayed = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(open, delay);
  }, [clearTimer, open, delay]);

  const close = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  // Measure the trigger's on-screen rect as soon as it's asked to show.
  useEffect(() => {
    if (!visible) {
      setTriggerRect(null);
      setTooltipSize(null);
      setPos(null);

      return;
    }

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect({ x, y, width, height });
    });
  }, [visible]);

  // Resolve the final position once both the trigger's rect and the
  // tooltip's own rendered size are known.
  useEffect(() => {
    if (!triggerRect || !tooltipSize) {
      return;
    }

    setPos(computePosition(triggerRect, tooltipSize, preferredPlacement));
  }, [triggerRect, tooltipSize, preferredPlacement]);

  useEffect(() => {
    if (!pos) {
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationFast,
      useNativeDriver: true,
    }).start();
  }, [pos, reducedMotion, progress, theme.durationFast]);

  useEffect(() => clearTimer, [clearTimer]);

  const handleTooltipLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;

    setTooltipSize({ width, height });
  };

  const bg = scheme === 'dark' ? '#c0bfbc' : '#3d3d3d';
  const fg = scheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : '#fff';
  const shadow =
    scheme === 'dark'
      ? { shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }
      : { shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 };

  const arrowBase = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderWidth: ARROW,
    borderColor: 'transparent',
  };

  const arrowStyle = (() => {
    switch (pos?.placement) {
      case 'top':
        return {
          ...arrowBase,
          top: '100%' as const,
          left: '50%' as const,
          marginLeft: -ARROW,
          borderTopColor: bg,
        };
      case 'bottom':
        return {
          ...arrowBase,
          bottom: '100%' as const,
          left: '50%' as const,
          marginLeft: -ARROW,
          borderBottomColor: bg,
        };
      case 'left':
        return {
          ...arrowBase,
          left: '100%' as const,
          top: '50%' as const,
          marginTop: -ARROW,
          borderLeftColor: bg,
        };
      case 'right':
        return {
          ...arrowBase,
          right: '100%' as const,
          top: '50%' as const,
          marginTop: -ARROW,
          borderRightColor: bg,
        };
      default:
        return null;
    }
  })();

  const existingRef = (children.props as { ref?: Ref<View> }).ref;

  const child = cloneElement(children, {
    ref: (node: View | null) => {
      (triggerRef as { current: View | null }).current = node;
      assignRef(existingRef, node);
    },
    delayLongPress: delay,
    accessibilityHint: children.props.accessibilityHint ?? label,
    onLongPress: (e: GestureResponderEvent) => {
      open();
      children.props.onLongPress?.(e);
    },
    onPressOut: (e: GestureResponderEvent) => {
      close();
      children.props.onPressOut?.(e);
    },
    onHoverIn: (e: MouseEvent) => {
      openDelayed();
      children.props.onHoverIn?.(e);
    },
    onHoverOut: (e: MouseEvent) => {
      close();
      children.props.onHoverOut?.(e);
    },
    onFocus: (e: NativeSyntheticEvent<TargetedEvent>) => {
      openDelayed();
      children.props.onFocus?.(e);
    },
    onBlur: (e: NativeSyntheticEvent<TargetedEvent>) => {
      close();
      children.props.onBlur?.(e);
    },
  });

  return (
    <>
      {child}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Animated.View
            onLayout={handleTooltipLayout}
            accessible
            role="tooltip"
            style={[
              {
                position: 'absolute',
                maxWidth: 240,
                paddingVertical: 4,
                paddingHorizontal: theme.space2,
                backgroundColor: bg,
                borderRadius: theme.radiusSm,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                ...shadow,
              },
              pos
                ? { top: pos.top, left: pos.left, opacity: progress }
                : { top: -9999, left: -9999, opacity: 0 },
            ]}
          >
            <Text
              style={{
                color: fg,
                fontSize: theme.fontSizeCaption,
                fontWeight: String(theme.fontWeightNormal) as TextStyle['fontWeight'],
                lineHeight: theme.fontSizeCaption * theme.lineHeightBody,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
            {arrowStyle && <View style={arrowStyle} />}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};
