import { XOfficeCalendar } from '@gnome-ui/icons';
import { type KeyboardEvent, useId, useMemo, useState } from 'react';

import { Calendar } from '@/components/Calendar';
import type { WeekStart } from '@/components/Calendar/calendarUtils';
import { Icon } from '@/components/Icon';
import { Popover, type PopoverPlacement } from '@/components/Popover';

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
   * `Intl.DateTimeFormatOptions` for the text shown in the trigger.
   * Defaults to `{ dateStyle: 'medium' }`.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
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
  formatOptions = { dateStyle: 'medium' },
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

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, formatOptions),
    [locale, formatOptions],
  );
  const displayValue = selected ? formatter.format(selected) : placeholder;

  const handleSelect = (date: Date) => {
    if (!isControlled) {
      setUncontrolledValue(date);
    }
    onChange?.(date);
    setOpen(false);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const calendar = (
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
  );

  return (
    <div className={[styles.datePicker, className].filter(Boolean).join(' ')}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}

      <Popover placement={placement} open={open} onOpenChange={setOpen} content={calendar}>
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
