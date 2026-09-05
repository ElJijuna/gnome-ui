import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  View,
} from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

/**
 * `Animated`'s style interpolation only takes effect on `Animated.*` host
 * components — a plain `Pressable` would silently ignore the animated
 * `opacity` in its style, the same gotcha already documented on `Toast`/
 * `Dialog`. Hoisted to module scope so it isn't recreated on every render.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DRAG_CLOSE_THRESHOLD = 150;

export interface BottomSheetProps {
  /** Whether the sheet is visible. */
  open: boolean;
  /** Optional heading shown below the drag handle. */
  title?: ReactNode;
  children?: ReactNode;
  /** Called when the user dismisses the sheet (backdrop press, Android back button, or drag down). */
  onClose?: () => void;
  /** Whether pressing the backdrop closes the sheet. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Applied to the backdrop, mirroring `Dialog`'s own `testID`. */
  testID?: string;
}

/**
 * Slide-up panel that overlays content from the bottom edge, mirroring
 * `AdwBottomSheet` (libadwaita 1.6+) and `@gnome-ui/react`'s `BottomSheet`.
 *
 * Rebuilt with `View`/`Modal`/`PanResponder` rather than ported from the web
 * version's DOM `Portal` + manual focus trap + raw pointer events —
 * reusing this package's own established pieces: `Dialog`'s backdrop-
 * opacity-on-an-`AnimatedPressable` + no-op-`Pressable`-around-the-card
 * (so a tap on the card never bubbles to the backdrop) recipe, and
 * `BackHandler`'s `hardwareBackPress` as the Android analog of the web
 * version's Escape listener (same pattern `Dialog`/`Popover` already use).
 * Focus-trapping and focus-restore-on-close have no port — no DOM
 * `document.activeElement`/`querySelector` equivalent exists in RN, the
 * same gap already present in every other floating component here.
 *
 * **Real drag-to-dismiss, not a fixed-panel simplification**: unlike the
 * web version's raw `PointerEvent` handlers directly mutating
 * `style.transform`, this uses `PanResponder` (the same core RN API
 * `Slider` already proved handles a threshold-based drag gesture) driving
 * a single `Animated.Value` — the *same* value used for the slide-in/
 * slide-out entrance animation. `PanResponder`'s `gestureState.dy` is the
 * cumulative vertical delta since the gesture started, so a plain
 * `translateY.setValue(Math.max(0, gestureState.dy))` during
 * `onPanResponderMove` reproduces the web version's own
 * `Math.max(0, e.clientY - dragStartY.current)` clamp exactly, and a
 * release past `DRAG_CLOSE_THRESHOLD` (150 px, same constant as the web
 * version) animates the rest of the way down before calling `onClose`,
 * otherwise it springs back to `0`. The gesture responder is attached only
 * to the handle bar `View`, not the whole sheet, mirroring the web
 * version's `onPointerDown` being scoped to `.handle` alone.
 *
 * **A real slide-up needs the sheet's own height first** — RN's
 * `transform` has no percentage-of-self units (the same `Slider`/`Avatar`
 * pitfall), unlike the web version's `translateY(100%)`. The sheet renders
 * once off-screen (measured via `onLayout`, starting `translateY` at that
 * measured height) before animating to `0` — the same "resolve own
 * rendered size, then animate" two-step every other sized-on-open
 * component in this package (`Dialog`, `Dropdown`, `Popover`) already
 * needs, just for a transform offset instead of a floating position.
 *
 * **Real, timed exit animation, unlike `Dialog`**: `Dialog`'s web source
 * has no exit keyframes at all (`Modal`'s `visible={false}` unmounts
 * immediately, matching the web version's plain `return null`) — but
 * `BottomSheet`'s web source explicitly animates both the backdrop fade
 * and the sheet's slide-out before removing it. Ported with a local
 * `visible` state that lags one animation behind the `open` prop: closing
 * starts the exit `Animated.timing`s and only flips `visible` to `false`
 * (unmounting the `Modal`'s content) in the animation's own completion
 * callback — not a `setTimeout` racing a hardcoded duration like the web
 * version, since `Animated`'s callback already fires exactly when the
 * animation actually finishes.
 *
 * The web version's `backdrop-filter: blur(4px)` has no port — this
 * package has no native blur view dependency, the same reasoning that
 * already dropped `Sidebar`'s blurred `variant`. `useBodyScrollLock` has no
 * RN equivalent needed: `Modal` already blocks all interaction with
 * whatever's behind it, there is no scrollable "body" to lock separately.
 *
 * `role="dialog"` + `accessibilityViewIsModal` port 1:1 from `Dialog`'s own
 * precedent. `children`, when a plain string, must be wrapped in `Text`
 * before rendering — RN throws if a raw string is a `View`'s child, unlike
 * the web version's `<div>{children}</div>`, which needed no such check.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.BottomSheet.html
 */
