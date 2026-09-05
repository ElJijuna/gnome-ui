import { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, View } from 'react-native';

import { useGnomeTheme, useReducedMotion, useResolvedColorScheme } from '@/GnomeProvider';
import type { GnomeThemeTokens } from '@/theme';

export type LevelBarVariant = 'accent' | 'success' | 'warning' | 'error';

export interface LevelBarProps {
  /** Current value, between `min` and `max`. */
  value: number;
  /** Minimum value. Defaults to `0`. */
  min?: number;
  /** Maximum value. Defaults to `1`. */
  max?: number;
  /** Threshold at or below which the bar renders in `lowVariant`. */
  low?: number;
  /** Color used when `value <= low`. Defaults to `"warning"`. */
  lowVariant?: LevelBarVariant;
  /** Threshold at or above which the bar renders in `highVariant`. */
  high?: number;
  /** Color used when `value >= high`. Defaults to `"error"`. */
  highVariant?: LevelBarVariant;
  /** Color used between `low` and `high`. Defaults to `"accent"`. */
  variant?: LevelBarVariant;
  /**
   * Render as a row of discrete blocks instead of a continuous fill —
   * mirrors `GtkLevelBar`'s discrete mode (e.g. signal-strength indicators).
   */
  discrete?: boolean;
  /** Number of blocks when `discrete` is true. Defaults to `10`. */
  numBlocks?: number;
  /** Accessible label describing what the level represents. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function resolveVariant(
  value: number,
  low: number | undefined,
  lowVariant: LevelBarVariant,
  high: number | undefined,
  highVariant: LevelBarVariant,
  variant: LevelBarVariant,
): LevelBarVariant {
  if (low !== undefined && value <= low) {
    return lowVariant;
  }

  if (high !== undefined && value >= high) {
    return highVariant;
  }

  return variant;
}

function variantColor(theme: GnomeThemeTokens, variant: LevelBarVariant): string {
  switch (variant) {
    case 'accent':
      return theme.accentBgColor;
    case 'success':
      return theme.successBgColor;
    case 'warning':
      return theme.warningBgColor;
    case 'error':
      return theme.errorBgColor;
  }
}

/**
 * Discrete level indicator with color-coded low/high offset zones —
 * mirrors `GtkLevelBar` and `@gnome-ui/react`'s `LevelBar`. Use for a
 * gauge/measurement display (disk usage, battery, signal strength), not
 * for task progress (see `ProgressBar`) or a proportional category
 * breakdown (see `SegmentedBar`).
 *
 * The continuous fill reuses `ProgressBar`'s exact animation technique
 * rather than animating `width` directly: a fixed `width: '100%'` fill
 * with `transformOrigin: 'left'` and an animated `transform: [{ scaleX }]`,
 * so the whole thing runs on `useNativeDriver: true` — a JS-driven
 * (`useNativeDriver: false`) `width` animation schedules its next frame via
 * a plain `setTimeout` that routinely fires after a test's `render()`
 * returns but before unmount, producing a real "update not wrapped in
 * act()" warning, the same reasoning `ProgressBar`'s own docstring
 * documents. `useReducedMotion()` mirrors `ProgressBar`'s determinate
 * behavior: the transition duration drops to `0` (an immediate jump)
 * rather than the animation being skipped in some other way.
 *
 * Discrete mode's per-block `background-color` transition has no port —
 * unlike the continuous fill's width change, a value change in discrete
 * mode is a binary color swap per block with no established `Animated`
 * color-interpolation precedent elsewhere in this package, so it's a
 * plain, unanimated style swap; a decorative nicety, not a behavior gap.
 * Discrete blocks are hidden from the accessibility tree
 * (`accessibilityElementsHidden`/`importantForAccessibility="no"`,
 * mirroring the web version's `aria-hidden`) since the meter's value is
 * already exposed once via `accessibilityValue` on the container.
 *
 * `role="meter"` ports 1:1 from RN's newer web-aligned `Role` union (unlike
 * `AccessibilityRole`, which has no `"meter"` value at all) — the same
 * precedent `Dialog`/`Avatar`/`Badge` already established for reaching for
 * `role` over `accessibilityRole` when only the newer union has the value
 * needed. Web's `aria-labelledby` (an id-relationship prop) has no RN
 * equivalent — RN has no DOM ids — so only `aria-label`
 * (`accessibilityLabel`) is ported, the same `ProgressBar`/`Slider`
 * precedent.
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/progress.html
 */
export const LevelBar = ({
  value,
  min = 0,
  max = 1,
  low,
  lowVariant = 'warning',
  high,
  highVariant = 'error',
  variant = 'accent',
  discrete = false,
  numBlocks = 10,
  accessibilityLabel,
  style,
  testID,
}: LevelBarProps) => {
  const theme = useGnomeTheme();
  const scheme = useResolvedColorScheme();
  const reducedMotion = useReducedMotion();

  const range = max - min;
  const clamped = Math.min(max, Math.max(min, value));
  const fraction = range > 0 ? (clamped - min) / range : 0;
  const resolvedVariant = resolveVariant(clamped, low, lowVariant, high, highVariant, variant);

  const scaleX = useRef(new Animated.Value(fraction)).current;

  useEffect(() => {
    if (discrete) {
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(scaleX, {
      toValue: fraction,
      duration: reducedMotion ? 0 : theme.durationNormal,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: true,
    }).start();
  }, [fraction, discrete, reducedMotion, scaleX, theme.durationNormal, theme.easingDefault]);

  const trackColor = scheme === 'dark' ? theme.dark2 : theme.light3;

  return (
    <View
      testID={testID}
      accessible
      role="meter"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: clamped }}
      style={[
        {
          flexDirection: 'row',
          width: '100%',
          height: 6,
          borderRadius: discrete ? 0 : theme.radiusPill,
          backgroundColor: discrete ? 'transparent' : trackColor,
          overflow: discrete ? 'visible' : 'hidden',
          gap: discrete ? 2 : 0,
        },
        style,
      ]}
    >
      {discrete ? (
        Array.from({ length: numBlocks }, (_, i) => {
          const blockFraction = (i + 1) / numBlocks;
          const filled = blockFraction <= fraction;

          return (
            <View
              key={i}
              testID="level-bar-block"
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{
                flex: 1,
                height: '100%',
                minWidth: 2,
                borderRadius: 1,
                backgroundColor: filled ? variantColor(theme, resolvedVariant) : trackColor,
              }}
            />
          );
        })
      ) : (
        <Animated.View
          testID={testID ? `${testID}-fill` : undefined}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: theme.radiusPill,
            backgroundColor: variantColor(theme, resolvedVariant),
            transformOrigin: 'left',
            transform: [{ scaleX }],
          }}
        />
      )}
    </View>
  );
};
