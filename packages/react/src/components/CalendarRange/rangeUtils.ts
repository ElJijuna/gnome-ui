/**
 * Pure helpers for `CalendarRange`. Kept dependency-free and side-effect-free,
 * mirroring the `calendarUtils.ts` split used by `Calendar`.
 */

import { startOfDay } from '@/components/Calendar/calendarUtils';

/** A range under construction — either end may still be missing. */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** A finished range: both ends have a value. The only shape `onChange` emits. */
export interface SelectedDateRange {
  start: Date;
  end: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** The empty range, as a fresh object so callers never share one. */
export const emptyRange = (): DateRange => ({ start: null, end: null });

/** Both dates as a range, oldest first — so picking backwards still works. */
export const orderRange = (a: Date, b: Date): SelectedDateRange => {
  const first = startOfDay(a);
  const second = startOfDay(b);
  return first.getTime() <= second.getTime()
    ? { start: first, end: second }
    : { start: second, end: first };
};

/**
 * Length of the range in days, counting both ends (so a single day is `1`).
 * Rounded, because a DST change makes a "day" 23 or 25 hours long.
 */
export const rangeLength = (range: SelectedDateRange): number =>
  Math.round((startOfDay(range.end).getTime() - startOfDay(range.start).getTime()) / MS_PER_DAY) +
  1;

/** `true` when `date` falls on or between both ends. */
export const isWithinRange = (date: Date, range: SelectedDateRange): boolean => {
  const day = startOfDay(date).getTime();
  return day >= startOfDay(range.start).getTime() && day <= startOfDay(range.end).getTime();
};

/** `true` when the range satisfies the `minRange`/`maxRange` day limits. */
export const isRangeAllowed = (
  range: SelectedDateRange,
  minRange = 1,
  maxRange?: number,
): boolean => {
  const length = rangeLength(range);
  return length >= minRange && (maxRange === undefined || length <= maxRange);
};

/** `true` when both ends have a value — the condition for emitting a change. */
export const isRangeComplete = (range: DateRange): range is SelectedDateRange =>
  range.start !== null && range.end !== null;
