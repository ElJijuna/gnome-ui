import { PanDown, PanEnd, PanStart } from '@gnome-ui/icons';
import { useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Text } from '@/components/Text';
import { useDateTimeFormatter, useGnomeTheme } from '@/GnomeProvider';

import {
  addDays,
  addMonths,
  addYears,
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
  YEARS_PER_PAGE,
} from './calendarUtils';

/** Which grid the calendar is currently showing. */
export type CalendarView = 'days' | 'months' | 'years';

export interface CalendarProps {
  /** Controlled selected date. Pass `null` for "no selection". */
  value?: Date | null;
  /** Initial selected date when uncontrolled. Defaults to `null`. */
  defaultValue?: Date | null;
  /** Called when the user taps a day. */
  onChange?: (date: Date) => void;
  /** Controlled displayed month (any date within the desired month). */
  month?: Date;
  /**
   * Initial displayed month when uncontrolled. Defaults to the selected
   * date's month, falling back to the current month.
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
  /** Show the month/year heading with prev/next navigation. Mirrors `GtkCalendar:show-heading`. Defaults to `true`. */
  showHeading?: boolean;
  /** Show the abbreviated day-name column headers. Mirrors `GtkCalendar:show-day-names`. Defaults to `true`. */
  showDayNames?: boolean;
  /** Show an ISO week-number column. Mirrors `GtkCalendar:show-week-numbers`. Defaults to `false`. */
  showWeekNumbers?: boolean;
  /**
   * Turn the heading label into a button that drills down day grid → month
   * grid → year grid, the way modern date pickers let you jump years
   * without paging month by month. Requires `showHeading`. Defaults to `true`.
   */
  showViewSwitcher?: boolean;
  /** Grid shown on mount: `'days'`, `'months'` or `'years'`. Defaults to `'days'`. */
  defaultView?: CalendarView;
  /** Called when the drill-down view changes. */
  onViewChange?: (view: CalendarView) => void;
  /** Accessible label for the grid. Defaults to the current heading label. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// A known Sunday, used to derive weekday names in the configured order
// without depending on today's date.
const SUNDAY_REF = new Date(2024, 0, 7);

// Both drill-down grids (12 months, 12 years) are 3 rows × 4 columns, so
// they read comfortably at phone width without horizontal scrolling.
const DRILLDOWN_COLUMNS = 4;

/** Split a flat cell list into the rows of a drill-down grid. */
const toRows = <T,>(cells: T[]): T[][] =>
  Array.from({ length: Math.ceil(cells.length / DRILLDOWN_COLUMNS) }, (_, row) =>
    cells.slice(row * DRILLDOWN_COLUMNS, row * DRILLDOWN_COLUMNS + DRILLDOWN_COLUMNS),
  );

// Declared once at module scope (not inside the component) so each is a
// stable reference — `useDateTimeFormatter`'s `useMemo` keys off `options`
// identity, and a fresh object literal on every render would defeat it.
const MONTH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
const MONTH_SHORT_OPTIONS: Intl.DateTimeFormatOptions = { month: 'short' };
const YEAR_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric' };
const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};
const WEEKDAY_SHORT_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'short' };
const WEEKDAY_LONG_OPTIONS: Intl.DateTimeFormatOptions = { weekday: 'long' };

