import { forwardRef, type ReactNode, useEffect, useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  TextInput as RNTextInput,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Animated, Pressable, View as RNView, TextInput } from 'react-native';

import { useGnomeTheme, useReducedMotion } from '@/GnomeProvider';

export interface EntryRowProps
  extends Omit<TextInputProps, 'style' | 'value' | 'defaultValue' | 'editable' | 'testID'> {
  /**
   * Acts as a floating label: shown small above the input once the field has
   * content or focus, and as the placeholder while it's empty and unfocused.
   */
  title: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called when the input value changes. */
  onValueChange?: (value: string) => void;
  /** Icon or widget placed at the leading edge. */
  leading?: ReactNode;
  /** Icon or widget placed at the trailing edge (e.g. a clear or reveal button). */
  trailing?: ReactNode;
  disabled?: boolean;
  /**
   * Applied to the row, not the input — the convention every other component
   * in this package follows. Reach the field itself with the accessible name
   * (`getByLabelText(title)`).
   */
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** `.labelFloated { top: 6px }`. */
const FLOATED_TOP = 6;

/**
 * Row with an inline text entry field, mirroring `AdwEntryRow` and
 * `@gnome-ui/react`'s own `EntryRow`. The `title` rises above the input as a
 * small label once the field is focused or has content, and stands in for
 * the placeholder until then. Use inside a `BoxedList` for settings that
 * take free-form text.
 *
 * The float is one JS-driven `Animated.Value` (`useNativeDriver: false`):
 * `fontSize` is part of the transition and can't be native-driven, and
 * mixing a native with a JS value on one component throws — the same
 * trade-off `Expander` and `InlineViewSwitcher` already accepted.
 * `useReducedMotion()` snaps between the two states instead.
 *
 * **The label's travel is measured, not hardcoded.** The web can express its
 * resting position as `top: 50%; transform: translateY(-50%)` and its
 * floated one as `top: 6px`, but RN can't interpolate between a percentage
 * and a fixed offset, so the row reports its own height through `onLayout`
 * and the distance is derived from it. That also keeps the label centred if
 * a consumer makes the row taller than the 56 dp minimum.
 *
 * The `:focus` inset ring is dropped rather than approximated. `TextField`'s
 * own precedent — recolor the border on focus — doesn't transfer, because an
 * `EntryRow` has no border of its own to recolor: it's a row inside a
 * `BoxedList`, and adding one would shift the list's geometry. On a touch
 * device the state is already unmistakable anyway: the label floats up, the
 * text fades in, and the keyboard opens. The `prefers-contrast: more` block
 * is a variation on that same ring, so it goes with it.
 *
 * Tapping anywhere on the row focuses the field, the same affordance the web
 * version's row-level `onClick` provides.
 *
 * The visible label is hidden from assistive tech and the `title` becomes
 * the input's `accessibilityLabel` instead. On the web the two are bound by
 * `<label htmlFor>`, which RN has no equivalent for — left as-is, the label
 * would be announced as loose text next to an unnamed field. `testID` lands
 * on the row rather than the input (unlike the web version, which spreads
 * every remaining prop onto the `<input>`), matching what every other
 * component in this package does; reach the field itself by its accessible
 * name.
 *
 * @example
 * const [name, setName] = useState('');
 *
 * <BoxedList>
 *   <EntryRow title="Display name" value={name} onValueChange={setName} />
 * </BoxedList>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.EntryRow.html
 */
export const EntryRow = forwardRef<RNTextInput, EntryRowProps>(function EntryRow(
  {
    title,
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    onChangeText,
    leading,
    trailing,
    disabled = false,
    onFocus,
    onBlur,
    accessibilityLabel,
    testID,
    style,
    ...inputProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const reducedMotion = useReducedMotion();

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const inputValue = isControlled ? controlledValue : uncontrolledValue;

  const [focused, setFocused] = useState(false);
  const [fieldHeight, setFieldHeight] = useState(56);
  const inputRef = useRef<RNTextInput | null>(null);

  const floated = focused || inputValue.length > 0;
  const float = useRef(new Animated.Value(floated ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      float.setValue(floated ? 1 : 0);
      return;
    }

    const animation = Animated.timing(float, {
      toValue: floated ? 1 : 0,
      duration: theme.durationFast,
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [floated, reducedMotion, float, theme.durationFast]);

  const restingLineHeight = Math.round(theme.fontSizeBody * theme.lineHeightBody);
  const floatedLineHeight = Math.round(theme.fontSizeCaption * theme.lineHeightBody);
  // Centred resting position → `FLOATED_TOP`, both expressed as the label's
  // own top edge so the travel is a single translateY.
  const restingTop = (fieldHeight - restingLineHeight) / 2;

  return (
    <Pressable
      accessible={false}
      testID={testID}
      disabled={disabled}
      onPress={() => inputRef.current?.focus()}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space2,
          paddingHorizontal: theme.space4,
          minHeight: 56,
          width: '100%',
          opacity: disabled ? theme.opacityDisabled : 1,
        },
        style,
      ]}
    >
      {leading ? <RNView style={{ flexShrink: 0 }}>{leading}</RNView> : null}

      <RNView
        onLayout={(event: LayoutChangeEvent) => setFieldHeight(event.nativeEvent.layout.height)}
        style={{ flex: 1, justifyContent: 'center', minHeight: 56 }}
      >
        <Animated.Text
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no"
          numberOfLines={1}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: restingTop,
            fontFamily: theme.fontFamily,
            color: theme.windowFgColor,
            fontSize: float.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.fontSizeBody, theme.fontSizeCaption],
            }),
            lineHeight: float.interpolate({
              inputRange: [0, 1],
              outputRange: [restingLineHeight, floatedLineHeight],
            }),
            opacity: float.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.opacityDim, 0.7],
            }),
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, FLOATED_TOP - restingTop],
                }),
              },
            ],
          }}
        >
          {title}
        </Animated.Text>

        <Animated.View style={{ opacity: float }}>
          <TextInput
            ref={(node) => {
              inputRef.current = node;

              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={inputValue}
            editable={!disabled}
            accessibilityLabel={accessibilityLabel ?? title}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChangeText={(next) => {
              if (!isControlled) {
                setUncontrolledValue(next);
              }

              onValueChange?.(next);
              onChangeText?.(next);
            }}
            style={{
              padding: 0,
              margin: 0,
              width: '100%',
              fontFamily: theme.fontFamily,
              fontSize: theme.fontSizeBody,
              lineHeight: restingLineHeight,
              color: theme.cardFgColor,
              paddingTop: theme.space4,
              paddingBottom: 4,
            }}
            {...inputProps}
          />
        </Animated.View>
      </RNView>

      {trailing ? (
        <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space1 }}>
          {trailing}
        </RNView>
      ) : null}
    </Pressable>
  );
});
