import { type ReactNode, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { ActionRow } from '@/components/ActionRow';
import { SpinButton } from '@/components/SpinButton';
import { useGnomeTheme } from '@/GnomeProvider';

export interface SpinRowProps {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** Current value (controlled). */
  value?: number;
  /** Initial value when uncontrolled. Defaults to `0`. */
  defaultValue?: number;
  /** Called when the value changes. */
  onValueChange?: (value: number) => void;
  /** Minimum allowed value. Defaults to `0`. */
  min?: number;
  /** Maximum allowed value. Defaults to `100`. */
  max?: number;
  /** Amount to increment/decrement per step. Defaults to `1`. */
  step?: number;
  /** Number of decimal places shown. Derived from `step` when omitted. */
  decimals?: number;
  /** Accessible name for the spin button. Defaults to `title`. */
  accessibilityLabel?: string;
  /** Disables the row and its spin button. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Settings row with an integrated spin button for numeric values, mirroring
 * `AdwSpinRow` and `@gnome-ui/react`'s own `SpinRow`. Use inside a
 * `BoxedList` for settings with numeric ranges (volume, timeout duration,
 * count limits, etc.).
 *
 * **This is a composition of `ActionRow` + `SpinButton`** — same reasoning
 * as `ComboRow` (`ActionRow` + `Dropdown`): the row layout and the numeric
 * stepper are each already shipped, verified components, so nothing here is
 * rebuilt. `SpinButton` is controlled-only, so the uncontrolled `defaultValue`
 * state lives here, one level up, the same shape `ComboRow` already
 * established for `Dropdown`.
 *
 * The web version's keyboard interaction (↑/↓ one step, Page Up/Down ten
 * steps, Home/End to bounds) drops as it does everywhere else in this
 * package — `SpinButton` already provides the touch/screen-reader
 * equivalents it was built with (tap the visible −/+ buttons, or the
 * `accessibilityRole="adjustable"` increment/decrement actions).
 *
 * @example
 * <BoxedList>
 *   <SpinRow
 *     title="Volume"
 *     subtitle="Output level"
 *     value={volume}
 *     onValueChange={setVolume}
 *     min={0}
 *     max={100}
 *   />
 * </BoxedList>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SpinRow.html
 */
export const SpinRow = ({
  title,
  subtitle,
  leading,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  decimals,
  accessibilityLabel,
  disabled = false,
  style,
  testID,
}: SpinRowProps) => {
  const theme = useGnomeTheme();
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  return (
    <ActionRow
      testID={testID}
      title={title}
      subtitle={subtitle}
      leading={leading}
      disabled={disabled}
      style={[disabled ? { opacity: theme.opacityDisabled } : null, style]}
      trailing={
        <SpinButton
          value={value}
          min={min}
          max={max}
          step={step}
          decimals={decimals}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel ?? title}
          onChange={(next) => {
            if (!isControlled) {
              setUncontrolledValue(next);
            }

            onValueChange?.(next);
          }}
        />
      }
    />
  );
};
