import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useGnomeTheme } from '@/GnomeProvider';

export interface FieldGroupProps extends Omit<ViewProps, 'style'> {
  /** Group heading, rendered above the grouped content. */
  label: string;
  /** Helper text shown below the label. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message shown below the label in place of `helperText`.
   * Announced via `role="alert"` when it appears.
   */
  error?: string;
  /**
   * Visually dims the group. Unlike the web version's native
   * `<fieldset disabled>`, this does not automatically disable descendant
   * controls — RN has no equivalent of a fieldset's built-in
   * disabled-propagates-to-descendants behavior, so each child control
   * must still be disabled individually.
   */
  disabled?: boolean;
  /** Arbitrary field content — checkboxes, radios, a custom composite field, etc. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Generic form-field grouping with a shared label, help text, and error
 * message, for arbitrary fields outside a `BoxedList`. Mirrors
 * `@gnome-ui/react`'s `FieldGroup`.
 *
 * `PreferencesGroup` is scoped specifically to wrapping settings rows
 * inside a `BoxedList` — use `FieldGroup` for a plain labeled grouping
 * around any set of related form controls (e.g. a `RadioButton` group or
 * several `Checkbox`es sharing one label and error), independent of the
 * settings-page layout.
 *
 * `<fieldset>`/`<legend>` have no RN element equivalent — this renders as
 * a plain `View` with `role="group"` (the closest match to a fieldset's
 * implicit ARIA role; RN's `Role` union has it natively, no substitution
 * needed) and a themed `Text` label in place of the `<legend>`. The web
 * version's `aria-describedby` (an id-relationship prop) has no RN
 * equivalent and is dropped, the same "no relationship attribute" gap
 * `ProgressBar`/`LevelBar`/`Expander` already established. The hint/error
 * text reuses `TextField`'s exact recipe verbatim — `error ?? helperText`
 * picks the message, `error ? theme.errorColor : theme.windowFgColor` plus
 * `error ? 1 : theme.opacityDim` picks the color/opacity — rather than
 * re-deriving the same dim-vs-error styling logic independently.
 * `disabled` only dims the group visually (`theme.opacityDisabled`); see
 * the prop doc for why it can't also disable descendants automatically.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/
 */
export const FieldGroup = ({
  label,
  helperText,
  error,
  disabled = false,
  children,
  style,
  ...viewProps
}: FieldGroupProps) => {
  const theme = useGnomeTheme();
  const hint = error ?? helperText;

  return (
    <View
      role="group"
      style={[{ gap: theme.space1, opacity: disabled ? theme.opacityDisabled : 1 }, style]}
      {...viewProps}
    >
      <Text
        variant="body"
        style={{
          color: theme.windowFgColor,
          fontWeight: String(theme.fontWeightSemibold) as TextStyle['fontWeight'],
        }}
      >
        {label}
      </Text>

      {hint && (
        <Text
          role={error ? 'alert' : undefined}
          variant="caption"
          style={{
            color: error ? theme.errorColor : theme.windowFgColor,
            opacity: error ? 1 : theme.opacityDim,
          }}
        >
          {hint}
        </Text>
      )}

      <View style={{ gap: theme.space2 }}>{children}</View>
    </View>
  );
};
