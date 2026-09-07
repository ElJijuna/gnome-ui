import { type ReactNode, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { ActionRow } from '@/components/ActionRow';
import { Dropdown, type DropdownOption } from '@/components/Dropdown';
import { useGnomeTheme } from '@/GnomeProvider';

/** Same shape as `Dropdown`'s own option — re-exported so `ComboRow` reads self-contained. */
export type ComboRowOption<V extends string = string> = DropdownOption<V>;

export interface ComboRowProps<V extends string = string> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** The list of selectable options. */
  options: ComboRowOption<V>[];
  /** The currently selected value (controlled). */
  value?: V;
  /** Initial value when uncontrolled. */
  defaultValue?: V;
  /** Called when the user selects an option. */
  onValueChange?: (value: V) => void;
  /** Shown in the trigger while nothing is selected. Defaults to `"—"`. */
  placeholder?: string;
  /** Accessible name for the selector. Defaults to `title`. */
  accessibilityLabel?: string;
  /** Disables the row and its selector. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** `.comboWrap { min-width: 120px }`. */
const TRIGGER_MIN_WIDTH = 120;

/**
 * Settings row with an inline combo selector at the trailing edge, mirroring
 * `AdwComboRow` and `@gnome-ui/react`'s own `ComboRow`. Use inside a
 * `BoxedList` for a setting that picks one of a set of options.
 *
 * **This is a composition of `ActionRow` + `Dropdown`, where the web version
 * hand-rolls its own listbox inline** — around 200 lines re-implementing the
 * trigger, the flip-up placement, outside-click dismissal, roving
 * `aria-activedescendant` and the whole keyboard layer, none of which is
 * meaningfully different from that package's own `Dropdown`. Nothing forced
 * the duplication visually either: `.row` is `ActionRow`'s exact metrics
 * (12/24 dp padding, 52 dp min-height) and `.trigger` is `Dropdown`'s exact
 * trigger (card background, 1 px shade border turning accent when open,
 * `radius-md`, chevron). So this port composes the two already-shipped,
 * already-verified components instead — which also means the flip-to-fit
 * placement, the tap-outside dismissal and the `Modal`-based list all come
 * along for free rather than being rebuilt and re-debugged.
 *
 * The web keeps its own `useState` for the uncontrolled case; `Dropdown` is
 * controlled-only, so that state lives here — same behaviour, one level up.
 *
 * The keyboard layer (`↑`/`↓`/`Home`/`End`/`Enter`/`Escape`) drops as it
 * does everywhere else in this package, and `Dropdown` already provides the
 * touch equivalents it was built with.
 *
 * The dimming for `disabled` is applied here rather than left to
 * `ActionRow`, which only dims in its `interactive` branch — on a plain
 * (non-pressable) row its `disabled` prop currently reaches a `View` that
 * does nothing with it. Making this row `interactive` isn't the answer: the
 * `Dropdown` is the control, and the row itself has nothing to press.
 *
 * @example
 * <BoxedList>
 *   <ComboRow
 *     title="Language"
 *     subtitle="Used across the whole app"
 *     value={language}
 *     onValueChange={setLanguage}
 *     options={[
 *       { value: 'en', label: 'English' },
 *       { value: 'es', label: 'Español' },
 *     ]}
 *   />
 * </BoxedList>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ComboRow.html
 */
export const ComboRow = <V extends string = string>({
  title,
  subtitle,
  leading,
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  placeholder = '—',
  accessibilityLabel,
  disabled = false,
  style,
  testID,
}: ComboRowProps<V>) => {
  const theme = useGnomeTheme();
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<V | undefined>(defaultValue);
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
        <Dropdown
          options={options}
          value={value}
          placeholder={placeholder}
          accessibilityLabel={accessibilityLabel ?? title}
          disabled={disabled}
          onChange={(next) => {
            if (!isControlled) {
              setUncontrolledValue(next);
            }

            onValueChange?.(next);
          }}
          style={{ minWidth: TRIGGER_MIN_WIDTH }}
        />
      }
    />
  );
};
