import { forwardRef, type ReactNode, useEffect, useRef, useState } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, View as RNView, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useResolvedColorScheme, useResolvedContrast } from '@/GnomeProvider';

export interface SwitchRowProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Called with the next value when the row is pressed. */
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 20;
const THUMB_INSET = 3;
const THUMB_TRAVEL = 28;

/**
 * Activatable row with an integrated switch, mirroring `@gnome-ui/react`'s
 * `SwitchRow`. The entire row is a single pressable — pressing anywhere
 * toggles the switch, which is why this isn't `ActionRow` + a trailing
 * `Switch` (the ROADMAP's own guess): `AdwSwitchRow` makes the whole row the
 * interactive element, the same shape `CheckRow` already established for
 * its checkbox. Prefer this over `CheckRow` for a single on/off setting,
 * and `CheckRow` for selecting/deselecting individual items in a list.
 *
 * The switch visual reuses `Switch`'s exact track/thumb `Animated.Value`
 * interpolation, but as plain non-interactive `Animated.View`s rather than
 * importing the real `Switch` component — `Switch` is itself a `Pressable`,
 * and nesting one touchable inside another (the row's own `Pressable`)
 * would create two overlapping tap targets, the same reasoning `CheckRow`
 * already applied to `Checkbox`. `aria-labelledby` (pointing the web
 * button's `role="switch"` at the title/subtitle content) has no RN
 * equivalent — `accessibilityLabel` combining title and subtitle is the
 * substitution, same as `CheckRow`.
 *
 * Supports both controlled (`checked`) and uncontrolled (`defaultChecked`)
 * modes, the same `isControlled`/internal-state-fallback shape already
 * established by `Expander`/`ComboRow`/`Popover`/`CheckRow`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SwitchRow.html
 */
export const SwitchRow = forwardRef<View, SwitchRowProps>(function SwitchRow(
  {
    title,
    subtitle,
    leading,
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    style,
    ...pressableProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const colorScheme = useResolvedColorScheme();
  const contrast = useResolvedContrast();

  const isControlled = controlledChecked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const [x1, y1, x2, y2] = theme.easingDefault;

    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: theme.durationFast,
      easing: Easing.bezier(x1, y1, x2, y2),
      useNativeDriver: false,
    }).start();
  }, [checked, progress, theme.durationFast, theme.easingDefault]);

  const trackColorOff = colorScheme === 'dark' ? theme.dark2 : theme.light4;
  const thumbColorOff = colorScheme === 'dark' ? theme.light3 : '#fff';

  const trackBackgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColorOff, theme.accentBgColor],
  });
  const trackBorderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.borderSubtle, theme.accentBgColor],
  });

  const handlePress = () => {
    const next = !checked;

    if (!isControlled) {
      setUncontrolledChecked(next);
    }

    onCheckedChange?.(next);
  };

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingVertical: theme.space2,
          paddingHorizontal: theme.space4,
          minHeight: 52,
          width: '100%',
          opacity: disabled ? theme.opacityDisabled : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <>
          {leading && <RNView style={{ flexShrink: 0 }}>{leading}</RNView>}

          <RNView style={{ flex: 1, gap: 2 }}>
            <Text
              variant="body"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: theme.cardFgColor,
                fontWeight: String(theme.fontWeightNormal) as TextStyle['fontWeight'],
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text variant="caption" color="dim" numberOfLines={1} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </RNView>

          <Animated.View
            style={{
              width: TRACK_WIDTH,
              height: TRACK_HEIGHT,
              flexShrink: 0,
              borderRadius: theme.radiusPill,
              borderWidth: contrast === 'more' ? 2 : 1,
              borderColor: trackBorderColor,
              backgroundColor: trackBackgroundColor,
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
                  backgroundColor: checked ? '#fff' : thumbColorOff,
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

          {pressed && !disabled ? (
            <RNView
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.activeOverlay }]}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
});
