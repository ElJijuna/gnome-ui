import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './Calendar.module.css';
import {
  addDays,
  addMonths,
  getCalendarWeeks,
  isOutOfRange,
  isoWeekNumber,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toISODateKey,
  type WeekStart,
  weekdayOffset,
} from './calendarUtils';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. Pass `null` for "no selection". */
  value?: Date | null;
  /** Initial selected date when uncontrolled. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called when the user selects a day. */
  onChange?: (date: Date) => void;
  /** Controlled displayed month (any date within the desired month). */
  month?: Date;
  /**
   * Initial displayed month when uncontrolled. Defaults to the selected date's
   * month, falling back to the current month.
   */
  defaultMonth?: Date;
  /** Called when the displayed month changes via navigation. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable date (inclusive). Earlier days are disabled. */
  min?: Date;
  /** Latest selectable date (inclusive). Later days are disabled. */
  max?: Date;
  /**
   * First day of the week: `0` (Sunday) … `6` (Saturday). Defaults to `1`
   * (Monday) — the GNOME default across most locales.
   */
  weekStartsOn?: WeekStart;
  /** BCP-47 locale for month/day names. Defaults to the runtime locale. */
  locale?: string;
  /** Show the month/year heading with prev/next navigation. Mirrors `GtkCalendar:show-heading`. */
  showHeading?: boolean;
  /** Show the abbreviated day-name column headers. Mirrors `GtkCalendar:show-day-names`. */
  showDayNames?: boolean;
  /** Show an ISO week-number column. Mirrors `GtkCalendar:show-week-numbers`. */
  showWeekNumbers?: boolean;
  /**
   * Move DOM focus onto the roving day cell as soon as the grid mounts. Used by
   * pickers that reveal the calendar in a popover and want the keyboard to land
   * on a day rather than the month-navigation button.
   */
  autoFocus?: boolean;
}

// A known Sunday, used to derive weekday names in the configured order without
// depending on today's date.
const SUNDAY_REF = new Date(2024, 0, 7);

