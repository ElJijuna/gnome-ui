import { XOfficeCalendar } from '@gnome-ui/icons';
import { type KeyboardEvent, useId, useMemo, useState } from 'react';

import { Button } from '@/components/Button';
import { isSameDay, type WeekStart } from '@/components/Calendar/calendarUtils';
import { CalendarRange } from '@/components/CalendarRange';
import type { DateRange, SelectedDateRange } from '@/components/CalendarRange/rangeUtils';
import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';
import { TimeFields } from '@/components/TimePicker/TimeFields';
import { mergeDateAndTime, type TimeValue, timeOf } from '@/components/TimePicker/timeUtils';

import styles from './DateRangePicker.module.css';

/** A one-click shortcut shown beside the calendar. */
export interface DateRangePreset {
  /** Text on the shortcut button. */
  label: string;
  /** The range it applies — a function so "last 7 days" is computed on click. */
  range: SelectedDateRange | (() => SelectedDateRange);
}

export interface DateRangePickerProps {
  /** Controlled range. Either end may be `null` while nothing is chosen. */
  value?: DateRange | null;
  /** Initial range when uncontrolled. Defaults to an empty range. */
  defaultValue?: DateRange | null;
  /** Called with the finished range — never with a half selection. */
  onChange?: (range: SelectedDateRange) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** Shortest range the user may commit, in days (both ends counted). Defaults to `1`. */
  minRange?: number;
  /** Longest range the user may commit, in days (both ends counted). Unlimited by default. */
  maxRange?: number;
  /** Month panels shown side by side inside the popover. Defaults to `2`. */
  visibleMonths?: number;
  /** One-click shortcuts rendered beside the calendar. Omitted when empty. */
  presets?: DateRangePreset[];
  /** First day of the week: `0` (Sunday) … `6` (Saturday). Defaults to `1` (Monday). */
  weekStartsOn?: WeekStart;
  /** BCP-47 locale for the calendar and the displayed dates. Defaults to the runtime locale. */
  locale?: string;
  /**
   * `Intl.DateTimeFormatOptions` for each end shown in the trigger. Defaults to
   * `{ dateStyle: 'medium' }`, or `{ dateStyle: 'medium', timeStyle: 'short' }`
   * once `showTime` is on.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  /**
   * Add an hour/minute column for each end under the calendar, making the
   * emitted range a span of time rather than of civil dates. The second day
   * click then keeps the popover open — only Done finishes the selection.
   */
  showTime?: boolean;
  /** 12- or 24-hour columns when `showTime` is on. Defaults to `24`. */
  hourCycle?: 12 | 24;
  /** Minute increment for the time spinners. Defaults to `1`. */
  minuteStep?: number;
  /** Visible label above the start-time columns. Defaults to `'Start'`. */
  startTimeLabel?: string;
  /** Visible label above the end-time columns. Defaults to `'End'`. */
  endTimeLabel?: string;
  /** Label on the button that closes a `showTime` popover. Defaults to `'Done'`. */
  doneLabel?: string;
  /** Text shown in the trigger while no range is selected. */
  placeholder?: string;
  /** Separator drawn between both ends in the trigger. Defaults to an en dash. */
  separator?: string;
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
 * A `Popover`-anchored `CalendarRange` behind an entry-styled trigger — the
 * range counterpart of `DatePicker`, and the same `GtkCalendar` + `GtkPopover`
 * composition GNOME apps use for date entry.
 *
 * The trigger reads out both ends (`1 Aug 2026 – 15 Aug 2026`) or a
 * placeholder, and opens on click, <kbd>Enter</kbd>/<kbd>Space</kbd> or
 * <kbd>↓</kbd>. Because `CalendarRange` only emits a finished range, the
 * popover stays open through the first click and closes on the second —
 * returning focus to the trigger. `presets` adds one-click shortcuts beside the
 * calendar; all keyboard navigation inside the panel comes from `CalendarRange`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
 */
const NOON: TimeValue = { hours: 12, minutes: 0 };

export const DateRangePicker = ({
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  minRange,
  maxRange,
  visibleMonths = 2,
  presets,
  weekStartsOn = 1,
  locale,
  formatOptions,
  showTime = false,
  hourCycle = 24,
  minuteStep = 1,
  startTimeLabel = 'Start',
  endTimeLabel = 'End',
  doneLabel = 'Done',
  placeholder = 'Select a date range',
  separator = '–',
  label,
  'aria-label': ariaLabel,
  showWeekNumbers = false,
  disabled = false,
  placement = 'bottom',
  id: idProp,
  className,
}: DateRangePickerProps) => {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange | null>(
    defaultValue ?? null,
  );
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
  const displayValue =
    selected?.start && selected.end
      ? `${formatter.format(selected.start)} ${separator} ${formatter.format(selected.end)}`
      : placeholder;

  // Times the user has dialled in but that have nowhere to live yet — no range
  // is committed, so there is no `Date` to read them back from.
  const [pendingTimes, setPendingTimes] = useState<{ start: TimeValue; end: TimeValue }>(() => ({
    start: defaultValue?.start ? timeOf(defaultValue.start) : NOON,
    end: defaultValue?.end ? timeOf(defaultValue.end) : NOON,
  }));

  const times = {
    start: selected?.start ? timeOf(selected.start) : pendingTimes.start,
    end: selected?.end ? timeOf(selected.end) : pendingTimes.end,
  };

  const commit = (range: SelectedDateRange, options?: { close?: boolean }) => {
    if (!isControlled) {
      setUncontrolledValue(range);
    }
    onChange?.(range);
    if (options?.close ?? true) {
      setOpen(false);
    }
  };

  /**
   * Attach both clock readings to a range of civil dates, keeping start ≤ end.
   * They can only invert on a single-day range; whichever end the user just
   * moved wins, and a fresh pair of day clicks collapses the end onto the start.
   */
  const withTimes = (
    range: SelectedDateRange,
    startTime: TimeValue,
    endTime: TimeValue,
    edited: 'start' | 'end' | 'days',
  ): SelectedDateRange => {
    let start = mergeDateAndTime(range.start, startTime);
    let end = mergeDateAndTime(range.end, endTime);

    if (isSameDay(start, end) && start.getTime() > end.getTime()) {
      if (edited === 'end') {
        start = end;
      } else {
        end = start;
      }
    }

    return { start, end };
  };

  const handleRangeChange = (range: SelectedDateRange) => {
    if (!showTime) {
      commit(range);
      return;
    }
    // With a clock in play the range is not finished until Done is pressed.
    commit(withTimes(range, times.start, times.end, 'days'), { close: false });
  };

  const handleTimeChange = (edited: 'start' | 'end') => (time: TimeValue) => {
    const next = { ...times, [edited]: time };
    setPendingTimes(next);

    if (selected?.start && selected.end) {
      commit(
        withTimes({ start: selected.start, end: selected.end }, next.start, next.end, edited),
        {
          close: false,
        },
      );
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const panel = (
    <div className={styles.panel}>
      {presets && presets.length > 0 && (
        <div className={styles.presets} aria-label="Range shortcuts" role="group">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={styles.preset}
              onClick={() =>
                commit(typeof preset.range === 'function' ? preset.range() : preset.range)
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <CalendarRange
        autoFocus
        value={selected}
        defaultMonth={selected?.start ?? undefined}
        onChange={handleRangeChange}
        min={min}
        max={max}
        minRange={minRange}
        maxRange={maxRange}
        visibleMonths={visibleMonths}
        weekStartsOn={weekStartsOn}
        locale={locale}
        showWeekNumbers={showWeekNumbers}
      />
    </div>
  );

  const panelWithTime = showTime ? (
    <div className={styles.withFooter}>
      {panel}
      <div className={styles.footer}>
        <div className={styles.timeGroup}>
          <span className={styles.timeLabel}>{startTimeLabel}</span>
          <TimeFields
            value={times.start}
            onChange={handleTimeChange('start')}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
            labelPrefix={startTimeLabel}
          />
        </div>

        <div className={styles.timeGroup}>
          <span className={styles.timeLabel}>{endTimeLabel}</span>
          <TimeFields
            value={times.end}
            onChange={handleTimeChange('end')}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
            labelPrefix={endTimeLabel}
          />
        </div>

        <Button variant="suggested" size="sm" onClick={() => setOpen(false)}>
          {doneLabel}
        </Button>
      </div>
    </div>
  ) : (
    panel
  );

  return (
    <div className={[styles.dateRangePicker, className].filter(Boolean).join(' ')}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <Popover
        placement={placement}
        open={open}
        onOpenChange={setOpen}
        panelClassName={styles.popover}
        content={panelWithTime}
      >
        <button
          type="button"
          id={id}
          className={styles.trigger}
          disabled={disabled}
          data-placeholder={selected?.start && selected.end ? undefined : ''}
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
