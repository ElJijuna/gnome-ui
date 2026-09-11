import { forwardRef, type ReactNode, useEffect, useRef, useState } from 'react';
import type { PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Animated, Easing, Pressable, View as RNView, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme, useResolvedColorScheme, useResolvedContrast } from '@/GnomeProvider';

export interface CheckRowProps extends Omit<PressableProps, 'children' | 'style' | 'onPress'> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge, after the checkbox. */
  leading?: ReactNode;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Called with the next value when the row is pressed. */
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const CHECKBOX_SIZE = 20;

/**
 * Activatable row with an integrated checkbox, mirroring
 * `@gnome-ui/react`'s `CheckRow`. The entire row is a single pressable —
 * pressing anywhere toggles the checked state. Use inside a `BoxedList`
 * when a user must select or deselect individual items in a list; prefer a
 * `SwitchRow` (once ported) for a single on/off setting.
 *
 * Supports both controlled (`checked`) and uncontrolled (`defaultChecked`)
 * modes, the same `isControlled`/internal-state-fallback shape already
 * established by `Expander`/`ComboRow`/`Popover`.
 *
 * The checkbox visual reuses `Checkbox`'s exact border/background
 * `Animated.Value` interpolation and checkmark-fade-in recipe — but as a
 * plain, non-interactive `View` rather than importing the real `Checkbox`
 * component, since `Checkbox` is itself a `Pressable` and nesting one
 * touchable inside another (the row's own `Pressable`) would create two
 * overlapping tap targets. `aria-labelledby` (pointing the web button's
 * `role="checkbox"` at the title/subtitle content) has no RN equivalent —
 * `accessibilityLabel` combining title and subtitle is the substitution,
 * the same "no relationship attribute" gap `Tooltip`'s dropped
 * `aria-describedby` already established. The title reads `theme.cardFgColor`
 * directly (not `Text`'s own `"default"`, which resolves to
 * `windowFgColor`) to match the source CSS's `--gnome-card-fg-color`
 * ambient row color exactly — the two tokens happen to share the same
 * value in every theme this package ships, but the source CSS's intent is
 * specifically "card foreground," so the port keeps that distinction.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.CheckButton.html
 */
export const CheckRow = forwardRef<View, CheckRowProps>(function CheckRow(
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

  const idleBorderColor =
    contrast === 'more' ? theme.windowFgColor : colorScheme === 'dark' ? theme.dark1 : theme.light4;

  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [idleBorderColor, theme.accentBgColor],
  });
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', theme.accentBgColor],
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
      accessibilityRole="checkbox"
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
          <Animated.View
            style={{
              width: CHECKBOX_SIZE,
              height: CHECKBOX_SIZE,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radiusSm,
              borderWidth: contrast === 'more' ? 2 : 1.5,
              borderColor,
              backgroundColor,
            }}
          >
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
          </Animated.View>

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
