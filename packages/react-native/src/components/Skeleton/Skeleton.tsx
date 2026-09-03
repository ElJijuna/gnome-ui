import { useEffect, useRef } from 'react';
import type { DimensionValue, StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Animated, Easing, View as RNView } from 'react-native';

import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

export interface SkeletonProps extends Omit<ViewProps, 'style'> {
  /** Shape of the placeholder. Defaults to `"rect"`. */
  variant?: SkeletonVariant;
  /** Width for rectangular placeholders. Defaults to `"100%"`. */
  width?: DimensionValue;
  /** Height for rectangular placeholders. Defaults to `16`. */
  height?: DimensionValue;
  /** Diameter for circular placeholders. Defaults to `40`. */
  size?: number;
  /** Number of rows for text placeholders. Defaults to `3`. */
  lines?: number;
  /** Enables the pulse animation. Respects `useReducedMotion()`. Defaults to `true`. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Loading placeholder for content-shaped skeleton screens.
 *
 * GNOME HIG recommends `Spinner` or `ProgressBar` for loading states; this
 * is a pragmatic web-style extension for layouts that benefit from
 * placeholder shape, ported as-is from `@gnome-ui/react`.
 *
 * The web version's shimmer is a `linear-gradient` swept across the shape
 * via `transform: translateX()`; this package has no gradient dependency
 * (no `expo-linear-gradient`/`react-native-linear-gradient` in its
 * dependency tree, and adding one for a single component would be scope
 * creep), so the animation is a plain opacity pulse instead — animating
 * `theme.skeletonBaseColor`'s own opacity between `1` and `0.5` on a
 * 1.4s round trip, the same cycle length as the web shimmer. This is a
 * common RN-idiomatic substitute for a CSS shimmer (compare Tailwind's own
 * `animate-pulse` utility, which uses the identical technique). Unlike
 * `Spinner` (slows) and `ProgressBar` (stops one state, slows the other),
 * `useReducedMotion()` here fully disables the pulse and shows a static
 * base color — mirroring the source CSS's own
 * `@media (prefers-reduced-motion: reduce) { animation: none }`, which has
 * no partial-motion in-between state to preserve.
 *
 * `theme.skeletonBaseColor` already resolves correctly per color scheme
 * (unlike `Spinner`'s track color, which the source CSS never actually
 * tokenizes), so no `useResolvedColorScheme()` branching is needed here.
 *
 * `accessible={false}` mirrors the web version's `aria-hidden="true"` — a
 * loading placeholder carries no information a screen reader user needs,
 * same reasoning `Separator` already established for a purely decorative
 * element.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/progress.html
 */
export const Skeleton = ({
  variant = 'rect',
  width = '100%',
  height = 16,
  size = 40,
  lines = 3,
  animated = true,
  style,
  ...viewProps
}: SkeletonProps) => {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(1)).current;

  const isPulsing = animated && !reducedMotion;

  useEffect(() => {
    if (!isPulsing) {
      pulse.setValue(1);

      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;
    const easing = Easing.bezier(x1, y1, x2, y2);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 700, easing, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing, useNativeDriver: true }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [isPulsing, pulse, theme.easingDefault]);

  if (variant === 'text') {
    const lineCount = Math.max(1, Math.floor(lines));

    return (
      <RNView accessible={false} style={[{ gap: 8 }, style]} {...viewProps}>
        {Array.from({ length: lineCount }, (_, index) => (
          <Animated.View
            // biome-ignore lint/suspicious/noArrayIndexKey: lines have no natural stable id
            key={index}
            style={{
              width: index === lineCount - 1 ? '60%' : '100%',
              height: 12,
              borderRadius: theme.radiusPill,
              backgroundColor: theme.skeletonBaseColor,
              opacity: pulse,
            }}
          />
        ))}
      </RNView>
    );
  }

  const shapeStyle: ViewStyle =
    variant === 'circle'
      ? { width: size, height: size, borderRadius: size / 2 }
      : { width, height, borderRadius: theme.radiusMd };

  return (
    <Animated.View
      accessible={false}
      style={[shapeStyle, { backgroundColor: theme.skeletonBaseColor, opacity: pulse }, style]}
      {...viewProps}
    />
  );
};
