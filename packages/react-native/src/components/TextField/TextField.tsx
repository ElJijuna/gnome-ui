import { forwardRef, useState } from 'react';
import type { StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { TextInput as RNTextInput, View } from 'react-native';
import { Text } from '@/components/Text';
import { useGnomeTheme, useResolvedContrast } from '@/GnomeProvider';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Visible label rendered above the input. */
  label?: string;
  /** Helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the input in place of `helperText`.
   * Also applies the error visual state to the input border.
   */
  error?: string;
  /** Style applied to the wrapping `View`. */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the `TextInput` itself. */
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Multiplies an `rgba(r, g, b, a)` token's alpha channel. Tokens that
 * aren't `rgba()` (e.g. `windowFgColor` in some variants resolves to a flat
 * hex) are returned unchanged — good enough here since this is only ever
 * used to dim `windowFgColor`, which the generated theme always emits as
 * `rgba()`.
 */
function dimColor(color: string, factor: number): string {
  const match = color.match(/^rgba?\(([^,]+),([^,]+),([^,]+),?([^)]+)?\)$/);

  if (!match) {
    return color;
  }

  const [, r, g, b, a] = match;
  const alpha = (a ? Number.parseFloat(a) : 1) * factor;

  return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${alpha})`;
}

/**
 * Single-line text input with label, helper text, and error state.
 *
 * Follows the Adwaita `GtkEntry` / `.entry` style class.
 *
 * Rebuilt on RN's `TextInput` rather than ported from `@gnome-ui/react`'s
 * `<input>`: there's no `<label htmlFor>`/`aria-describedby` pairing on RN,
 * so `label` doubles as `accessibilityLabel` and `error`/`helperText`
 * double as `accessibilityHint` — announced together with the input the
 * same way `aria-describedby` reads them on the web. `:focus-visible`'s
 * accent border becomes plain `onFocus`/`onBlur` state — RN has no
 * hover/keyboard-vs-pointer focus distinction to mirror, and no outer
 * `box-shadow` ring, so focus is just a border-color change rather than a
 * grown ring. The web version's `disabled` prop is RN's own
 * `editable={false}` — mirrored here as a dimmed wrapper the same way
 * `@gnome-ui/react`'s `.disabled` class dims the label and hint alongside
 * the input.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/text-fields.html
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    error,
    style,
    inputStyle,
    editable = true,
    onFocus,
    onBlur,
    accessibilityLabel,
    accessibilityHint,
    ...inputProps
  },
  ref,
) {
  const theme = useGnomeTheme();
  const contrast = useResolvedContrast();
  const [focused, setFocused] = useState(false);
  const disabled = !editable;
  const hint = error ?? helperText;

  const borderColor = error ? theme.errorColor : focused ? theme.accentColor : theme.borderSubtle;

  return (
    <View style={[{ gap: theme.space1, opacity: disabled ? theme.opacityDisabled : 1 }, style]}>
      {label && (
        <Text
          variant="body"
          style={{ fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'] }}
        >
          {label}
        </Text>
      )}

      <RNTextInput
        ref={ref}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint ?? hint}
        placeholderTextColor={dimColor(theme.windowFgColor, theme.opacityDim)}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          {
            width: '100%',
            paddingVertical: 8,
            paddingHorizontal: theme.space2,
            fontFamily: theme.fontFamily,
            fontSize: theme.fontSizeBody,
            lineHeight: Math.round(theme.fontSizeBody * theme.lineHeightBody),
            color: theme.viewFgColor,
            backgroundColor: theme.viewBgColor,
            borderRadius: theme.radiusMd,
            borderWidth: contrast === 'more' ? 2 : 1,
            borderColor,
          } satisfies TextStyle,
          inputStyle,
        ]}
        {...inputProps}
      />

      {hint && (
        <Text
          variant="caption"
          style={{
            color: error ? theme.errorColor : theme.windowFgColor,
            opacity: error ? 1 : theme.opacityDim,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
});