/**
 * Month-grid date display with full keyboard navigation — mirrors
 * `GtkCalendar`. Usable standalone (settings, forms) or as the panel inside a
 * `DatePicker`.
 *
 * Implements the WAI-ARIA grid pattern: the grid holds a roving tabindex so a
 * single Tab reaches the current day, then arrow keys move day-by-day, PageUp/
 * PageDown page months (Shift for years), and Enter/Space selects. Leading and
 * trailing days from adjacent months are shown dimmed and remain selectable —
 * choosing one navigates to that month, matching `GtkCalendar`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export const Calendar = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  min,
  max,
  weekStartsOn = 1,
  locale,
  showHeading = true,
  showDayNames = true,
  showWeekNumbers = false,
  autoFocus = false,
  className,
  ...props
}: CalendarProps) => {
  const isValueControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const selected = isValueControlled ? controlledValue : uncontrolledValue;

  const isMonthControlled = controlledMonth !== undefined;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? selected ?? new Date()),
  );
  const displayMonth = startOfMonth(isMonthControlled ? controlledMonth : uncontrolledMonth);

  const today = useMemo(() => startOfDay(new Date()), []);

  // The one day in the grid carrying tabindex=0. Seeded once to the selection
  // when it is in view, else today when in view, else the 1st of the shown
  // month; subsequent tracking is handled by the effect and keyboard handlers.
  const [focusDate, setFocusDate] = useState<Date>(() => {
    if (selected && isSameMonth(selected, displayMonth)) {
      return startOfDay(selected);
    }
    if (isSameMonth(today, displayMonth)) {
      return today;
    }
    return displayMonth;
  });

  // Keep the roving focus inside the displayed month when the month is driven
  // externally (controlled `month`, or header nav) rather than by keyboard.
  useEffect(() => {
    if (!isSameMonth(focusDate, displayMonth)) {
      const day = Math.min(
        focusDate.getDate(),
        new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate(),
      );
      setFocusDate(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMonth.getFullYear(), displayMonth.getMonth()]);

  const gridRef = useRef<HTMLDivElement>(null);
  // Set true only for focus moves the user drove from the keyboard, so we never
  // steal focus on mount or when the parent re-renders.
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) {
      return;
    }
    shouldFocusRef.current = false;
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${toISODateKey(focusDate)}"]`,
    );
    cell?.focus();
  }, [focusDate]);

  // On mount, optionally pull focus onto the roving day. A wrapping `Popover`
  // keeps the panel `visibility:hidden` until it has measured a position, and a
  // hidden element cannot take focus — so retry across frames until the day
  // actually receives focus (also overriding the popover's own first-focusable
  // grab, which lands on the month-nav button). Capped so it can never spin.
  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    let raf = 0;
    let tries = 0;
    const tryFocus = () => {
      const cell = gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]');
      cell?.focus();
      if (document.activeElement !== cell && tries++ < 10) {
        raf = requestAnimationFrame(tryFocus);
      }
    };
    raf = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(raf);
    // Mount-only: `autoFocus` is read once when the grid appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeks = useMemo(
    () => getCalendarWeeks(displayMonth, weekStartsOn),
    [displayMonth, weekStartsOn],
  );

  const monthLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  );
  const fullDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [locale],
  );
  const dayNames = useMemo(() => {
    const shortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(SUNDAY_REF, (weekStartsOn + i) % 7);
      return { short: shortFmt.format(date), long: longFmt.format(date) };
    });
  }, [locale, weekStartsOn]);

  const headingId = useId();

  const changeMonth = useCallback(
    (next: Date) => {
      const nextMonth = startOfMonth(next);
      if (!isMonthControlled) {
        setUncontrolledMonth(nextMonth);
      }
      onMonthChange?.(nextMonth);
    },
    [isMonthControlled, onMonthChange],
  );

  const selectDate = useCallback(
    (date: Date) => {
      if (isOutOfRange(date, min, max)) {
        return;
      }
      const day = startOfDay(date);
      if (!isValueControlled) {
        setUncontrolledValue(day);
      }
      setFocusDate(day);
      if (!isSameMonth(day, displayMonth)) {
        changeMonth(day);
      }
      onChange?.(day);
    },
    [changeMonth, displayMonth, isValueControlled, max, min, onChange],
  );

  const moveFocus = useCallback(
    (next: Date) => {
      shouldFocusRef.current = true;
      setFocusDate(startOfDay(next));
      if (!isSameMonth(next, displayMonth)) {
        changeMonth(next);
      }
    },
    [changeMonth, displayMonth],
  );

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(addDays(focusDate, -1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(addDays(focusDate, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(addDays(focusDate, -7));
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(addDays(focusDate, 7));
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(addDays(focusDate, -weekdayOffset(focusDate, weekStartsOn)));
        break;
      case 'End':
        event.preventDefault();
        moveFocus(addDays(focusDate, 6 - weekdayOffset(focusDate, weekStartsOn)));
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocus(addMonths(focusDate, event.shiftKey ? -12 : -1));
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocus(addMonths(focusDate, event.shiftKey ? 12 : 1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDate(focusDate);
        break;
      default:
        break;
    }
  };

  const handleDayClick = (event: MouseEvent<HTMLButtonElement>, date: Date) => {
    event.preventDefault();
    selectDate(date);
  };

  return (
    <div className={[styles.calendar, className].filter(Boolean).join(' ')} {...props}>
      {showHeading && (
        <div className={styles.heading}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Previous month"
            onClick={() => changeMonth(addMonths(displayMonth, -1))}
          >
            <NavChevron direction="left" />
          </button>

          <span id={headingId} className={styles.monthLabel} aria-live="polite">
            {monthLabelFmt.format(displayMonth)}
          </span>

          <button
            type="button"
            className={styles.navButton}
            aria-label="Next month"
            onClick={() => changeMonth(addMonths(displayMonth, 1))}
          >
            <NavChevron direction="right" />
          </button>
        </div>
      )}

      <div
        ref={gridRef}
        role="grid"
        aria-labelledby={showHeading ? headingId : undefined}
        aria-label={showHeading ? undefined : monthLabelFmt.format(displayMonth)}
        className={styles.grid}
        onKeyDown={handleGridKeyDown}
      >
        {(showDayNames || showWeekNumbers) && (
          <div role="row" className={styles.weekRow}>
            {showWeekNumbers && (
              <span
                role="columnheader"
                aria-label="Week"
                className={[styles.cell, styles.weekNumberHeader].join(' ')}
              >
                #
              </span>
            )}
            {showDayNames &&
              dayNames.map((day) => (
                <span
                  key={day.long}
                  role="columnheader"
                  aria-label={day.long}
                  className={[styles.cell, styles.dayName].join(' ')}
                >
                  <abbr title={day.long} className={styles.dayNameAbbr}>
                    {day.short}
                  </abbr>
                </span>
              ))}
          </div>
        )}

        {weeks.map((week) => (
          <div role="row" className={styles.weekRow} key={toISODateKey(week[0])}>
            {showWeekNumbers && (
              <span role="rowheader" className={[styles.cell, styles.weekNumber].join(' ')}>
                {isoWeekNumber(week[0])}
              </span>
            )}
            {week.map((date) => {
              const outside = !isSameMonth(date, displayMonth);
              const isSelected = selected ? isSameDay(date, selected) : false;
              const isToday = isSameDay(date, today);
              const disabled = isOutOfRange(date, min, max);
              const isFocusDay = isSameDay(date, focusDate);

              return (
                <div
                  role="gridcell"
                  aria-selected={isSelected}
                  className={styles.cell}
                  key={toISODateKey(date)}
                >
                  <button
                    type="button"
                    data-date={toISODateKey(date)}
                    data-outside={outside || undefined}
                    data-today={isToday || undefined}
                    data-selected={isSelected || undefined}
                    className={styles.day}
                    tabIndex={isFocusDay ? 0 : -1}
                    aria-label={fullDateFmt.format(date)}
                    aria-current={isToday ? 'date' : undefined}
                    aria-disabled={disabled || undefined}
                    onClick={(event) => handleDayClick(event, date)}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const NavChevron = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    focusable="false"
    aria-hidden="true"
    className={styles.chevron}
  >
    <path
      d={direction === 'left' ? 'M10 4L6 8l4 4' : 'M6 4l4 4-4 4'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
