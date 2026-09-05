import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Modal, Pressable } from 'react-native';

import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

/**
 * `Animated`'s style interpolation only takes effect on `Animated.*` host
 * components — a plain `Pressable` would silently ignore the animated
 * `opacity` in its style, the same gotcha already documented on `Toast`/
 * `Dialog`/`BottomSheet`. Hoisted to module scope so it isn't recreated on
 * every render.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface OverlayProps {
  /** Whether the overlay is visible. */
  open: boolean;
  /** Called when the backdrop itself (not its content) is pressed. */
  onDismiss?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Standalone backdrop/scrim layer with a fade transition and
 * press-to-dismiss — the shared building block behind `Dialog`,
 * `Dropdown`, `Popover`, and `BottomSheet`'s backdrops, extracted here for
 * building custom overlay UI, mirroring `@gnome-ui/react`'s `Overlay`.
 *
 * Deliberately minimal, same as the web version: no focus trap, no
 * `BackHandler`/Escape handling, no `role`. Use `Dialog`/`Popover`/
 * `BottomSheet` directly when you need those — this is only the fade +
 * dismiss-on-backdrop-tap primitive underneath them.
 *
 * Built on `Modal` rather than the web version's `createPortal` — no
 * `container` prop exists here, since RN's `Modal` has no equivalent
 * mount-target concept (it always renders at the top of the native view
 * hierarchy). Reuses `Dialog`'s exact backdrop recipe: an
 * `AnimatedPressable` backdrop whose `onPress` fires `onDismiss`, wrapping
 * `children` in a no-op `Pressable` so a tap on the content itself never
 * bubbles to the backdrop and dismisses it — the RN analog of the web
 * version's `e.target === e.currentTarget` check, which has no meaning in
 * RN's touch-responder model.
 *
 * **Real, timed exit animation, same technique as `BottomSheet`**: a local
 * `visible` state lags one animation behind the `open` prop, flipping to
 * `false` only in the fade-out `Animated.timing`'s own completion callback
 * — not a `setTimeout` racing a hardcoded duration like the web version,
 * since `Animated`'s callback already fires exactly when the animation
 * actually finishes. `useBodyScrollLock` has no RN equivalent needed —
 * `Modal` already blocks all interaction with whatever's behind it.
 */
export const Overlay = ({ open, onDismiss, children, style, testID }: OverlayProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const [visible, setVisible] = useState(open);
  const opacity = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (open) {
      if (reducedMotion) {
        opacity.setValue(1);

        return;
      }

      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.durationNormal,
        useNativeDriver: true,
      }).start();
    } else {
      if (reducedMotion) {
        setVisible(false);

        return;
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration: theme.durationNormal,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [open, visible, reducedMotion, opacity, theme.durationNormal]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <AnimatedPressable
        testID={testID}
        onPress={onDismiss}
        accessible={false}
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.dialogBackdropColor,
            opacity,
          },
          style,
        ]}
      >
        <Pressable onPress={() => {}} accessible={false}>
          {children}
        </Pressable>
      </AnimatedPressable>
    </Modal>
  );
};
