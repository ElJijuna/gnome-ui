/**
 * Pure time helpers shared by `TimePicker` and `DatePicker`'s `showTime`
 * footer. Ported verbatim from `@gnome-ui/react`'s `TimePicker/timeUtils.ts`
 * — no DOM dependency there already, the same `calendarUtils.ts` precedent.
 *
 * Not exported from the package barrel — `DatePicker` imports it directly
 * via `@/components/TimePicker/timeUtils`, the same cross-folder internal
 * import `Calendar/calendarUtils.ts`'s `WeekStart` already established.
 */

/** A wall-clock time, in 24-hour terms. */
export interface TimeValue {
  /** Hours, `0`–`23`. */
  hours: number;
  /** Minutes, `0`–`59`. */
  minutes: number;
}

/** Zero-padded two-digit rendering for a clock column. */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Split a 0–23 hour into its 12-hour parts (`period`: 0 = AM, 1 = PM). */
export const to12 = (hours24: number) => ({
  hour: hours24 % 12 === 0 ? 12 : hours24 % 12,
  period: hours24 < 12 ? 0 : 1,
});

/** Recombine a 12-hour clock reading into a 0–23 hour. */
export const to24 = (hour12: number, period: number) =>
  period === 1 ? (hour12 % 12) + 12 : hour12 % 12;

/** The wall-clock time carried by a `Date`. */
export const timeOf = (date: Date): TimeValue => ({
  hours: date.getHours(),
  minutes: date.getMinutes(),
});

/**
 * `date`'s calendar day at `time`'s wall clock.
 *
 * A local `Date` cannot represent an hour that a DST spring-forward skips, and
 * the platform silently shifts it (02:30 → 03:30). That shift is kept — it is
 * the only real instant for that reading — so callers should read the result
 * back rather than assume the requested hour survived.
 */
export const mergeDateAndTime = (date: Date, time: TimeValue): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hours, time.minutes);