/**
 * Month-grid date display — mirrors `GtkCalendar` and `@gnome-ui/react`'s own
 * `Calendar`. Usable standalone (settings, forms) or as the panel inside a
 * future `DatePicker`.
 *
 * The heading label drills down day grid → month grid → year grid so a
 * distant year is two taps away instead of many pages, exactly as on the web.
 * Leading/trailing days from adjacent months are shown dimmed and remain
 * tappable — tapping one navigates to that month, matching `GtkCalendar`.
 *
 * **The web version's entire keyboard layer drops here** (roving tabindex,
 * arrow keys, PageUp/Down, Home/End, Enter/Space) — this package is
 * touch-first, and unlike `Slider`'s 1D `accessibilityRole="adjustable"`
 * escape hatch, there is no screen-reader analog for paging a full 2D date
 * grid. Tap-to-select on each cell is the strict touch subset of the web
 * interaction, the same trade-off already made for `RatingStars`/
 * `ToggleGroup`/`ColorPicker`. `role="grid"`/`"row"` port 1:1 from RN's
 * web-aligned `Role` union; `"gridcell"` doesn't exist in that union, so
 * cells fall back to `"cell"`, the same kind of substitution `BoxedList`
 * (`"list"`) and `ComboRow` (`"listbox"` → `"list"`) already made. The grid
 * and its rows deliberately skip `accessible` — the `ToggleGroup`-corrected
 * pattern: setting it on a container with many independently-focusable
 * children (each day) would collapse the whole month into one VoiceOver
 * stop. Column/row *headers* (day names, week numbers) hold no interactive
 * children, so they do set `accessible` to be announced as a single unit.
 *
 * `visibleMonths` (side-by-side month panels) and `autoFocus`
 * (keyboard-focus-on-mount) are dropped, not merely unimplemented: both are
 * desktop/keyboard concerns with no honest RN counterpart — a phone screen
 * has no room for two month panels side by side, and there is no keyboard to
 * focus. `locale` is dropped too, in favor of the app-wide locale
 * `GnomeProvider` already exposes through `useDateTimeFormatter` — the first
 * component in this package to seriously exercise that hook, confirmed here
 * to support the weekday/month/year combinations this component needs.
 *
 * For start/end selection use `CalendarRange` (not yet ported), which will
 * share the day/month/year grid engine extracted from this component once
 * it exists — no `CalendarBase` split was worth adding ahead of that need.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
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
  showHeading = true,
  showDayNames = true,
  showWeekNumbers = false,
  showViewSwitcher = true,
  defaultView = 'days',
  onViewChange,
  accessibilityLabel,
  style,
  testID,
}: CalendarProps) => {
  const theme = useGnomeTheme();

  const isValueControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const selected = isValueControlled ? controlledValue : uncontrolledValue;

  const isMonthControlled = controlledMonth !== undefined;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(() =>
    startOfMonth(defaultMonth ?? selected ?? new Date()),
  );
  const displayMonth = startOfMonth(isMonthControlled ? controlledMonth : uncontrolledMonth);
  const displayYear = displayMonth.getFullYear();

  // Drill-down is only reachable through the heading, so without one the
  // calendar stays on the day grid whatever `defaultView` asks for.
  const canSwitchView = showHeading && showViewSwitcher;
  const [view, setView] = useState<CalendarView>(canSwitchView ? defaultView : 'days');

  const today = useMemo(() => startOfDay(new Date()), []);

  const weeks = useMemo(
    () => getCalendarWeeks(displayMonth, weekStartsOn),
    [displayMonth, weekStartsOn],
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

  const monthYearFmt = useDateTimeFormatter(MONTH_YEAR_OPTIONS);
  const monthShortFmt = useDateTimeFormatter(MONTH_SHORT_OPTIONS);
  const yearFmt = useDateTimeFormatter(YEAR_OPTIONS);
  const fullDateFmt = useDateTimeFormatter(FULL_DATE_OPTIONS);
  const weekdayShortFmt = useDateTimeFormatter(WEEKDAY_SHORT_OPTIONS);
  const weekdayLongFmt = useDateTimeFormatter(WEEKDAY_LONG_OPTIONS);

  const dayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(SUNDAY_REF, (weekStartsOn + i) % 7);
        return { short: weekdayShortFmt.format(date), long: weekdayLongFmt.format(date) };
      }),
    [weekStartsOn, weekdayShortFmt, weekdayLongFmt],
  );

  const windowLabel = monthYearFmt.format(displayMonth);
  const yearLabel = yearFmt.format(displayMonth);
  const yearRangeLabel = `${yearFmt.format(yearPage[0])} – ${yearFmt.format(yearPage[YEARS_PER_PAGE - 1])}`;
  const headingLabel =
    view === 'days' ? windowLabel : view === 'months' ? yearLabel : yearRangeLabel;

  const changeMonth = (next: Date) => {
    const nextMonth = startOfMonth(next);
    if (!isMonthControlled) {
      setUncontrolledMonth(nextMonth);
    }
    onMonthChange?.(nextMonth);
  };

  const changeView = (next: CalendarView) => {
    if (next === view) {
      return;
    }
    setView(next);
    onViewChange?.(next);
  };

  const selectDay = (date: Date) => {
    if (isOutOfRange(date, min, max)) {
      return;
    }
    const day = startOfDay(date);
    if (!isSameMonth(day, displayMonth)) {
      changeMonth(day);
    }
    if (!isValueControlled) {
      setUncontrolledValue(day);
    }
    onChange?.(day);
  };

  // Picking a month drops back to its day grid; picking a year drops to
  // that year's month grid — the usual two-step way back down from a jump.
  const selectMonth = (date: Date) => {
    if (isMonthOutOfRange(date, min, max)) {
      return;
    }
    changeMonth(date);
    changeView('days');
  };

  const selectYear = (date: Date) => {
    if (isYearOutOfRange(date, min, max)) {
      return;
    }
    changeMonth(new Date(date.getFullYear(), displayMonth.getMonth(), 1));
    changeView('months');
  };

  // Label tap cycles days → months → years → days, so the day grid is
  // always one more tap away rather than a dead end.
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

  const gridLabel =
    accessibilityLabel ??
    (view === 'days'
      ? windowLabel
      : view === 'months'
        ? `Select a month in ${yearLabel}`
        : `Select a year, ${yearRangeLabel}`);

  return (
    <View testID={testID} style={[{ gap: theme.space2 }, style]}>
      {showHeading && (
        <View style={styles.heading}>
          <IconButton
            icon={PanStart}
            label={navLabel(-1)}
            variant="flat"
            size="sm"
            onPress={() => navStep(-1)}
          />

          {canSwitchView ? (
            <Pressable
              role="button"
              accessibilityLabel={`${headingLabel}, ${switchHint}`}
              onPress={() => changeView(nextView)}
              style={({ pressed }) => [
                styles.headingLabel,
                { borderRadius: theme.radiusMd },
                pressed ? { backgroundColor: theme.activeOverlay } : null,
              ]}
            >
              <Text variant="heading">{headingLabel}</Text>
              <Icon icon={PanDown} size="sm" />
            </Pressable>
          ) : (
            <View style={styles.headingLabel}>
              <Text variant="heading">{headingLabel}</Text>
            </View>
          )}

          <IconButton
            icon={PanEnd}
            label={navLabel(1)}
            variant="flat"
            size="sm"
            onPress={() => navStep(1)}
          />
        </View>
      )}

      <View
        role="grid"
        accessibilityLabel={gridLabel}
        testID={testID ? `${testID}-grid` : undefined}
      >
        {view === 'days' && (
          <>
            {(showDayNames || showWeekNumbers) && (
              <View role="row" style={styles.row}>
                {showWeekNumbers && (
                  <View
                    accessible
                    role="columnheader"
                    accessibilityLabel="Week"
                    style={styles.weekNumberCell}
                  />
                )}
                {showDayNames &&
                  dayNames.map((day) => (
                    <View
                      key={day.long}
                      accessible
                      role="columnheader"
                      accessibilityLabel={day.long}
                      style={styles.headerCell}
                    >
                      <Text variant="caption" color="dim">
                        {day.short}
                      </Text>
                    </View>
                  ))}
              </View>
            )}

            {weeks.map((week) => (
              <View role="row" style={styles.row} key={toISODateKey(week[0])}>
                {showWeekNumbers && (
                  <View
                    accessible
                    role="rowheader"
                    accessibilityLabel={`Week ${isoWeekNumber(week[0])}`}
                    style={styles.weekNumberCell}
                  >
                    <Text variant="caption" color="dim">
                      {isoWeekNumber(week[0])}
                    </Text>
                  </View>
                )}
                {week.map((date) => {
                  const outside = !isSameMonth(date, displayMonth);
                  const isToday = isSameDay(date, today);
                  const isSelected = selected ? isSameDay(date, selected) : false;
                  const disabled = isOutOfRange(date, min, max);

                  return (
                    <DayCell
                      key={toISODateKey(date)}
                      day={date.getDate()}
                      label={`${fullDateFmt.format(date)}${isToday ? ', today' : ''}`}
                      outside={outside}
                      today={isToday}
                      selected={isSelected}
                      disabled={disabled}
                      onPress={() => selectDay(date)}
                      testID={testID ? `${testID}-day-${toISODateKey(date)}` : undefined}
                    />
                  );
                })}
              </View>
            ))}
          </>
        )}

        {view === 'months' &&
          toRows(monthsOfYear).map((row) => (
            <View role="row" style={styles.row} key={row[0].getMonth()}>
              {row.map((date) => {
                const isSelected = selected ? isSameMonth(date, selected) : false;
                const isCurrent = isSameMonth(date, today);
                const disabled = isMonthOutOfRange(date, min, max);

                return (
                  <DrillCell
                    key={date.getMonth()}
                    text={monthShortFmt.format(date)}
                    label={monthYearFmt.format(date)}
                    selected={isSelected}
                    current={isCurrent}
                    disabled={disabled}
                    onPress={() => selectMonth(date)}
                    testID={testID ? `${testID}-month-${date.getMonth()}` : undefined}
                  />
                );
              })}
            </View>
          ))}

        {view === 'years' &&
          toRows(yearPage).map((row) => (
            <View role="row" style={styles.row} key={row[0].getFullYear()}>
              {row.map((date) => {
                const year = date.getFullYear();
                const isSelected = selected ? selected.getFullYear() === year : false;
                const isCurrent = today.getFullYear() === year;
                const disabled = isYearOutOfRange(date, min, max);
                const text = yearFmt.format(date);

                return (
                  <DrillCell
                    key={year}
                    text={text}
                    label={text}
                    selected={isSelected}
                    current={isCurrent}
                    disabled={disabled}
                    onPress={() => selectYear(date)}
                    testID={testID ? `${testID}-year-${year}` : undefined}
                  />
                );
              })}
            </View>
          ))}
      </View>
    </View>
  );
};

interface DayCellProps {
  day: number;
  label: string;
  outside: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  testID?: string;
}

/** One tappable day-number cell in the day grid. Its own component so each
 * cell reads its theme independently, the same shape `StepIndicator`'s
 * `StepCircle` established for a data-driven grid of same-size buttons. */
