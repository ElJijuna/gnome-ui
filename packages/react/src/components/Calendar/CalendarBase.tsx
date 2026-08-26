import {
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
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
  fromISODateKey,
  getCalendarWeeks,
  isMonthOutOfRange,
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

/** How one day cell should be painted, as decided by the selection model. */
export interface CalendarDayState {
  /** Endpoint of the selection — filled accent pill. */
  selected?: boolean;
  /** Left edge of a range. */
  rangeStart?: boolean;
  /** Right edge of a range. */
  rangeEnd?: boolean;
  /** Strictly between the two ends of a range. */
  inRange?: boolean;
  /** The range being painted is a preview, not a committed selection. */
  preview?: boolean;
  /** Appended to the day's accessible name, e.g. `', start of range'`. */
  labelSuffix?: string;
}

/**
 * Everything `CalendarBase` needs to know about *what is selected*, so the grid
 * engine (navigation, roving tabindex, month/year drill-down) stays free of
 * selection semantics and can drive both `Calendar` and `CalendarRange`.
 */
export interface CalendarSelectionModel {
  /** Day the roving tabindex should start on, when it is in the displayed window. */
  seedFocus?: Date | null;
  dayState: (date: Date) => CalendarDayState;
  isDayDisabled?: (date: Date) => boolean;
  activateDay: (date: Date) => void;
  /** Called with the hovered day, or `null` when the pointer leaves the grid. */
  hoverDay?: (date: Date | null) => void;
  /** Called whenever the roving focus lands on a new day. */
  focusDayChange?: (date: Date) => void;
  /** Return `true` to consume Escape (e.g. to cancel a half-made range). */
  escape?: () => boolean;
  isMonthSelected?: (month: Date) => boolean;
  isYearSelected?: (year: number) => boolean;
}

export interface CalendarBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  selection: CalendarSelectionModel;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Seeds the displayed month when neither `month` nor `defaultMonth` is given. */
  fallbackMonth?: Date | null;
  min?: Date;
  max?: Date;
  /** Number of month panels rendered side by side. Defaults to `1`. */
  visibleMonths?: number;
  weekStartsOn?: WeekStart;
  locale?: string;
  showHeading?: boolean;
  showDayNames?: boolean;
  showWeekNumbers?: boolean;
  showViewSwitcher?: boolean;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  autoFocus?: boolean;
  /** Rendered inside the root after the panels — status live regions, presets. */
  footer?: ReactNode;
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
 * The shared calendar grid engine: month window, roving-tabindex keyboard
 * model, and the day / month / year drill-down grids. It owns *navigation*;
 * `selection` owns *what is selected*.
 *
 * Not exported from the package — `Calendar` and `CalendarRange` are the public
 * faces of it.
 */
export const CalendarBase = ({
  selection,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  fallbackMonth = null,
  min,
  max,
  visibleMonths = 1,
  weekStartsOn = 1,
  locale,
  showHeading = true,
  showDayNames = true,
  showWeekNumbers = false,
  showViewSwitcher = true,
  defaultView = 'days',
  onViewChange,
  autoFocus = false,
  footer,
  className,
  ...props
}: CalendarBaseProps) => {
  // The model is rebuilt on every render of the owner, so handlers read it
  // through a ref instead of listing it as a dependency everywhere.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const panelCount = Math.max(1, Math.trunc(visibleMonths));

  const isMonthControlled = controlledMonth !== undefined;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? fallbackMonth ?? new Date()),
  );
  const displayMonth = startOfMonth(isMonthControlled ? controlledMonth : uncontrolledMonth);
  const displayYear = displayMonth.getFullYear();

  // Drill-down is only reachable through the heading, so without one the
  // calendar stays on the day grid whatever `defaultView` asks for.
  const canSwitchView = showHeading && showViewSwitcher;
  const [view, setView] = useState<CalendarView>(canSwitchView ? defaultView : 'days');

  const today = useMemo(() => startOfDay(new Date()), []);

  const months = useMemo(
    () =>
      Array.from(
        { length: panelCount },
        (_, i) => new Date(displayYear, displayMonth.getMonth() + i, 1),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayYear, displayMonth.getMonth(), panelCount],
  );
  const lastMonth = months[months.length - 1];

  /** `true` when `date` falls inside the currently displayed month window. */
  const isInWindow = useCallback(
    (date: Date) =>
      date.getTime() >= months[0].getTime() &&
      date.getTime() < new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1).getTime(),
    [lastMonth, months],
  );

  // The one day in the window carrying tabindex=0. Seeded once to the model's
  // preferred day when it is in view, else today when in view, else the 1st of
  // the first shown month; tracking is then handled by the effect and handlers.
  const [focusDate, setFocusDate] = useState<Date>(() => {
    const seed = selection.seedFocus;
    const windowStart = displayMonth;
    const windowEnd = new Date(displayYear, displayMonth.getMonth() + panelCount, 1);
    const inWindow = (date: Date) =>
      date.getTime() >= windowStart.getTime() && date.getTime() < windowEnd.getTime();

    if (seed && inWindow(seed)) {
      return startOfDay(seed);
    }
    if (inWindow(today)) {
      return today;
    }
    return displayMonth;
  });

  // Keep the roving focus inside the displayed window when the months are
  // driven externally (controlled `month`, or header nav) rather than by keyboard.
  useEffect(() => {
    if (!isInWindow(focusDate)) {
      setFocusDate(
        clampDayToMonth(displayMonth.getFullYear(), displayMonth.getMonth(), focusDate.getDate()),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayYear, displayMonth.getMonth(), panelCount]);

  useEffect(() => {
    selectionRef.current.focusDayChange?.(focusDate);
  }, [focusDate]);

  const gridRef = useRef<HTMLDivElement>(null);
  // Set true only for focus moves the user drove from the keyboard or from a
  // drill-down step, so we never steal focus on mount or on a parent re-render.
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) {
      return;
    }
    shouldFocusRef.current = false;
    // Every view keeps exactly one tabbable cell across all panels, so the
    // roving cell is found the same way whichever grid is on screen.
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

  const weeksByMonth = useMemo(
    () => months.map((month) => getCalendarWeeks(month, weekStartsOn)),
    [months, weekStartsOn],
  );

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
  const monthOnlyFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long' }), [locale]);
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

  // One panel names itself "August 2026"; several name the span they cover,
  // dropping the repeated year when both ends share it.
  const windowLabel =
    panelCount === 1
      ? monthLabelFmt.format(displayMonth)
      : `${
          lastMonth.getFullYear() === displayYear
            ? monthOnlyFmt.format(displayMonth)
            : monthLabelFmt.format(displayMonth)
        } – ${monthLabelFmt.format(lastMonth)}`;
  const yearLabel = yearFmt.format(displayMonth);
  const yearRangeLabel = `${yearFmt.format(yearPage[0])} – ${yearFmt.format(yearPage[YEARS_PER_PAGE - 1])}`;
  const headingLabel =
    view === 'days' ? windowLabel : view === 'months' ? yearLabel : yearRangeLabel;

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

  const activateDay = (date: Date) => {
    const day = startOfDay(date);
    setFocusDate(day);
    if (!isInWindow(day)) {
      changeMonth(day);
    }
    selectionRef.current.activateDay(day);
  };

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

  // Keyboard focus may leave the window in either direction; the window follows
  // by the smallest step that brings the new day back into view.
  const moveFocus = (next: Date) => {
    const day = startOfDay(next);
    shouldFocusRef.current = true;
    setFocusDate(day);
    if (isInWindow(day)) {
      return;
    }
    changeMonth(
      day.getTime() < months[0].getTime()
        ? day
        : new Date(day.getFullYear(), day.getMonth() - (panelCount - 1), 1),
    );
  };

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
        activateDay(focusDate);
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
    if (event.key === 'Escape') {
      // Escape backs out of a drill-down first, then lets the selection model
      // cancel whatever it has half-made — only reaching an enclosing popover
      // once neither has anything to undo.
      if (view !== 'days') {
        event.preventDefault();
        event.stopPropagation();
        changeView('days');
        return;
      }
      if (selectionRef.current.escape?.()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
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
    activateDay(date);
  };

  // One delegated listener beats a handler per cell — six weeks × N panels.
  const handlePointerOver = selection.hoverDay
    ? (event: MouseEvent<HTMLDivElement>) => {
        const key = (event.target as HTMLElement).closest<HTMLElement>('[data-date]')?.dataset.date;
        selectionRef.current.hoverDay?.(key ? fromISODateKey(key) : null);
      }
    : undefined;

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

  const renderDayPanel = (month: Date, panelIndex: number) => (
    <div
      role="grid"
      aria-label={monthLabelFmt.format(month)}
      className={styles.grid}
      key={toISODateKey(month)}
    >
      {panelCount > 1 && (
        <div className={styles.panelLabel} aria-hidden="true">
          {monthLabelFmt.format(month)}
        </div>
      )}

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

      {weeksByMonth[panelIndex].map((week) => (
        <div role="row" className={styles.weekRow} key={toISODateKey(week[0])}>
          {showWeekNumbers && (
            <span role="rowheader" className={[styles.cell, styles.weekNumber].join(' ')}>
              {isoWeekNumber(week[0])}
            </span>
          )}
          {week.map((date) => {
            const outside = !isSameMonth(date, month);
            const state = selection.dayState(date);
            const isToday = isSameDay(date, today);
            const disabled = selection.isDayDisabled?.(date) ?? false;
            const isFocusDay = isSameDay(date, focusDate);
            // A day on a panel edge repeats as an adjacent-month day on the
            // neighbouring panel, so only the panel owning it may be tabbable.
            const tabbable = isFocusDay && (!outside || !isInWindow(focusDate));

            return (
              <div
                role="gridcell"
                aria-selected={Boolean(state.selected || state.inRange)}
                className={styles.cell}
                data-range-start={state.rangeStart || undefined}
                data-range-end={state.rangeEnd || undefined}
                data-in-range={state.inRange || undefined}
                data-preview={state.preview || undefined}
                key={toISODateKey(date)}
              >
                <button
                  type="button"
                  data-date={toISODateKey(date)}
                  data-outside={outside || undefined}
                  data-today={isToday || undefined}
                  data-selected={state.selected || undefined}
                  className={styles.day}
                  tabIndex={tabbable ? 0 : -1}
                  aria-label={`${fullDateFmt.format(date)}${state.labelSuffix ?? ''}`}
                  aria-current={isToday ? 'date' : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={(event) => handleDayClick(event, date)}
                  onFocus={() => {
                    // Keep the roving state on whatever actually holds DOM
                    // focus — a screen reader can move focus to any cell, and
                    // the arrow keys must then continue from there.
                    if (!isSameDay(date, focusDate)) {
                      setFocusDate(startOfDay(date));
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

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
              <span className={styles.headingText}>{headingLabel}</span>
              <NavChevron direction="down" />
            </button>
          ) : (
            <span className={styles.monthLabel} aria-live="polite">
              <span className={styles.headingText}>{headingLabel}</span>
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
        className={styles.panels}
        data-view={view}
        onKeyDown={handleGridKeyDown}
        onMouseOver={handlePointerOver}
        onMouseLeave={selection.hoverDay ? () => selectionRef.current.hoverDay?.(null) : undefined}
      >
        {view === 'days' && months.map(renderDayPanel)}

        {view === 'months' && (
          <div role="grid" aria-label={`Select a month in ${yearLabel}`} className={styles.grid}>
            {toRows(monthsOfYear).map((row) => (
              <div role="row" className={styles.drilldownRow} key={row[0].getMonth()}>
                {row.map((date) => {
                  const isSelected = selection.isMonthSelected?.(date) ?? false;
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
          </div>
        )}

        {view === 'years' && (
          <div role="grid" aria-label={`Select a year, ${yearRangeLabel}`} className={styles.grid}>
            {toRows(yearPage).map((row) => (
              <div role="row" className={styles.drilldownRow} key={row[0].getFullYear()}>
                {row.map((date) => {
                  const year = date.getFullYear();
                  const isSelected = selection.isYearSelected?.(year) ?? false;
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
        )}
      </div>

      {footer}
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
