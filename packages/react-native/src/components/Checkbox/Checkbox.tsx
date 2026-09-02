import { forwardRef, useEffect, useRef } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme, useResolvedContrast } from '@/GnomeProvider';

export interface CheckboxProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Whether the checkbox is checked. */
  value: boolean;
  /**
   * Indeterminate state — shown when only some items in a group are
   * checked. Takes visual precedence over `value`.
   */
  indeterminate?: boolean;
  /** Called with the next value when the checkbox is pressed. */
  onValueChange?: (value: boolean) => void;
  /** Accessible label. Required when no visible label is associated. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZE = 18;

/**
 * Checkbox for multi-selection, following the GNOME HIG and Adwaita style.
 *
 * Supports three states: unchecked, checked, and indeterminate (mixed).
 * Use `indeterminate` for "select all" controls when only some items are
 * selected.
 *
 * Rebuilt on `Pressable`/`Animated.View` rather than ported from
 * `@gnome-ui/react`'s `<input type="checkbox">`: RN has no `indeterminate`
 * DOM property to set imperatively (the web version's whole reason for a
 * ref + effect), so it's just a rendering branch here — `indeterminate`
 * draws a short bar, otherwise a checkmark, both fading in via the same
 * `Animated.Value` used for the border/background transition. The
 * checkmark itself is a `✓` glyph in a plain (non-themed) `Text` rather
 * than the web version's `clip-path` polygon — this package has no SVG
 * dependency to draw one exactly, and `Link`'s external-link indicator
 * already established a Unicode glyph as this codebase's fallback for a
 * small decorative mark with no icon library available.
 *
 * `value`/`onValueChange` mirror the same convention as `Switch`, RN's own
 * toggle-control shape, rather than the web version's `checked`/`onChange`.
 * The idle border color is another `Switch`-style case where the source
 * CSS hardcodes a palette swatch per color scheme instead of a token that
 * already resolves per theme, so it branches on `useResolvedColorScheme()`
 * the same way.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/checkboxes.html
 */
export const Checkbox = forwardRef<View, CheckboxProps>(function Checkbox(
  { value, indeterminate = false, onValueChange, disabled, style, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();
  const contrast = useResolvedContrast();
  const marked = value || indeterminate;
  const progress = useRef(new Animated.Value(marked ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    // The initial `Animated.Value` above already matches `marked` — skip
    // animating into a state the checkbox is already rendering, so it
    // never plays a transition before the user has touched it.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: marked ? 1 : 0,
      duration: theme.durationFast,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: false,
    }).start();
  }, [marked, progress, theme.durationFast, theme.easingDefault]);

  const idleBorderColor =
    contrast === 'more' ? theme.windowFgColor : colorScheme === 'dark' ? theme.dark1 : theme.light4;

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [idleBorderColor, theme.accentBgColor],
  });
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.cardBgColor, theme.accentBgColor],
  });

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : value, disabled: !!disabled }}
      onPress={() => onValueChange?.(!value)}
      style={[{ opacity: disabled ? theme.opacityDisabled : 1 }, style]}
      {...pressableProps}
    >
      <Animated.View
        style={{
          width: SIZE,
          height: SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radiusSm,
          borderWidth: contrast === 'more' ? 2 : 1.5,
          borderColor,
          backgroundColor,
        }}
      >
        {indeterminate ? (
          <Animated.View
            style={{
              width: 10,
              height: 2,
              borderRadius: 1,
              backgroundColor: '#fff',
              opacity: progress,
            }}
          />
        ) : (
          <Animated.Text
            style={{
              opacity: progress,
              color: '#fff',
              fontSize: 13,
              fontWeight: 'bold',
              lineHeight: 13,
            }}
          >
            {'✓'}
          </Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
});
