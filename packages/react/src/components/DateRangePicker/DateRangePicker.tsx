import { XOfficeCalendar } from '@gnome-ui/icons';
import { type KeyboardEvent, useId, useMemo, useState } from 'react';

import type { WeekStart } from '@/components/Calendar/calendarUtils';
import { CalendarRange } from '@/components/CalendarRange';
import type { DateRange, SelectedDateRange } from '@/components/CalendarRange/rangeUtils';
import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';

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
   * `Intl.DateTimeFormatOptions` for each end shown in the trigger.
   * Defaults to `{ dateStyle: 'medium' }`.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
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
  formatOptions = { dateStyle: 'medium' },
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

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, formatOptions),
    [locale, formatOptions],
  );
  const displayValue =
    selected?.start && selected.end
      ? `${formatter.format(selected.start)} ${separator} ${formatter.format(selected.end)}`
      : placeholder;

  const commit = (range: SelectedDateRange) => {
    if (!isControlled) {
      setUncontrolledValue(range);
    }
    onChange?.(range);
    setOpen(false);
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
        onChange={commit}
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
        content={panel}
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
