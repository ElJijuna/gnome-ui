import { type HTMLAttributes, useState } from 'react';

import { CalendarBase, type CalendarSelectionModel, type CalendarView } from './CalendarBase';
import { isOutOfRange, isSameDay, isSameMonth, startOfDay, type WeekStart } from './calendarUtils';

export type { CalendarView } from './CalendarBase';

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
  /** Number of month panels rendered side by side. Defaults to `1`. */
  visibleMonths?: number;
  /**
   * Move DOM focus onto the roving day cell as soon as the grid mounts. Used by
   * pickers that reveal the calendar in a popover and want the keyboard to land
   * on a day rather than the month-navigation button.
   */
  autoFocus?: boolean;
}

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
 * For start/end selection use `CalendarRange`, which drives the same grid.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export const Calendar = ({
  value: controlledValue,
  defaultValue = null,
  onChange,
  min,
  max,
  ...props
}: CalendarProps) => {
  const isValueControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const selected = isValueControlled ? controlledValue : uncontrolledValue;

  const selection: CalendarSelectionModel = {
    seedFocus: selected,
    dayState: (date) => ({ selected: selected ? isSameDay(date, selected) : false }),
    isDayDisabled: (date) => isOutOfRange(date, min, max),
    activateDay: (date) => {
      if (isOutOfRange(date, min, max)) {
        return;
      }
      const day = startOfDay(date);
      if (!isValueControlled) {
        setUncontrolledValue(day);
      }
      onChange?.(day);
    },
    isMonthSelected: (month) => (selected ? isSameMonth(month, selected) : false),
    isYearSelected: (year) => (selected ? selected.getFullYear() === year : false),
  };

  return (
    <CalendarBase selection={selection} fallbackMonth={selected} min={min} max={max} {...props} />
  );
};
