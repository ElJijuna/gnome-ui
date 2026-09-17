import { XOfficeCalendar } from '@gnome-ui/icons';
import { useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import type { WeekStart } from '@/components/Calendar/calendarUtils';
import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';
import { Text } from '@/components/Text';
import { useDateTimeFormatter, useGnomeTheme } from '@/GnomeProvider';

import { TimeFields } from './TimeFields';
import { mergeDateAndTime, type TimeValue, timeOf } from './timeUtils';

export interface DatePickerProps {
  /** Controlled selected date. Pass `null` for "no selection". */
  value?: Date | null;
  /** Initial selected date when uncontrolled. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called when the user picks a date (or, with `showTime`, edits a time column). */
  onChange?: (date: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** First day of the week: `0` (Sunday) … `6` (Saturday). Defaults to `1` (Monday). */
  weekStartsOn?: WeekStart;
  /**
   * Add hour/minute columns under the calendar, making the emitted `Date` a
   * point in time rather than a civil date. Picking a day then keeps the
   * popover open — the selection is only finished by the Done button.
   */
  showTime?: boolean;
  /** 12- or 24-hour columns when `showTime` is on. Defaults to `24`. */
  hourCycle?: 12 | 24;
  /** Minute increment for the time spinner. Defaults to `1`. */
  minuteStep?: number;
  /** Label on the button that closes a `showTime` popover. Defaults to `'Done'`. */
  doneLabel?: string;
  /** Text shown in the trigger while no date is selected. */
  placeholder?: string;
  /** Visible label rendered above the trigger. */
  label?: string;
  /** Accessible name for the trigger when no visible `label` is provided. */
  accessibilityLabel?: string;
  /** Show an ISO week-number column in the calendar. */
  showWeekNumbers?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Preferred popover placement relative to the trigger. Defaults to `'bottom'`. */
  placement?: PopoverPlacement;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Hoisted to module scope so `useDateTimeFormatter`'s `useMemo`-over-`options`
// identity check actually holds across renders — the same `Calendar`
// precedent (the first component in this package to seriously exercise that
// hook). Three fixed combinations cover every `showTime`/`hourCycle` pairing,
// so there's no need for an arbitrary caller-supplied `formatOptions` prop
// the way the web version has one: the hook's own `{...dateTimeFormat,
// ...options}` merge already expresses `dateStyle`+`timeStyle`+`hourCycle`
// together, confirmed by reading `useDateTimeFormatter` before relying on it.
const DATE_ONLY_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };
const DATE_TIME_24_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
};
const DATE_TIME_12_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h12',
};

// The web version widens its popover panel for the `showTime` footer because
// a 12-hour row of three `SpinButton` columns is wider than the default
// 320 dp cap. `SpinButton`'s own fixed per-column minimum (two 36 dp
// buttons plus a 56 dp value `Text`) makes that footer wide enough that it
// can still approach a narrow phone's screen width even after widening —
// `TimeFields`' `flexWrap` lets the Done button drop to its own line rather
// than forcing horizontal scroll or clipping.
const TIME_PANEL_STYLE: ViewStyle = { maxWidth: 420 };

/**
 * A `Popover`-anchored `Calendar` behind a text-entry-styled trigger —
 * mirrors the `GtkCalendar` + `GtkPopover` composition GNOME apps use for
 * date entry.
 *
 * Rebuilt on this package's own already-shipped `Popover` (Tier 5) and
 * `Calendar` (Tier 20) rather than reinventing either: the trigger is a
 * `Pressable` styled like `Dropdown`'s own text-entry-look trigger (same
 * bordered row, dimmed placeholder, trailing icon), and the panel is
 * `Calendar` plus an optional `showTime` footer, composed exactly the way
 * `Popover`'s own doc comment expects a rich-content consumer to use it —
 * no new position-computation code, per this package's standing pitfall
 * about not reinventing `Popover`/`Dropdown`'s already-shipped trigger-rect
 * + panel-size positioning.
 *
 * **The web version's entire keyboard layer drops** — no `ArrowDown`-opens,
 * no `Enter`/`Space` on the trigger — the same touch-first convention this
 * whole package follows; `Calendar`'s own `autoFocus` prop was already
 * dropped when `Calendar` was ported (no keyboard focus concept without a
 * keyboard), so it isn't wired here either. `locale`/`formatOptions` are
 * dropped in favor of `GnomeProvider`'s app-wide `useDateTimeFormatter`,
 * following `Calendar`'s own just-shipped convention rather than
 * reintroducing a locale prop pair.
 *
 * Picking a day keeps the popover open when `showTime` is on (only the Done
 * button closes it, so the time columns stay reachable) and closes it
 * immediately otherwise — ported as-is from the web version's
 * `handleSelect`, plain state logic with no web-only API involved.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
 */
export const DatePicker = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  min,
  max,
  weekStartsOn = 1,
  showTime = false,
  hourCycle = 24,
  minuteStep = 1,
  doneLabel = 'Done',
  placeholder = 'Select a date',
  label,
  accessibilityLabel,
  showWeekNumbers = false,
  disabled = false,
  placement = 'bottom',
  style,
  testID,
}: DatePickerProps) => {
  const theme = useGnomeTheme();

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const selected = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);

  const formatOptions = showTime
    ? hourCycle === 12
      ? DATE_TIME_12_OPTIONS
      : DATE_TIME_24_OPTIONS
    : DATE_ONLY_OPTIONS;
  const formatter = useDateTimeFormatter(formatOptions);
  const displayValue = selected ? formatter.format(selected) : placeholder;

  // The columns always need a concrete time; noon is the same neutral
  // fallback `TimePicker` uses, and it isn't treated as a selection until a
  // day lands.
  const draftTime: TimeValue = useMemo(
    () => (selected ? timeOf(selected) : { hours: 12, minutes: 0 }),
    [selected],
  );

  const commit = (date: Date) => {
    if (!isControlled) {
      setUncontrolledValue(date);
    }
    onChange?.(date);
  };

  const handleSelect = (date: Date) => {
    // `Calendar` hands back a civil date at local midnight, so the time in
    // play has to be carried over rather than reset on every day tap.
    commit(showTime ? mergeDateAndTime(date, draftTime) : date);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (time: TimeValue) => {
    // Editing the time before any day picks today — otherwise there is
    // nothing to attach the clock reading to.
    commit(mergeDateAndTime(selected ?? new Date(), time));
  };

  const panel = (
    <View style={{ gap: theme.space2 }}>
      <Calendar
        value={selected}
        defaultMonth={selected ?? undefined}
        onChange={handleSelect}
        min={min}
        max={max}
        weekStartsOn={weekStartsOn}
        showWeekNumbers={showWeekNumbers}
        testID={testID ? `${testID}-calendar` : undefined}
      />

      {showTime && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space2,
          }}
        >
          <TimeFields
            value={draftTime}
            onChange={handleTimeChange}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
          />
          <Button variant="suggested" size="sm" onPress={() => setOpen(false)}>
            {doneLabel}
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={[{ gap: theme.space1 }, style]}>
      {label && <Text variant="body">{label}</Text>}

      <Popover
        placement={placement}
        open={open}
        onOpenChange={setOpen}
        panelStyle={showTime ? TIME_PANEL_STYLE : undefined}
        content={panel}
      >
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
          <Icon icon={XOfficeCalendar} size="sm" />
        </Pressable>
      </Popover>
    </View>
  );
};
