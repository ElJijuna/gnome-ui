import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

import {
  type BubblePosition,
  type CoachMarkPlacement,
  computeBubblePosition,
  padRect,
  type Rect,
} from './coachMarkUtils';

export interface CoachMarkAction {
  label: string;
  onPress: () => void;
}

export interface CoachMarkProps {
  /** Whether the coach mark is shown. */
  open: boolean;
  /** The element to highlight and anchor to. */
  targetRef: RefObject<View | null>;
  /** Heading text. */
  title?: ReactNode;
  /** Body copy explaining the highlighted element. */
  description?: ReactNode;
  /** Preferred side of the target for the bubble. Flips to stay on-screen. Defaults to `'bottom'`. */
  placement?: CoachMarkPlacement;
  /** Dim the rest of the screen and cut a spotlight around the target. Defaults to `true`. */
  spotlight?: boolean;
  /** Extra px around the target inside the spotlight cutout. Defaults to `8`. */
  spotlightPadding?: number;
  /** Close when the dimmed backdrop is pressed. Defaults to `false` (guided). */
  dismissOnBackdrop?: boolean;
  /** 1-based index of this step within a tour, for the "X of N" counter. */
  step?: number;
  /** Total number of steps in the tour. */
  stepCount?: number;
  /** Primary (suggested) action, e.g. Next / Got it. */
  primaryAction?: CoachMarkAction;
  /** Secondary (flat) action, e.g. Back. */
  secondaryAction?: CoachMarkAction;
  /** Called when the Android back button is pressed, or the backdrop is dismissed. */
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ARROW = 7;
const SCRIM_COLOR = 'rgba(0, 0, 0, 0.55)';

/**
 * A single onboarding coach mark: it spotlights a target element and
 * anchors a callout bubble (title, description, step counter, actions)
 * beside it, guiding a user to one feature. Compose several with
 * `CoachMarkTour`, or drive one directly with `open`. Mirrors
 * `@gnome-ui/react`'s `CoachMark` — not a GNOME HIG widget, a pragmatic
 * feature-discovery pattern.
 *
 * Rebuilt on RN's own `Modal` rather than the web version's DOM `Portal` —
 * no `container` prop, the same `Overlay`/`Drawer` precedent for "no RN
 * portal-target concept." Positions with the same two-pass viewport-aware
 * flip as the web version (`coachMarkUtils.ts`, duplicated verbatim — pure
 * math, no DOM), resolved from `targetRef.current?.measureInWindow(...)`
 * and the bubble's own `onLayout` size, combined once both arrive — the
 * same "resolve two independent async things, then combine" shape
 * `Tooltip`/`Popover`/`Dropdown` already established. No focus trap (no
 * DOM `Tab` concept in RN) and no scroll/resize re-positioning (RN has no
 * global scroll event, the same `Tooltip` precedent for a transient
 * floating element).
 *
 * **The spotlight cutout has no CSS `box-shadow: 0 0 0 100vmax` port** —
 * that trick paints an opaque scrim everywhere *except* inside a rounded
 * rect by using a huge spread shadow, which RN's `shadow*` props (real OS
 * shadows, not a scrim generator) can't reproduce. Rebuilt as four plain
 * `View` bands (top/bottom/left/right of the padded target rect) filling
 * the screen minus a rectangular hole, plus a separate rounded
 * `accentColor`-bordered ring `View` drawn on top at the target rect —
 * visually equivalent (dims everything but the target, with an accent
 * ring around it), just assembled from ordinary rects instead of one
 * masked shape. The whole overlay (bands + ring) sits inside a single
 * full-screen `Pressable`, so — matching the web version exactly — a tap
 * anywhere within it (including visually "in the hole," since the web
 * version's backdrop is one full-bleed element with the spotlight only
 * painted on top, `pointer-events: none`) triggers `dismissOnBackdrop`,
 * never the real content underneath.
 *
 * **`dismissOnBackdrop` has no effect when `spotlight` is `false`** —
 * ported faithfully, not fixed: the web source only renders a backdrop
 * element at all when `spotlight` is true, so with `spotlight={false}`
 * there is nothing to press to dismiss via backdrop either way, on both
 * platforms.
 *
 * The arrow reuses `Popover`/`Tooltip`'s transparent-border-triangle trick
 * rather than the web CSS's rotated-45°-square, the same established RN
 * substitution for every floating-bubble arrow in this package — offset
 * along the bubble's edge by `arrowOffset` (from `computeBubblePosition`,
 * unlike `Tooltip`/`Popover`'s simpler always-centered arrow).
 *
 * `role="dialog"` + `accessibilityViewIsModal` port 1:1 from `Dialog`'s
 * own precedent. `BackHandler`'s `hardwareBackPress` is the Android analog
 * of the web version's Escape listener.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Window.html
 */
export const CoachMark = ({
  open,
  targetRef,
  title,
  description,
  placement = 'bottom',
  spotlight = true,
  spotlightPadding = 8,
  dismissOnBackdrop = false,
  step,
  stepCount,
  primaryAction,
  secondaryAction,
  onDismiss,
  style,
  testID,
}: CoachMarkProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [bubbleSize, setBubbleSize] = useState<{ width: number; height: number } | null>(null);
  const [pos, setPos] = useState<BubblePosition | null>(null);

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open) {
      setTargetRect(null);
      setBubbleSize(null);
      setPos(null);
      progress.setValue(0);

      return;
    }

