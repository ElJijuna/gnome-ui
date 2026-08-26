import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styles from './Calendar.module.css';
import {
  addDays,
  addMonths,
  addYears,
  clampDayToMonth,
  getCalendarWeeks,
  isMonthOutOfRange,
  isOutOfRange,
  isoWeekNumber,
  isSameDay,
  isSameMonth,
  isYearOutOfRange,
  startOfDay,
  startOfMonth,
  startOfYearPage,
  toISODateKey,
  type WeekStart,
  weekdayOffset,
  YEARS_PER_PAGE,
} from './calendarUtils';

/** Which grid the calendar is currently showing. */
export type CalendarView = 'days' | 'months' | 'years';

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
   * Turn the heading label into a button that drills down day grid → month grid
   * → year grid, the way modern date pickers let you jump years without paging
   * month by month. Requires `showHeading`. Defaults to `true`.
   */
  showViewSwitcher?: boolean;
  /** Grid shown on mount: `'days'`, `'months'` or `'years'`. Defaults to `'days'`. */
  defaultView?: CalendarView;
  /** Called when the drill-down view changes. */
  onViewChange?: (view: CalendarView) => void;
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

// Both drill-down grids are 3 rows × 4 columns, so vertical arrows step 4.
const DRILLDOWN_COLUMNS = 4;

