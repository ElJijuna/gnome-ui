import { forwardRef, useEffect, useRef } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme, useResolvedContrast } from '@/GnomeProvider';

export interface RadioButtonProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Whether this radio button is the selected one in its group. */
  value: boolean;
  /**
   * Called when pressed while unselected. RN has no `name`-attribute
   * grouping like the web `<input type="radio">`, so mutual exclusivity
   * within a group is the consumer's responsibility — render one
   * `RadioButton` per option and drive `value` from shared selection
   * state, flipping it in `onSelect`.
   */
  onSelect?: () => void;
  /** Accessible label. Required when no visible label is associated. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const SIZE = 18;
const DOT_SIZE = 6;

/**
 * Single-selection radio button following the GNOME HIG and Adwaita style.
 *
 * Rebuilt on `Pressable`/`Animated.View` rather than ported from
 * `@gnome-ui/react`'s `<input type="radio">`: reuses `Checkbox`'s exact
 * border/background transition technique (same `Animated.Value`, same
 * mount-skip guard so it never animates before the user touches it, same
 * `useResolvedColorScheme()`/`useResolvedContrast()` branching for the
 * idle border color, since the source CSS hardcodes those the same way
 * `Checkbox.module.css` does) — just circular, with a filled dot instead
 * of a checkmark, and no indeterminate state.
 *
 * The web version's `name`-attribute grouping has no RN equivalent, so
 * grouping is fully manual here: render one `RadioButton` per option and
 * manage the selected option in the parent, same as any other controlled
 * list of options.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/radio-buttons.html
 */
export const RadioButton = forwardRef<View, RadioButtonProps>(function RadioButton(
  { value, onSelect, disabled, style, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();
  const contrast = useResolvedContrast();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    // The initial `Animated.Value` above already matches `value` — skip
    // animating into a state the radio button is already rendering, so it
    // never plays a transition before the user has touched it.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: theme.durationFast,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: false,
    }).start();
  }, [value, progress, theme.durationFast, theme.easingDefault]);

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
      accessibilityRole="radio"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      onPress={() => {
        if (!value) {
          onSelect?.();
        }
      }}
      style={[{ opacity: disabled ? theme.opacityDisabled : 1 }, style]}
      {...pressableProps}
    >
      <Animated.View
        style={{
          width: SIZE,
          height: SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radiusPill,
          borderWidth: contrast === 'more' ? 2 : 1.5,
          borderColor,
          backgroundColor,
        }}
      >
        <Animated.View
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: theme.radiusPill,
            backgroundColor: '#fff',
            opacity: progress,
          }}
        />
      </Animated.View>
    </Pressable>
  );
});
