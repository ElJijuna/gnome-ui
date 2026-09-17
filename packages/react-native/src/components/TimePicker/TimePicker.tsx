import { PreferencesSystemTime } from '@gnome-ui/icons';
import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';
import { Text } from '@/components/Text';
import { useDateTimeFormatter, useGnomeTheme } from '@/GnomeProvider';

import { TimeFields } from './TimeFields';
import type { TimeValue } from './timeUtils';

export type { TimeValue } from './timeUtils';

export interface TimePickerProps {
  /** Controlled selected time. Pass `null` for "no selection". */
  value?: TimeValue | null;
  /** Initial selected time when uncontrolled. Defaults to `null`. */
  defaultValue?: TimeValue | null;
  /** Called when the user changes the time. */
  onChange?: (value: TimeValue) => void;
  /** 12- or 24-hour presentation. Defaults to `24`. */
  hourCycle?: 12 | 24;
  /** Minute increment for the spinner. Defaults to `1`. */
  minuteStep?: number;
  /** Text shown in the trigger while no time is selected. */
  placeholder?: string;
  /** Visible label rendered above the trigger. */
  label?: string;
  /** Accessible name for the trigger when no visible `label` is provided. */
  accessibilityLabel?: string;
  /** Disable the control. */
  disabled?: boolean;
  /** Preferred popover placement relative to the trigger. Defaults to `'bottom'`. */
  placement?: PopoverPlacement;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Hoisted to module scope for the same reason `DatePicker`'s own format
// option objects are — `useDateTimeFormatter`'s `useMemo` keys off `options`
// identity, so a fresh object literal every render would defeat it. `hour`/
// `minute` component options (not `timeStyle`) are used deliberately: they
// match the web version's own `Intl.DateTimeFormat({hour:'2-digit',
// minute:'2-digit', hourCycle})` exactly, whereas `DatePicker` needed
// `dateStyle`+`timeStyle` together since it also renders the day.
const TIME_24_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};
const TIME_12_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h12',
};

/**
 * Hour/minute selection built from paired `SpinButton`s inside a `Popover`,
 * behind an entry-styled trigger — mirrors the `GtkSpinButton` + `GtkPopover`
 * composition GNOME apps use for time entry, with 12- and 24-hour support.
 *
 * Rebuilt on this package's own already-shipped `Popover` (Tier 5) rather
 * than reinventing its trigger-rect + panel-size positioning, the same
 * standing pitfall `DatePicker` already avoided. The panel is just
 * `TimeFields` — no Done button, unlike `DatePicker`'s `showTime` footer:
 * there is no calendar tap to disambiguate from a close here, so each
 * column commits live and the popover only closes the same way `Dropdown`'s
 * does, by tapping outside or the trigger again.
 *
 * **`TimeFields`/`timeUtils` moved here from `DatePicker`'s own folder**,
 * where they first shipped as an internal dependency of its `showTime`
 * footer — this is their intended public home (per the ROADMAP note left
 * when `DatePicker` shipped), `DatePicker` now imports them from here
 * instead of carrying its own copy.
 *
 * The web version's entire keyboard layer drops (no `ArrowDown`-opens focus
 * management, no `Enter`/`Space` on the trigger) — the same touch-first
 * convention `DatePicker` already follows. `locale` is dropped in favor of
 * `GnomeProvider`'s app-wide `useDateTimeFormatter`, same as `DatePicker`.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/spin-buttons.html
 */
export const TimePicker = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  hourCycle = 24,
  minuteStep = 1,
  placeholder = 'Select a time',
  label,
  accessibilityLabel,
  disabled = false,
  placement = 'bottom',
  style,
  testID,
}: TimePickerProps) => {
  const theme = useGnomeTheme();

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<TimeValue | null>(defaultValue);
  const selected = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);

  // The columns always need a concrete time; noon is the same neutral
  // fallback `DatePicker` uses, and it isn't treated as a selection.
  const draft: TimeValue = selected ?? { hours: 12, minutes: 0 };

  const formatter = useDateTimeFormatter(hourCycle === 12 ? TIME_12_OPTIONS : TIME_24_OPTIONS);
  const displayValue = selected
    ? formatter.format(new Date(2000, 0, 1, selected.hours, selected.minutes))
    : placeholder;

  const commit = (next: TimeValue) => {
    if (!isControlled) {
      setUncontrolledValue(next);
    }
    onChange?.(next);
  };

  const panel = (
    <TimeFields value={draft} onChange={commit} hourCycle={hourCycle} minuteStep={minuteStep} />
  );

  return (
    <View style={[{ gap: theme.space1 }, style]}>
      {label && <Text variant="body">{label}</Text>}

      <Popover placement={placement} open={open} onOpenChange={setOpen} content={panel}>
        <Pressable
          testID={testID}
          role="button"
          disabled={disabled}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space1,
            minHeight: 36,
            minWidth: 160,
            paddingVertical: 7,
            paddingHorizontal: theme.space2,
            backgroundColor: pressed ? theme.activeOverlay : theme.cardBgColor,
            borderWidth: 1,
            borderColor: open ? theme.accentColor : theme.cardShadeColor,
            borderRadius: theme.radiusMd,
            opacity: disabled ? theme.opacityDisabled : 1,
          })}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: theme.fontSizeBody,
              color: theme.windowFgColor,
              opacity: selected ? 1 : theme.opacityDim,
            }}
          >
            {displayValue}
          </Text>
          <Icon icon={PreferencesSystemTime} size="sm" />
        </Pressable>
      </Popover>
    </View>
  );
};