const DayCell = ({
  day,
  label,
  outside,
  today,
  selected,
  disabled,
  onPress,
  testID,
}: DayCellProps) => {
  const theme = useGnomeTheme();

  return (
    <View style={styles.dayCellWrap}>
      <Pressable
        testID={testID}
        role="cell"
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityState={{ selected, disabled }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.dayButton,
          { borderRadius: theme.radiusPill },
          selected
            ? { backgroundColor: theme.accentBgColor }
            : pressed
              ? { backgroundColor: theme.activeOverlay }
              : null,
          today && !selected ? { borderWidth: 1.5, borderColor: theme.accentBgColor } : null,
          { opacity: disabled ? theme.opacityDisabled : outside ? theme.opacityDim : 1 },
        ]}
      >
        <Text variant="body" style={selected ? styles.selectedCellText : undefined}>
          {day}
        </Text>
      </Pressable>
    </View>
  );
};

interface DrillCellProps {
  text: string;
  label: string;
  selected: boolean;
  current: boolean;
  disabled: boolean;
  onPress: () => void;
  testID?: string;
}

/** One tappable month/year cell in a drill-down grid. */
const DrillCell = ({
  text,
  label,
  selected,
  current,
  disabled,
  onPress,
  testID,
}: DrillCellProps) => {
  const theme = useGnomeTheme();

  return (
    <View style={styles.drillCellWrap}>
      <Pressable
        testID={testID}
        role="cell"
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityState={{ selected, disabled }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.drillButton,
          { borderRadius: theme.radiusMd },
          selected
            ? { backgroundColor: theme.accentBgColor }
            : pressed
              ? { backgroundColor: theme.activeOverlay }
              : null,
          current && !selected ? { borderWidth: 1.5, borderColor: theme.accentBgColor } : null,
          { opacity: disabled ? theme.opacityDisabled : 1 },
        ]}
      >
        <Text variant="body" style={selected ? styles.selectedCellText : undefined}>
          {text}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekNumberCell: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellWrap: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillCellWrap: {
    flex: 1,
    padding: 4,
  },
  drillButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  selectedCellText: {
    color: '#fff',
  },
});
