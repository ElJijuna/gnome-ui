import { useEffect, useRef } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Animated, Easing } from 'react-native';

import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';

export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZES: Record<SpinnerSize, { dimension: number; borderWidth: number }> = {
  sm: { dimension: 16, borderWidth: 2 },
  md: { dimension: 24, borderWidth: 2.5 },
  lg: { dimension: 36, borderWidth: 3 },
};

export interface SpinnerProps extends Omit<ViewProps, 'style'> {
  /** Size of the spinner. Defaults to `"md"`. */
  size?: SpinnerSize;
  /**
   * Accessible label announced by screen readers. Defaults to
   * `"Loading…"`. Set to `""` to silence if a sibling label is present.
   */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Indeterminate loading indicator following the Adwaita spinner style.
 *
 * Rebuilt on `Animated.View` rather than ported from `@gnome-ui/react`'s
 * pure-CSS `@keyframes spin` animation: the ring itself reuses the same
 * per-side-border trick the CSS does (`borderColor` for the track,
 * `borderTopColor` for the accent-colored "head" of the spinner, on a
 * `borderRadius: 50%` circle) — that part translates directly, since RN's
 * `View` supports independent per-side border colors too. The rotation
 * itself is an `Animated.loop`d `Animated.timing` driving a `rotate`
 * transform, `useNativeDriver: true` since only a transform is animated.
 *
 * `useReducedMotion()` mirrors the source CSS's own
 * `@media (prefers-reduced-motion: reduce) { animation-duration: 2s }` —
 * slowed to 2s, not stopped outright, exactly matching the web behavior
 * rather than dropping the animation entirely.
 *
 * RN's `AccessibilityRole` union has no "status" value (the web version's
 * `role="status"`); `"progressbar"` is the closest match for an
 * indeterminate loading indicator and is what's used here — omitting
 * `accessibilityValue` is RN's equivalent of omitting `aria-valuenow` for
 * an indeterminate progress bar. `@gnome-ui/react`'s two hardcoded
 * per-color-scheme track colors (the `--gnome-spinner-track-color` CSS
 * variable is referenced but never actually defined in `@gnome-ui/core`'s
 * tokens, so the CSS fallback value is always what renders) are ported as
 * the same hardcoded `rgba()` pair, branched on `useResolvedColorScheme()`
 * — the same pattern `Switch`/`Checkbox`/`RadioButton` already use for
 * colors the source CSS hardcodes rather than tokenizes.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 */
export const Spinner = ({ size = 'md', label = 'Loading…', style, ...viewProps }: SpinnerProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();

  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spin.setValue(0);

    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: reducedMotion ? 2000 : 750,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [spin, reducedMotion]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const { dimension, borderWidth } = SIZES[size];
  const trackColor = scheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label || undefined}
      accessibilityElementsHidden={label === ''}
      importantForAccessibility={label === '' ? 'no-hide-descendants' : 'yes'}
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          borderWidth,
          borderColor: trackColor,
          borderTopColor: theme.accentColor,
          transform: [{ rotate }],
        },
        style,
      ]}
      {...viewProps}
    />
  );
};
