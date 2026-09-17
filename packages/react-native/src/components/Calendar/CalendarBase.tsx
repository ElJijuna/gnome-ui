import { PanDown, PanEnd, PanStart } from '@gnome-ui/icons';
import type { ReactNode } from 'react';
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
  /** Appended to the day's accessible label, e.g. `', start of range'`. */
  labelSuffix?: string;
}

/**
 * Everything `CalendarBase` needs to know about *what is selected*, so the
 * grid engine (month/year navigation, day/month/year drill-down) stays free
 * of selection semantics and can drive both `Calendar` and `CalendarRange`.
 *
 * Trimmed from `@gnome-ui/react`'s own `CalendarSelectionModel`: no
 * `seedFocus`/`hoverDay`/`focusDayChange`/`escape` — those exist only to
 * drive the web version's keyboard roving-tabindex and mouse-hover range
 * preview, and this package drops the entire keyboard layer the same way
 * `Calendar` itself already does (no honest RN touch equivalent). Without a
 * hover signal, a range picker's "preview" is just its own anchor day until
 * the second tap commits — `CalendarRange` below relies on that rather than
 * tracking a separate preview day.
 */
export interface CalendarSelectionModel {
  dayState: (date: Date) => CalendarDayState;
  isDayDisabled?: (date: Date) => boolean;
  activateDay: (date: Date) => void;
  isMonthSelected?: (month: Date) => boolean;
  isYearSelected?: (year: number) => boolean;
}

export interface CalendarBaseProps {
  selection: CalendarSelectionModel;
  /** Controlled displayed month (any date within the desired month). */
  month?: Date;
  /**
   * Initial displayed month when uncontrolled. Defaults to `fallbackMonth`,
   * falling back to the current month.
   */
  defaultMonth?: Date;
  /** Called when the displayed month changes via navigation. */
  onMonthChange?: (month: Date) => void;
  /** Seeds the displayed month when neither `month` nor `defaultMonth` is given. */
  fallbackMonth?: Date | null;
  /** Earliest selectable date (inclusive). Also disables out-of-range months/years. */
  min?: Date;
  /** Latest selectable date (inclusive). Also disables out-of-range months/years. */
  max?: Date;
  weekStartsOn?: WeekStart;
  showHeading?: boolean;
  showDayNames?: boolean;
  showWeekNumbers?: boolean;
  showViewSwitcher?: boolean;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  accessibilityLabel?: string;
  /** Rendered inside the root, after the grid — status live regions, presets. */
  footer?: ReactNode;
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
 * The shared calendar grid engine: month window, heading navigation, and the
 * day / month / year drill-down grids. It owns *navigation*; `selection`
 * owns *what is selected* — extracted from `Calendar` once `CalendarRange`
 * actually needed the same engine, per the standing note `Calendar` left
 * when it shipped rather than adding this split ahead of need.
 *
 * Not exported from the package barrel — `Calendar` and `CalendarRange` are
 * its public faces, the same "internal engine, public wrapper" shape
 * `TimeFields`/`TimePicker` already established.
 */
export const CalendarBase = ({
  selection,
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  fallbackMonth = null,
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
  footer,
  style,
  testID,
}: CalendarBaseProps) => {
  const theme = useGnomeTheme();

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

  const activateDay = (date: Date) => {
    if (selection.isDayDisabled?.(date)) {
      return;
    }
    const day = startOfDay(date);
    if (!isSameMonth(day, displayMonth)) {
      changeMonth(day);
    }
    selection.activateDay(day);
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
                  const state = selection.dayState(date);
                  const disabled = selection.isDayDisabled?.(date) ?? false;

                  return (
                    <DayCell
                      key={toISODateKey(date)}
                      day={date.getDate()}
                      label={`${fullDateFmt.format(date)}${isToday ? ', today' : ''}${state.labelSuffix ?? ''}`}
                      outside={outside}
                      today={isToday}
                      state={state}
                      disabled={disabled}
                      onPress={() => activateDay(date)}
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
                const isSelected = selection.isMonthSelected?.(date) ?? false;
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
                const isSelected = selection.isYearSelected?.(year) ?? false;
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

      {footer}
    </View>
  );
};

interface DayCellProps {
  day: number;
  label: string;
  outside: boolean;
  today: boolean;
  state: CalendarDayState;
  disabled: boolean;
  onPress: () => void;
  testID?: string;
}

// The range band bleeds half the cell's own padding into each neighbor so
// consecutive in-range days read as one continuous stripe under the round
// day buttons — mirrors the web version's `inset-inline: calc(gap/-2)` on
// the cell's `::before`, ported as a negative inset since RN has no
// pseudo-elements. Alpha suffixes mirror `Blockquote`/`Chip`'s established
// `#RRGGBBAA` substitution for the web's `color-mix()` tints (`24` ≈ 14%,
// `14` ≈ 8% — a preview band reads lighter than a committed one).
const BAND_BLEED = 2;
const BAND_ALPHA = '24';
const BAND_PREVIEW_ALPHA = '14';
const END_TINT_ALPHA = '59'; // ≈ 35%, the tentative (not-yet-selected) end of a preview

/** One tappable day-number cell in the day grid. Its own component so each
 * cell reads its theme independently, the same shape `StepIndicator`'s
 * `StepCircle` established for a data-driven grid of same-size buttons. */
const DayCell = ({
  day,
  label,
  outside,
  today,
  state,
  disabled,
  onPress,
  testID,
}: DayCellProps) => {
  const theme = useGnomeTheme();
  const { selected, rangeStart, rangeEnd, inRange, preview } = state;
  const showBand = rangeStart || rangeEnd || inRange;

  return (
    <View style={[styles.dayCellWrap, showBand && styles.dayCellWrapRelative]}>
      {showBand && (
        <View
          pointerEvents="none"
          style={[
            styles.rangeBand,
            {
              left: rangeStart ? 0 : -BAND_BLEED,
              right: rangeEnd ? 0 : -BAND_BLEED,
              backgroundColor: `${theme.accentBgColor}${preview ? BAND_PREVIEW_ALPHA : BAND_ALPHA}`,
              borderTopLeftRadius: rangeStart ? theme.radiusPill : 0,
              borderBottomLeftRadius: rangeStart ? theme.radiusPill : 0,
              borderTopRightRadius: rangeEnd ? theme.radiusPill : 0,
              borderBottomRightRadius: rangeEnd ? theme.radiusPill : 0,
            },
          ]}
        />
      )}
      <Pressable
        testID={testID}
        role="cell"
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityState={{ selected: Boolean(selected || inRange), disabled }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.dayButton,
          { borderRadius: theme.radiusPill },
          selected
            ? { backgroundColor: theme.accentBgColor }
            : preview && (rangeStart || rangeEnd)
              ? { backgroundColor: `${theme.accentBgColor}${END_TINT_ALPHA}` }
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
  dayCellWrapRelative: {
    position: 'relative',
  },
  rangeBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
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