export const BottomSheet = ({
  open,
  title,
  children,
  onClose,
  closeOnBackdrop = true,
  style,
  testID,
}: BottomSheetProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [visible, setVisible] = useState(open);
  const [sheetHeight, setSheetHeight] = useState(0);

  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  // Animate in once the sheet is mounted and measured; animate out (then
  // actually unmount) when `open` flips false — skipped mid-drag, since the
  // gesture handlers below already own `translateY` in that case.
  useEffect(() => {
    if (!visible || isDragging.current) {
      return;
    }

    if (open) {
      if (reducedMotion) {
        translateY.setValue(0);
        backdropOpacity.setValue(1);

        return;
      }

      if (sheetHeight > 0) {
        translateY.setValue(sheetHeight);
        Animated.timing(translateY, {
          toValue: 0,
          duration: theme.durationNormal,
          useNativeDriver: true,
        }).start();
      }

      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: theme.durationNormal,
        useNativeDriver: true,
      }).start();
    } else {
      if (reducedMotion) {
        setVisible(false);

        return;
      }

      Animated.timing(translateY, {
        toValue: sheetHeight || Dimensions.get('window').height,
        duration: theme.durationNormal,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: theme.durationNormal,
        useNativeDriver: true,
      }).start();
    }
  }, [
    open,
    visible,
    sheetHeight,
    reducedMotion,
    translateY,
    backdropOpacity,
    theme.durationNormal,
  ]);

  // Android hardware back button closes the sheet — the analog of the web
  // version's document-level Escape listener, same pattern `Dialog` uses.
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

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          isDragging.current = true;
        },
        onPanResponderMove: (_event, gestureState) => {
          translateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_event, gestureState) => {
          isDragging.current = false;

          const dy = Math.max(0, gestureState.dy);

          if (dy >= DRAG_CLOSE_THRESHOLD) {
            // Just request the close — the `open` → `false` effect above
            // owns the actual exit animation (and reduced-motion handling),
            // continuing smoothly from wherever the drag left `translateY`
            // rather than duplicating that animation here.
            onClose?.();
          } else {
            Animated.timing(translateY, {
              toValue: 0,
              duration: theme.durationNormal,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY, theme.durationNormal, onClose],
  );

  const handleSheetLayout = (e: LayoutChangeEvent) => {
    setSheetHeight(e.nativeEvent.layout.height);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
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
          justifyContent: 'flex-end',
          backgroundColor: theme.dialogBackdropColor,
          opacity: backdropOpacity,
        }}
      >
        <Pressable onPress={() => {}} accessible={false}>
          <Animated.View
            onLayout={handleSheetLayout}
            accessible
            role="dialog"
            accessibilityViewIsModal
            style={[
              {
                alignSelf: 'center',
                width: '100%',
                maxWidth: 560,
                backgroundColor: theme.dialogBgColor,
                borderTopLeftRadius: theme.radiusXl,
                borderTopRightRadius: theme.radiusXl,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
                elevation: 12,
                transform: [{ translateY }],
              },
              style,
            ]}
          >
            <View
              testID="bottom-sheet-handle"
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{
                alignItems: 'center',
                paddingTop: theme.space2,
                paddingBottom: theme.space1,
              }}
              {...panResponder.panHandlers}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.windowFgColor,
                  opacity: 0.2,
                }}
              />
            </View>

            {title && (
              <Text
                variant="title-4"
                style={{
                  paddingHorizontal: theme.space4,
                  paddingBottom: theme.space2,
                  textAlign: 'center',
                  fontWeight: String(theme.fontWeightBold) as TextStyle['fontWeight'],
                }}
              >
                {title}
              </Text>
            )}

            {children && (
              <View style={{ paddingHorizontal: theme.space4, paddingBottom: theme.space4 }}>
                {typeof children === 'string' ? <Text variant="body">{children}</Text> : children}
              </View>
            )}
          </Animated.View>
        </Pressable>
      </AnimatedPressable>
    </Modal>
  );
};