/** Split a flat cell list into the rows of a drill-down grid. */
const toRows = <T,>(cells: T[]): T[][] =>
  Array.from({ length: Math.ceil(cells.length / DRILLDOWN_COLUMNS) }, (_, row) =>
    cells.slice(row * DRILLDOWN_COLUMNS, row * DRILLDOWN_COLUMNS + DRILLDOWN_COLUMNS),
  );

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
 * The heading label drills down day grid → month grid → year grid so a distant
 * year is two clicks away instead of twelve pages, as in modern date pickers.
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
  showViewSwitcher = true,
  defaultView = 'days',
  onViewChange,
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

  // Drill-down is only reachable through the heading, so without one the
  // calendar stays on the day grid whatever `defaultView` asks for.
  const canSwitchView = showHeading && showViewSwitcher;
  const [view, setView] = useState<CalendarView>(canSwitchView ? defaultView : 'days');

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
      setFocusDate(
        clampDayToMonth(displayMonth.getFullYear(), displayMonth.getMonth(), focusDate.getDate()),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMonth.getFullYear(), displayMonth.getMonth()]);

  const gridRef = useRef<HTMLDivElement>(null);
  // Set true only for focus moves the user drove from the keyboard or from a
  // drill-down step, so we never steal focus on mount or on a parent re-render.
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) {
      return;
    }
    shouldFocusRef.current = false;
    // Every view keeps exactly one tabbable cell, so the roving cell is found
    // the same way whichever grid is on screen.
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [focusDate, view]);

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
      const grid = gridRef.current;
      // Stop once focus is on any day in the grid — otherwise the retry would
      // fight a user who immediately arrows to another day.
      if (grid?.contains(document.activeElement)) {
        return;
      }
      grid?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
      if (!grid?.contains(document.activeElement) && tries++ < 10) {
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

  const displayYear = displayMonth.getFullYear();
  const yearPageStart = startOfYearPage(displayYear);
  const yearPage = useMemo(
    () => Array.from({ length: YEARS_PER_PAGE }, (_, i) => new Date(yearPageStart + i, 0, 1)),
    [yearPageStart],
  );
  const monthsOfYear = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(displayYear, i, 1)),
    [displayYear],
  );

  const monthLabelFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale],
  );
  const monthShortFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short' }),
    [locale],
  );
  const yearFmt = useMemo(() => new Intl.DateTimeFormat(locale, { year: 'numeric' }), [locale]);
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

  const monthLabel = monthLabelFmt.format(displayMonth);
  const yearLabel = yearFmt.format(displayMonth);
  const yearRangeLabel = `${yearFmt.format(yearPage[0])} – ${yearFmt.format(yearPage[YEARS_PER_PAGE - 1])}`;
  const headingLabel =
    view === 'days' ? monthLabel : view === 'months' ? yearLabel : yearRangeLabel;

  const gridLabel =
    view === 'days'
      ? monthLabel
      : view === 'months'
        ? `Select a month in ${yearLabel}`
        : `Select a year, ${yearRangeLabel}`;

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

  const changeView = useCallback(
    (next: CalendarView) => {
      if (next === view) {
        return;
      }
      // Land the keyboard on the roving cell of the grid we just revealed.
      shouldFocusRef.current = true;
      setView(next);
      onViewChange?.(next);
    },
    [onViewChange, view],
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

  // Picking a month drops back to its day grid; picking a year drops to that
  // year's month grid — the usual two-step way back down from a year jump.
  const selectMonth = (date: Date) => {
    if (isMonthOutOfRange(date, min, max)) {
      return;
    }
    setFocusDate(clampDayToMonth(date.getFullYear(), date.getMonth(), focusDate.getDate()));
    changeMonth(date);
    changeView('days');
  };

  const selectYear = (date: Date) => {
    if (isYearOutOfRange(date, min, max)) {
      return;
    }
    const anchor = clampDayToMonth(
      date.getFullYear(),
      displayMonth.getMonth(),
      focusDate.getDate(),
    );
    setFocusDate(anchor);
    changeMonth(anchor);
    changeView('months');
  };

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

  // In the month grid the roving cell may sit on a month other than the
  // displayed one, so the grid only re-pages when the focus leaves the year.
  const moveFocusMonths = (amount: number) => {
    const next = addMonths(focusDate, amount);
    shouldFocusRef.current = true;
    setFocusDate(next);
    if (next.getFullYear() !== displayYear) {
      changeMonth(next);
    }
  };

  // Likewise the year grid only re-pages when focus leaves the 12-year page.
  const moveFocusYears = (amount: number) => {
    const next = addYears(focusDate, amount);
    shouldFocusRef.current = true;
    setFocusDate(next);
    if (startOfYearPage(next.getFullYear()) !== yearPageStart) {
      changeMonth(next);
    }
  };

  const handleDaysKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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

  const handleMonthsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocusMonths(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocusMonths(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocusMonths(-DRILLDOWN_COLUMNS);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocusMonths(DRILLDOWN_COLUMNS);
        break;
      case 'Home':
        event.preventDefault();
        moveFocusMonths(-focusDate.getMonth());
        break;
      case 'End':
        event.preventDefault();
        moveFocusMonths(11 - focusDate.getMonth());
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocusMonths(-12);
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocusMonths(12);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectMonth(focusDate);
        break;
      default:
        break;
    }
  };

  const handleYearsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocusYears(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocusYears(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocusYears(-DRILLDOWN_COLUMNS);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocusYears(DRILLDOWN_COLUMNS);
        break;
      case 'Home':
        event.preventDefault();
        moveFocusYears(yearPageStart - focusDate.getFullYear());
        break;
      case 'End':
        event.preventDefault();
        moveFocusYears(yearPageStart + YEARS_PER_PAGE - 1 - focusDate.getFullYear());
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocusYears(-YEARS_PER_PAGE);
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocusYears(YEARS_PER_PAGE);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectYear(focusDate);
        break;
      default:
        break;
    }
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Escape backs out of a drill-down instead of reaching an enclosing
    // popover, which would otherwise close the whole picker.
    if (event.key === 'Escape' && view !== 'days') {
      event.preventDefault();
      event.stopPropagation();
      changeView('days');
      return;
    }
    if (view === 'days') {
      handleDaysKeyDown(event);
    } else if (view === 'months') {
      handleMonthsKeyDown(event);
    } else {
      handleYearsKeyDown(event);
    }
  };

  const handleDayClick = (event: MouseEvent<HTMLButtonElement>, date: Date) => {
    event.preventDefault();
    selectDate(date);
  };

  // Label click cycles days → months → years → days, so the day grid is always
  // one more click away rather than a dead end.
  const nextView: CalendarView = view === 'days' ? 'months' : view === 'months' ? 'years' : 'days';
  const switchHint =
    nextView === 'months'
      ? 'choose a month'
      : nextView === 'years'
        ? 'choose a year'
        : 'back to days';

  const navStep = (direction: -1 | 1) => {
    if (view === 'days') {
      changeMonth(addMonths(displayMonth, direction));
    } else if (view === 'months') {
      changeMonth(addYears(displayMonth, direction));
    } else {
      changeMonth(addYears(displayMonth, direction * YEARS_PER_PAGE));
    }
  };

  const navLabel = (direction: -1 | 1) => {
    const unit = view === 'days' ? 'month' : view === 'months' ? 'year' : 'years';
    return `${direction === -1 ? 'Previous' : 'Next'} ${unit}`;
  };

  return (
    <div className={[styles.calendar, className].filter(Boolean).join(' ')} {...props}>
      {showHeading && (
        <div className={styles.heading}>
          <button
            type="button"
            className={styles.navButton}
            aria-label={navLabel(-1)}
            onClick={() => navStep(-1)}
          >
            <NavChevron direction="left" />
          </button>

          {canSwitchView ? (
            <button
              type="button"
              className={[styles.monthLabel, styles.monthLabelButton].join(' ')}
              aria-label={`${headingLabel}, ${switchHint}`}
              aria-live="polite"
              data-view={view}
              onClick={() => changeView(nextView)}
            >
              {headingLabel}
              <NavChevron direction="down" />
            </button>
          ) : (
            <span className={styles.monthLabel} aria-live="polite">
              {headingLabel}
            </span>
          )}

          <button
            type="button"
            className={styles.navButton}
            aria-label={navLabel(1)}
            onClick={() => navStep(1)}
          >
            <NavChevron direction="right" />
          </button>
        </div>
      )}

      <div
        ref={gridRef}
        role="grid"
        aria-label={gridLabel}
        className={styles.grid}
        data-view={view}
        onKeyDown={handleGridKeyDown}
      >
        {view === 'days' && (
          <>
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
          </>
        )}

        {view === 'months' &&
          toRows(monthsOfYear).map((row) => (
            <div role="row" className={styles.drilldownRow} key={row[0].getMonth()}>
              {row.map((date) => {
                const isSelected = selected ? isSameMonth(date, selected) : false;
                const isCurrent = isSameMonth(date, today);
                const disabled = isMonthOutOfRange(date, min, max);
                // The roving cell falls back to the displayed month whenever
                // focus is parked outside the year on screen.
                const isFocusMonth =
                  focusDate.getFullYear() === displayYear
                    ? focusDate.getMonth() === date.getMonth()
                    : date.getMonth() === displayMonth.getMonth();

                return (
                  <div
                    role="gridcell"
                    aria-selected={isSelected}
                    className={styles.drilldownCell}
                    key={date.getMonth()}
                  >
                    <button
                      type="button"
                      data-month={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`}
                      data-today={isCurrent || undefined}
                      data-selected={isSelected || undefined}
                      className={styles.drilldownItem}
                      tabIndex={isFocusMonth ? 0 : -1}
                      aria-label={monthLabelFmt.format(date)}
                      aria-current={isCurrent ? 'date' : undefined}
                      aria-disabled={disabled || undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        selectMonth(date);
                      }}
                    >
                      {monthShortFmt.format(date)}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

        {view === 'years' &&
          toRows(yearPage).map((row) => (
            <div role="row" className={styles.drilldownRow} key={row[0].getFullYear()}>
              {row.map((date) => {
                const year = date.getFullYear();
                const isSelected = selected ? selected.getFullYear() === year : false;
                const isCurrent = today.getFullYear() === year;
                const disabled = isYearOutOfRange(date, min, max);
                const isFocusYear =
                  startOfYearPage(focusDate.getFullYear()) === yearPageStart
                    ? focusDate.getFullYear() === year
                    : displayYear === year;

                return (
                  <div
                    role="gridcell"
                    aria-selected={isSelected}
                    className={styles.drilldownCell}
                    key={year}
                  >
                    <button
                      type="button"
                      data-year={year}
                      data-today={isCurrent || undefined}
                      data-selected={isSelected || undefined}
                      className={styles.drilldownItem}
                      tabIndex={isFocusYear ? 0 : -1}
                      aria-label={yearFmt.format(date)}
                      aria-current={isCurrent ? 'date' : undefined}
                      aria-disabled={disabled || undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        selectYear(date);
                      }}
                    >
                      {yearFmt.format(date)}
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

const CHEVRON_PATHS = {
  left: 'M10 4L6 8l4 4',
  right: 'M6 4l4 4-4 4',
  down: 'M4 6l4 4 4-4',
} as const;

const NavChevron = ({ direction }: { direction: keyof typeof CHEVRON_PATHS }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    focusable="false"
    aria-hidden="true"
    className={styles.chevron}
  >
    <path
      d={CHEVRON_PATHS[direction]}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
