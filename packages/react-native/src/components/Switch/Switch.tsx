import { forwardRef, useEffect, useRef } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable } from 'react-native';

import { useGnomeTheme, useResolvedColorScheme, useResolvedContrast } from '@/GnomeProvider';

export interface SwitchProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Whether the switch is on. */
  value: boolean;
  /** Called with the next value when the switch is pressed. */
  onValueChange?: (value: boolean) => void;
  /** Accessible label. Required when no visible label is associated. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 20;
const THUMB_INSET = 3;
/** Matches `@gnome-ui/react`'s `.switch:checked::before { transform: translateX(28px) }`. */
const THUMB_TRAVEL = 28;

/**
 * On/off toggle following the Adwaita switch style.
 *
 * Rebuilt on `Pressable`/`Animated.View` rather than ported from
 * `@gnome-ui/react`'s `<input type="checkbox" role="switch">`: RN has no
 * checkbox primitive to style, and the platform-supplied `Switch` can't be
 * skinned to match Adwaita, so the track and thumb are drawn by hand.
 * `value`/`onValueChange` (not `checked`/`onChange`) mirror RN's own
 * `Switch` API, which is the ecosystem convention this component overlaps
 * with — it's fully controlled, with no `defaultValue` escape hatch.
 *
 * Two of `Switch.module.css`'s colors are hardcoded per color scheme
 * inside a component-level `@media (prefers-color-scheme: dark)` block
 * rather than driven by a semantic token, so — unlike `Button`/`Link`/
 * `TextField`, which read a single token that already resolves correctly
 * per theme — the unchecked track/thumb colors here branch explicitly on
 * `useResolvedColorScheme()` to match. Track background/border color
 * animate (mirroring the CSS `transition` on `.switch`); the thumb's own
 * fill color does not, since the source CSS only transitions its
 * `transform`, not its `background-color`.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/switches.html
 */
export const Switch = forwardRef<View, SwitchProps>(function Switch(
  { value, onValueChange, disabled, style, ...pressableProps },
  ref,
) {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();
  const contrast = useResolvedContrast();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    // The initial `Animated.Value` above already matches `value` — skip
    // animating into a state the switch is already rendering, so it never
    // plays a transition before the user has touched it.
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

  const trackColorOff = colorScheme === 'dark' ? theme.dark2 : theme.light4;
  const thumbColorOff = colorScheme === 'dark' ? theme.light3 : '#fff';

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColorOff, theme.accentBgColor],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderSubtle, theme.accentBgColor],
  });

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      onPress={() => onValueChange?.(!value)}
      style={[{ opacity: disabled ? theme.opacityDisabled : 1 }, style]}
      {...pressableProps}
    >
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: theme.radiusPill,
          borderWidth: contrast === 'more' ? 2 : 1,
          borderColor,
          backgroundColor,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: THUMB_INSET,
              left: THUMB_INSET,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: theme.radiusPill,
              backgroundColor: value ? '#fff' : thumbColorOff,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, THUMB_TRAVEL],
                  }),
                },
              ],
            },
            contrast !== 'more' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.25,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
});
