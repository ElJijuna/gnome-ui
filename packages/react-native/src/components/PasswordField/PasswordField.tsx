import { ViewConceal, ViewReveal } from '@gnome-ui/icons';
import { forwardRef, useState } from 'react';
import type { StyleProp, TextInput, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { TextInput as RNTextInput, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Text';
import { useGnomeTheme, useResolvedContrast } from '@/GnomeProvider';

export interface PasswordFieldProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  /** Visible label rendered above the input. */
  label?: string;
  /** Helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the input in place of `helperText`.
   * Also applies the error visual state to the input border.
   */
  error?: string;
  /**
   * Show the peek toggle button that reveals the password as plain text.
   * Mirrors `GtkPasswordEntry`'s `show-peek-icon` property. Defaults to `true`.
   */
  revealable?: boolean;
  /** Accessible label for the toggle button while the password is hidden. */
  revealLabel?: string;
  /** Accessible label for the toggle button while the password is revealed. */
  concealLabel?: string;
  /** Style applied to the wrapping `View`. */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the `TextInput` itself. */
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Duplicated from `TextField` rather than shared — same small pure helper,
 * two call sites, not worth extracting (the same call already duplicated
 * verbatim between `TextField` and `SearchBar`).
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

const TOGGLE_SIZE = 28;

/**
 * Single-line password input with a peek toggle to reveal the value as
 * plain text, mirroring `@gnome-ui/react`'s `PasswordField`.
 *
 * `TextField` plus the exact reveal/conceal recipe `PasswordEntryRow`
 * already established for this package: `secureTextEntry` (not `revealed
 * ? 'text' : 'password'`, which has no RN equivalent), and the shipped
 * `IconButton` for the toggle rather than a hand-rolled pressable — a
 * circular icon button at `size="sm"` (28 dp) here, matching the web
 * version's own `size="sm"` on this component specifically (as opposed to
 * `PasswordEntryRow`'s default size, since that one sits inside a taller
 * row). The toggle is positioned absolutely at the input's trailing edge,
 * vertically centered — the RN port of the source CSS's `position:
 * absolute; inset-block-start: 50%; transform: translateY(-50%)` — and the
 * input gets extra trailing padding (`.hasToggle`'s `padding-inline-end`)
 * so typed text never runs under the button.
 *
 * Use this over `TextField` with a manually-set `secureTextEntry` (which
 * has no reveal affordance at all).
 *
 * @see https://docs.gtk.org/gtk4/class.PasswordEntry.html
 */
export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField(
  {
    label,
    helperText,
    error,
    revealable = true,
    revealLabel = 'Show password',
    concealLabel = 'Hide password',
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
  const [revealed, setRevealed] = useState(false);
  const disabled = !editable;
  const hint = error ?? helperText;
  const showToggle = revealable;

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

      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <RNTextInput
          ref={ref}
          editable={editable}
          secureTextEntry={!revealed}
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
              paddingEnd: showToggle ? TOGGLE_SIZE + theme.space2 + 6 : theme.space2,
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

        {showToggle && (
          <View style={{ position: 'absolute', end: 6 }}>
            <IconButton
              icon={revealed ? ViewConceal : ViewReveal}
              label={revealed ? concealLabel : revealLabel}
              variant="flat"
              size="sm"
              disabled={disabled}
              accessibilityState={{ selected: revealed, disabled }}
              onPress={() => setRevealed((current) => !current)}
            />
          </View>
        )}
      </View>

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