    // Measuring immediately (or even one `requestAnimationFrame` later)
    // catches a stale rect when the target sits below sibling content
    // whose own size isn't final yet on the first commit (e.g. a
    // multi-line description `Text` above it) — confirmed on-device: the
    // reported `y` matched exactly where the target would sit *without*
    // that sibling's height, off by precisely that amount. A single rAF
    // still landed before the follow-up layout pass that accounts for it;
    // a short real delay reliably lands after. The web version's
    // `useLayoutEffect` measurement has no equivalent race, since DOM
    // layout is synchronous by the time it runs — RN's `measureInWindow`
    // is a native-bridge call with no such guarantee, and Yoga's own
    // text-driven relayout can still be in flight after one JS frame.
    const timer = setTimeout(() => {
      targetRef.current?.measureInWindow((x, y, width, height) => {
        setTargetRect({ top: y, left: x, width, height });
      });
    }, 50);

    return () => clearTimeout(timer);
    // `targetRef` is a real dependency, not just a stable-ref formality —
    // `CoachMarkTour` passes a *different* ref object per step, and this
    // effect must re-measure when the target changes even though `open`
    // stays `true` across the whole tour. Missing it here was a real bug:
    // advancing steps left the spotlight/bubble stuck on the first step's
    // target (found via the app, not just this file's own tests, which
    // only ever exercise a single step's fixed ref).
  }, [open, targetRef, progress]);

  useEffect(() => {
    if (!targetRect || !bubbleSize) {
      return;
    }

    const { width: vw, height: vh } = Dimensions.get('window');

    setPos(computeBubblePosition(targetRect, bubbleSize, { width: vw, height: vh }, placement));
  }, [targetRect, bubbleSize, placement]);

  useEffect(() => {
    if (!pos) {
      return;
    }

    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationFast,
      useNativeDriver: true,
    }).start();
  }, [pos, reducedMotion, progress, theme.durationFast]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss?.();

      return true;
    });

    return () => subscription.remove();
  }, [open, onDismiss]);

  const handleBubbleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;

    setBubbleSize({ width, height });
  };

  if (!open) {
    return null;
  }

  const spotRect = targetRect ? padRect(targetRect, spotlightPadding) : null;
  const { width: vw } = Dimensions.get('window');

  const arrowBase = {
    position: 'absolute' as const,
    width: 0,
    height: 0,
    borderWidth: ARROW,
    borderColor: 'transparent',
  };

  const arrowStyle = (() => {
    if (!pos) {
      return null;
    }

    switch (pos.placement) {
      case 'top':
        return {
          ...arrowBase,
          bottom: -ARROW * 2,
          left: pos.arrowOffset - ARROW,
          borderTopColor: theme.cardBgColor,
        };
      case 'bottom':
        return {
          ...arrowBase,
          top: -ARROW * 2,
          left: pos.arrowOffset - ARROW,
          borderBottomColor: theme.cardBgColor,
        };
      case 'left':
        return {
          ...arrowBase,
          right: -ARROW * 2,
          top: pos.arrowOffset - ARROW,
          borderLeftColor: theme.cardBgColor,
        };
      default:
        return {
          ...arrowBase,
          left: -ARROW * 2,
          top: pos.arrowOffset - ARROW,
          borderRightColor: theme.cardBgColor,
        };
    }
  })();

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Animated.View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {spotlight && (
          <Pressable
            testID={testID}
            onPress={dismissOnBackdrop ? onDismiss : undefined}
            accessible={false}
            style={StyleSheet.absoluteFill}
          >
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: progress }]}
            >
              {spotRect && (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: Math.max(0, spotRect.top),
                      backgroundColor: SCRIM_COLOR,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: Math.max(0, spotRect.top + spotRect.height),
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: SCRIM_COLOR,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: Math.max(0, spotRect.top),
                      left: 0,
                      width: Math.max(0, spotRect.left),
                      height: spotRect.height,
                      backgroundColor: SCRIM_COLOR,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: Math.max(0, spotRect.top),
                      left: Math.max(0, spotRect.left + spotRect.width),
                      right: 0,
                      height: spotRect.height,
                      backgroundColor: SCRIM_COLOR,
                    }}
                  />
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: spotRect.top,
                      left: spotRect.left,
                      width: spotRect.width,
                      height: spotRect.height,
                      borderRadius: theme.radiusMd,
                      borderWidth: 2,
                      borderColor: theme.accentColor,
                    }}
                  />
                </>
              )}
            </Animated.View>
          </Pressable>
        )}

        <Animated.View
          onLayout={handleBubbleLayout}
          accessible
          role="dialog"
          accessibilityViewIsModal
          style={[
            {
              position: 'absolute',
              maxWidth: Math.min(320, vw - 24),
              padding: theme.space3,
              backgroundColor: theme.cardBgColor,
              borderRadius: theme.radiusLg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            },
            pos
              ? {
                  top: pos.top,
                  left: pos.left,
                  opacity: progress,
                  transform: [
                    { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
                  ],
                }
              : { top: -9999, left: -9999, opacity: 0 },
            style,
          ]}
        >
          {arrowStyle && <View style={arrowStyle} />}

          {step !== undefined && stepCount !== undefined && (
            <Text
              variant="caption"
              style={{
                marginBottom: theme.space1,
                color: theme.accentColor,
                fontWeight: String(theme.fontWeightBold) as TextStyle['fontWeight'],
              }}
            >
              {`${step} of ${stepCount}`}
            </Text>
          )}

          {title && (
            <Text
              variant="title-4"
              style={{
                marginBottom: theme.space1,
                fontWeight: String(theme.fontWeightBold) as TextStyle['fontWeight'],
              }}
            >
              {title}
            </Text>
          )}

          {description && (
            <Text variant="body" color="dim">
              {description}
            </Text>
          )}

          {(primaryAction || secondaryAction) && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: theme.space2,
                marginTop: theme.space3,
              }}
            >
              {secondaryAction && (
                <Button variant="flat" size="sm" onPress={secondaryAction.onPress}>
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button variant="suggested" size="sm" onPress={primaryAction.onPress}>
                  {primaryAction.label}
                </Button>
              )}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
