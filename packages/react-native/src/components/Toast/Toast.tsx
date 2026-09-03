import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, Text as RNText } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

/**
 * `Animated`'s style interpolation only takes effect on `Animated.*`
 * host components — a plain `Pressable` would silently ignore the
 * animated `opacity`/`transform` in its style. Hoisted to module scope so
 * it isn't recreated on every render.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ToastProps extends Omit<ViewProps, 'style'> {
  /** The notification message. Keep it short — one sentence. */
  title: ReactNode;
  /**
   * Auto-dismiss timeout in milliseconds.
   * - Set to `0` to disable auto-dismiss (user must press action or dismiss).
   * - Defaults to `3000`.
   */
  duration?: number;
  /** Called when the toast should be removed — after timeout or user action. */
  onDismiss?: () => void;
  /** Label for the optional action button. */
  actionLabel?: string;
  /** Called when the user presses the action button. */
  onAction?: () => void;
  /** Whether to show a manual dismiss (×) button. */
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Non-blocking temporary notification following the Adwaita `AdwToast`
 * pattern. Auto-dismisses after `duration` ms (default 3s, `0` disables
 * it); the timer pauses while the toast is pressed and held. Use inside
 * `Toaster` for correct positioning and stacking.
 *
 * The auto-dismiss/pause timer logic (`timerRef`/`remainingRef`/
 * `startedAtRef`) is ported verbatim from `@gnome-ui/react` — it's plain
 * `setTimeout`/`Date.now()` bookkeeping, no DOM API involved, so nothing
 * platform-specific to change. The pause trigger is: RN has no hover, so
 * `onPressIn`/`onPressOut` (touch-down/touch-up) stand in for the web
 * version's `onMouseEnter`/`onMouseLeave` — pausing while the user is
 * actively touching the toast, the closest RN analog to "giving the user
 * time to read it." `onFocus`/`onBlur`-triggered pausing (keyboard
 * accessibility on web) has no port here — the outer card itself isn't a
 * focusable element in RN's touch-first model, only its action/dismiss
 * buttons are, and RN has no "focus-within" primitive to detect that
 * without an extra dependency.
 *
 * The entrance is an `Animated.timing` fading + sliding + scaling in
 * (`opacity`/`translateY`/`scale`, all transform-safe for
 * `useNativeDriver: true`), matching the web version's `@keyframes
 * toast-in`; `useReducedMotion()` skips straight to the settled state,
 * matching the source CSS's `animation: none`. There's no exit animation
 * to port either — the web version doesn't define one, removal is
 * immediate once the consumer drops the `Toast` from its list.
 *
 * RN's `AccessibilityRole` union has no "status" value (the web version's
 * `role="status"`); `"alert"` is the closest available role for content
 * that should interrupt and be announced, paired with
 * `accessibilityLiveRegion="polite"` (Android's live-region API) as the
 * nearest match to the web's `aria-live="polite"` — deliberately not
 * `"assertive"`, matching the same politeness level the source chose.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Toast.html
 */
export const Toast = ({
  title,
  duration = 3000,
  onDismiss,
  actionLabel,
  onAction,
  dismissible = false,
  style,
  ...viewProps
}: ToastProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (ms: number) => {
      if (ms <= 0 || !onDismiss) {
        return;
      }

      clearTimer();
      startedAtRef.current = Date.now();
      timerRef.current = setTimeout(() => onDismiss(), ms);
    },
    [onDismiss, clearTimer],
  );

  useEffect(() => {
    if (duration > 0) {
      remainingRef.current = duration;
      startTimer(duration);
    }

    return clearTimer;
  }, [duration, startTimer, clearTimer]);

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);

      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: 1,
      duration: theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [reducedMotion, progress, theme.durationNormal, theme.easingDefault]);

  const handlePressIn = () => {
    if (timerRef.current) {
      const elapsed = Date.now() - startedAtRef.current;

      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clearTimer();
    }
  };

  const handlePressOut = () => {
    startTimer(remainingRef.current);
  };

  const handleAction = () => {
    clearTimer();
    onAction?.();
    onDismiss?.();
  };

  const shadow =
    scheme === 'dark'
      ? { shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }
      : { shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 };

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: 10,
          paddingRight: theme.space2,
          paddingLeft: theme.space3,
          minHeight: 44,
          maxWidth: 480,
          minWidth: 240,
          backgroundColor: theme.cardBgColor,
          borderRadius: theme.radiusLg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
            },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
          ...shadow,
        },
        style,
      ]}
      {...viewProps}
    >
      <Text
        variant="body"
        style={{ flex: 1, minWidth: 0 }}
        numberOfLines={typeof title === 'string' ? 2 : undefined}
      >
        {title}
      </Text>

      {(actionLabel || dismissible) && (
        <>
          {actionLabel && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              onPress={handleAction}
              style={({ pressed }) => ({
                paddingVertical: 4,
                paddingHorizontal: theme.space1,
                borderRadius: theme.radiusSm,
                backgroundColor: pressed ? theme.activeOverlay : 'transparent',
              })}
            >
              <RNText
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSizeBody,
                  fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
                  color: theme.accentColor,
                }}
              >
                {actionLabel}
              </RNText>
            </Pressable>
          )}

          {dismissible && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={4}
              onPress={() => {
                clearTimer();
                onDismiss?.();
              }}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radiusSm,
                opacity: pressed ? 1 : 0.55,
                backgroundColor: pressed ? theme.activeOverlay : 'transparent',
              })}
            >
              <RNText style={{ fontSize: theme.fontSizeBody, color: theme.windowFgColor }}>
                {'×'}
              </RNText>
            </Pressable>
          )}
        </>
      )}
    </AnimatedPressable>
  );
};
