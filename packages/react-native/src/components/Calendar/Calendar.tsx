import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { CalendarBase, type CalendarSelectionModel, type CalendarView } from './CalendarBase';
import { isOutOfRange, isSameDay, isSameMonth, type WeekStart } from './calendarUtils';

export type { CalendarView } from './CalendarBase';

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

/**
 * Month-grid date display — mirrors `GtkCalendar` and `@gnome-ui/react`'s own
 * `Calendar`. Usable standalone (settings, forms) or as the panel inside
 * `DatePicker`.
 *
 * The heading label drills down day grid → month grid → year grid so a
 * distant year is two taps away instead of many pages, exactly as on the web.
 * Leading/trailing days from adjacent months are shown dimmed and remain
 * tappable — tapping one navigates to that month, matching `GtkCalendar`.
 *
 * A thin single-day `CalendarSelectionModel` over `CalendarBase` — the
 * shared grid engine (month window, heading, day/month/year drill-down)
 * extracted once `CalendarRange` actually needed it, per the note this
 * component left when it first shipped rather than adding the split ahead
 * of need.
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
 * `GnomeProvider` already exposes through `useDateTimeFormatter`.
 *
 * For start/end selection use `CalendarRange`, which shares this same grid
 * engine via `CalendarBase`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
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
    dayState: (date) => (selected && isSameDay(date, selected) ? { selected: true } : {}),
    isDayDisabled: (date) => isOutOfRange(date, min, max),
    activateDay: (day) => {
      if (!isValueControlled) {
        setUncontrolledValue(day);
      }
      onChange?.(day);
    },
    isMonthSelected: (month) => (selected ? isSameMonth(month, selected) : false),
    isYearSelected: (year) => selected?.getFullYear() === year,
  };

  return (
    <CalendarBase selection={selection} fallbackMonth={selected} min={min} max={max} {...props} />
  );
};
