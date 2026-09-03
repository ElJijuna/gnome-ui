import { useEffect, useRef } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Animated, Easing } from 'react-native';

import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

export type ProgressBarVariant = 'accent' | 'success' | 'warning' | 'error';

export interface ProgressBarProps extends Omit<ViewProps, 'style'> {
  /**
   * Current progress value between `0` and `1` (e.g. `0.6` = 60%). Omit
   * or set to `undefined` for the indeterminate (pulsing) state.
   */
  value?: number;
  /**
   * Fill color of the progress indicator.
   * - `"accent"` (default) — blue, general-purpose progress.
   * - `"success"` — green, completed or healthy state.
   * - `"warning"` — yellow, approaching a limit.
   * - `"error"` — red, failed or critical state.
   */
  variant?: ProgressBarVariant;
  /** Accessible label describing what is loading. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Determinate and indeterminate progress bar following the Adwaita style.
 *
 * - **Determinate** — pass `value` (0–1) to show exact progress; the fill
 *   width animates on every change, matching the web version's
 *   `transition: width`.
 * - **Indeterminate** — omit `value` for a 40%-wide bar that slides left
 *   to right on an `Animated.loop`, matching the web version's CSS
 *   `@keyframes pulse`.
 *
 * `useReducedMotion()` is honored per the *source CSS's own* per-state
 * behavior rather than one uniform rule: determinate width changes simply
 * skip the transition (duration `0`, still an immediate jump like the CSS
 * `transition: none`), while the indeterminate pulse stops entirely and
 * freezes as a static, full-width, 50%-opacity bar — exactly what
 * `@media (prefers-reduced-motion: reduce) { .indeterminate { animation:
 * none; left: 0; width: 100%; opacity: 0.5 } }` does. This differs from
 * `Spinner`, whose reduced-motion behavior *slows* its animation instead
 * of stopping it — each component mirrors its own source CSS rather than
 * applying a single reduced-motion policy across the package.
 *
 * `role="progressbar"` maps directly to RN's own `accessibilityRole`
 * (unlike `Spinner`, which had to substitute for the web's `role="status"`
 * — `ProgressBar`'s web role already has a 1:1 RN equivalent).
 * `accessibilityValue` carries `now`/`min`/`max` for the determinate case;
 * the indeterminate case omits all three, RN's equivalent of the web
 * version omitting `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. Web's
 * `aria-labelledby` (an id-relationship prop) has no RN equivalent — RN
 * has no DOM ids — so only `aria-label` (`accessibilityLabel`) is ported.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/progress.html
 */
export const ProgressBar = ({
  value,
  variant = 'accent',
  accessibilityLabel,
  style,
  ...viewProps
}: ProgressBarProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();

  const isIndeterminate = value === undefined || value === null;
  const clamped = isIndeterminate ? undefined : Math.min(1, Math.max(0, value));
  const percent = clamped !== undefined ? clamped * 100 : undefined;

  const width = useRef(new Animated.Value(clamped ?? 0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isIndeterminate) {
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(width, {
      toValue: clamped ?? 0,
      duration: reducedMotion ? 0 : theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: false,
    }).start();
  }, [clamped, isIndeterminate, reducedMotion, width, theme.durationNormal, theme.easingDefault]);

  useEffect(() => {
    if (!isIndeterminate || reducedMotion) {
      return;
    }

    pulse.setValue(0);

    const [x1, y1, x2, y2] = theme.easingDefault;

    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(x1, y1, x2, y2),
        useNativeDriver: false,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [isIndeterminate, reducedMotion, pulse, theme.easingDefault]);

  const trackColor = scheme === 'dark' ? theme.dark2 : theme.light3;
  const variantColor: Record<ProgressBarVariant, string> = {
    accent: theme.accentBgColor,
    success: theme.successBgColor,
    warning: theme.warningBgColor,
    error: theme.errorBgColor,
  };

  const fillStyle = isIndeterminate
    ? reducedMotion
      ? { left: '0%', width: '100%', opacity: 0.5 }
      : {
          left: pulse.interpolate({ inputRange: [0, 1], outputRange: ['-40%', '100%'] }),
          width: '40%',
        }
    : {
        width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      };

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={
        clamped !== undefined ? { min: 0, max: 100, now: Math.round(percent as number) } : undefined
      }
      style={[
        {
          width: '100%',
          height: 6,
          borderRadius: theme.radiusPill,
          backgroundColor: trackColor,
          overflow: 'hidden',
        },
        style,
      ]}
      {...viewProps}
    >
      <Animated.View
        style={[
          {
            position: isIndeterminate ? 'absolute' : 'relative',
            top: 0,
            height: '100%',
            borderRadius: theme.radiusPill,
            backgroundColor: variantColor[variant],
          },
          fillStyle as ViewStyle,
        ]}
      />
    </Animated.View>
  );
};
