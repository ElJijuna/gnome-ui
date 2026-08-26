/**
 * Pure date helpers for `Calendar`. Kept dependency-free (no date library) and
 * side-effect-free so they can be unit-tested in isolation, mirroring the
 * `dialogUtils.ts` split used by `Dialog`.
 *
 * Every helper operates on the local time zone — GNOME's `GtkCalendar` is a
 * civil-date widget, so a "day" is a wall-clock day, never a UTC instant.
 */

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Midnight (local) of the given date, as a fresh `Date`. */
export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** First day of the month containing `date`, at local midnight. */
export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

/** `true` when both dates fall on the same calendar day. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** `true` when both dates fall in the same calendar month. */
export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** `date` shifted by `amount` days (may be negative). */
export const addDays = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

/**
 * The date `year-month-day`, with the day clamped to the last valid day of that
 * month. Used whenever a month or year jump must keep the day-of-month intact.
 */
export const clampDayToMonth = (year: number, month: number, day: number): Date => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
};

/**
 * `date` shifted by `amount` months, keeping the day-of-month where possible
 * and clamping to the last valid day otherwise (e.g. Jan 31 + 1 month → Feb 28).
 */
export const addMonths = (date: Date, amount: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return clampDayToMonth(target.getFullYear(), target.getMonth(), date.getDate());
};

/**
 * `date` shifted by `amount` years, clamping the day-of-month where the target
 * year is shorter (e.g. 29 Feb 2028 - 1 year → 28 Feb 2027).
 */
export const addYears = (date: Date, amount: number): Date =>
  clampDayToMonth(date.getFullYear() + amount, date.getMonth(), date.getDate());

/** How many years one page of the year view shows. */
export const YEARS_PER_PAGE = 12;

/** First year of the fixed-size page of years containing `year`. */
export const startOfYearPage = (year: number): number =>
  Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;

/** Distance in days from the week's start to `date`, given the first weekday. */
export const weekdayOffset = (date: Date, weekStartsOn: WeekStart): number =>
  (date.getDay() - weekStartsOn + 7) % 7;

/**
 * The six-week grid (always 6 rows × 7 days) that `GtkCalendar` renders for a
 * month — leading/trailing days belong to the adjacent months. A fixed row
 * count avoids the layout jump months of differing length would otherwise cause.
 */
export const getCalendarWeeks = (month: Date, weekStartsOn: WeekStart): Date[][] => {
  const first = startOfMonth(month);
  const start = addDays(first, -weekdayOffset(first, weekStartsOn));
  const weeks: Date[][] = [];

  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(addDays(start, w * 7 + d));
    }
    weeks.push(row);
  }

  return weeks;
};

/** ISO-8601 week number (weeks start Monday; week 1 contains the first Thursday). */
export const isoWeekNumber = (date: Date): number => {
  // Shift to the Thursday of this ISO week, then count weeks from Jan 1.
  const target = startOfDay(date);
  const dayNr = (target.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};

/** `true` when `date` is outside the inclusive `[min, max]` range. */
export const isOutOfRange = (date: Date, min?: Date, max?: Date): boolean => {
  const day = startOfDay(date).getTime();
  if (min && day < startOfDay(min).getTime()) {
    return true;
  }
  if (max && day > startOfDay(max).getTime()) {
    return true;
  }
  return false;
};

/** `true` when every day of `date`'s month falls outside the inclusive `[min, max]` range. */
export const isMonthOutOfRange = (date: Date, min?: Date, max?: Date): boolean => {
  const first = startOfMonth(date);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return isOutOfRange(last, min, undefined) || isOutOfRange(first, undefined, max);
};

/** `true` when every day of `date`'s year falls outside the inclusive `[min, max]` range. */
export const isYearOutOfRange = (date: Date, min?: Date, max?: Date): boolean => {
  const first = new Date(date.getFullYear(), 0, 1);
  const last = new Date(date.getFullYear(), 11, 31);
  return isOutOfRange(last, min, undefined) || isOutOfRange(first, undefined, max);
};

/** A stable `YYYY-MM-DD` key for a date, used for DOM `data-date` lookups. */
export const toISODateKey = (date: Date): string => {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
