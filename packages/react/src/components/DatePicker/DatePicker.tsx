import { XOfficeCalendar } from '@gnome-ui/icons';
import { type KeyboardEvent, useId, useMemo, useState } from 'react';

import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import type { WeekStart } from '@/components/Calendar/calendarUtils';
import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';
import { TimeFields } from '@/components/TimePicker/TimeFields';
import { mergeDateAndTime, type TimeValue, timeOf } from '@/components/TimePicker/timeUtils';

import styles from './DatePicker.module.css';

export interface DatePickerProps {
  /** Controlled selected date. Pass `null` for "no selection". */
  value?: Date | null;
  /** Initial selected date when uncontrolled. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called when the user picks a date. */
  onChange?: (date: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** First day of the week: `0` (Sunday) … `6` (Saturday). Defaults to `1` (Monday). */
  weekStartsOn?: WeekStart;
  /** BCP-47 locale for the calendar and the displayed date. Defaults to the runtime locale. */
  locale?: string;
  /**
   * `Intl.DateTimeFormatOptions` for the text shown in the trigger. Defaults to
   * `{ dateStyle: 'medium' }`, or `{ dateStyle: 'medium', timeStyle: 'short' }`
   * once `showTime` is on.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
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
  'aria-label'?: string;
  /** Show an ISO week-number column in the calendar. */
  showWeekNumbers?: boolean;
  /** Disable the control. */
  disabled?: boolean;
  /** Preferred popover placement relative to the trigger. Defaults to `'bottom'`. */
  placement?: PopoverPlacement;
  /** Explicit id for the trigger. Auto-generated when omitted. */
  id?: string;
  className?: string;
}

/**
 * A `Popover`-anchored `Calendar` behind an entry-styled trigger — mirrors the
 * `GtkCalendar` + `GtkPopover` composition GNOME apps use for date entry.
 *
 * The trigger reads out the formatted selection (or a placeholder), opens the
 * calendar on click, <kbd>Enter</kbd>/<kbd>Space</kbd>, or <kbd>↓</kbd>, and
 * closes it once a day is chosen — returning focus to the trigger. All keyboard
 * navigation inside the panel is provided by `Calendar`.
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
  locale,
  formatOptions,
  showTime = false,
  hourCycle = 24,
  minuteStep = 1,
  doneLabel = 'Done',
  placeholder = 'Select a date',
  label,
  'aria-label': ariaLabel,
  showWeekNumbers = false,
  disabled = false,
  placement = 'bottom',
  id: idProp,
  className,
}: DatePickerProps) => {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const selected = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);

  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;

  const resolvedFormat: Intl.DateTimeFormatOptions =
    formatOptions ??
    (showTime
      ? {
          dateStyle: 'medium',
          timeStyle: 'short',
          // Follow the columns: 24-hour spinners must not read "3:00 PM".
          hourCycle: hourCycle === 12 ? 'h12' : 'h23',
        }
      : { dateStyle: 'medium' });
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, resolvedFormat),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, JSON.stringify(resolvedFormat)],
  );
  const displayValue = selected ? formatter.format(selected) : placeholder;

  // The columns always need a concrete time; noon is the same neutral fallback
  // `TimePicker` uses, and it is not treated as a selection until a day lands.
  const draftTime: TimeValue = selected ? timeOf(selected) : { hours: 12, minutes: 0 };

  const commit = (date: Date) => {
    if (!isControlled) {
      setUncontrolledValue(date);
    }
    onChange?.(date);
  };

  const handleSelect = (date: Date) => {
    // `Calendar` hands back a civil date at local midnight, so the time in play
    // has to be carried over rather than reset on every day click.
    commit(showTime ? mergeDateAndTime(date, draftTime) : date);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (time: TimeValue) => {
    // Editing the time before any day picks today — otherwise there is nothing
    // to attach the clock reading to.
    commit(mergeDateAndTime(selected ?? new Date(), time));
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const panel = (
    <div className={styles.panel}>
      <Calendar
        autoFocus
        value={selected}
        defaultMonth={selected ?? undefined}
        onChange={handleSelect}
        min={min}
        max={max}
        weekStartsOn={weekStartsOn}
        locale={locale}
        showWeekNumbers={showWeekNumbers}
      />

      {showTime && (
        <div className={styles.footer}>
          <TimeFields
            value={draftTime}
            onChange={handleTimeChange}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
            className={styles.timeFields}
          />
          <Button variant="suggested" size="sm" onClick={() => setOpen(false)}>
            {doneLabel}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className={[styles.datePicker, className].filter(Boolean).join(' ')}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <Popover
        placement={placement}
        open={open}
        onOpenChange={setOpen}
        // A 12-hour footer is wider than `Popover`'s default 320px cap.
        panelClassName={showTime ? styles.popover : undefined}
        content={panel}
      >
        <button
          type="button"
          id={id}
          className={styles.trigger}
          disabled={disabled}
          data-placeholder={selected ? undefined : ''}
          aria-label={ariaLabel}
          aria-labelledby={label ? labelId : undefined}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={styles.value}>{displayValue}</span>
          <Icon icon={XOfficeCalendar} size="sm" aria-hidden className={styles.icon} />
        </button>
      </Popover>
    </div>
  );
};
