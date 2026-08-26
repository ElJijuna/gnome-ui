import { type HTMLAttributes, useMemo, useState } from 'react';

import {
  CalendarBase,
  type CalendarSelectionModel,
  type CalendarView,
} from '@/components/Calendar/CalendarBase';
import {
  isOutOfRange,
  isSameDay,
  isSameMonth,
  startOfDay,
  type WeekStart,
} from '@/components/Calendar/calendarUtils';
import { VisuallyHidden } from '@/components/VisuallyHidden';

import {
  type DateRange,
  emptyRange,
  isRangeAllowed,
  isWithinRange,
  orderRange,
  type SelectedDateRange,
} from './rangeUtils';

export type { DateRange, SelectedDateRange } from './rangeUtils';

export interface CalendarRangeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled range. Either end may be `null` while nothing is chosen. */
  value?: DateRange | null;
  /** Initial range when uncontrolled. Defaults to an empty range. */
  defaultValue?: DateRange | null;
  /**
   * Called with the finished range — **only once both ends have a value**. The
   * first click merely anchors the range, so this never fires with a half
   * selection.
   */
  onChange?: (range: SelectedDateRange) => void;
  /** Called with the anchor day when the first of the two clicks lands. */
  onRangeStart?: (date: Date) => void;
  /** Controlled leftmost displayed month (any date within the desired month). */
  month?: Date;
  /**
   * Initial leftmost displayed month when uncontrolled. Defaults to the range's
   * start month, falling back to the current month.
   */
  defaultMonth?: Date;
  /** Called when the displayed months change via navigation. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** Shortest range the user may commit, in days (both ends counted). Defaults to `1`. */
  minRange?: number;
  /** Longest range the user may commit, in days (both ends counted). Unlimited by default. */
  maxRange?: number;
  /**
   * How many month panels to show side by side, paged together by the shared
   * heading. Defaults to `1`; `2` is the usual shape for a range picker.
   */
  visibleMonths?: number;
  /** First day of the week: `0` (Sunday) … `6` (Saturday). Defaults to `1` (Monday). */
  weekStartsOn?: WeekStart;
  /** BCP-47 locale for month/day names. Defaults to the runtime locale. */
  locale?: string;
  /** Show the heading with prev/next navigation. */
  showHeading?: boolean;
  /** Show the abbreviated day-name column headers. */
  showDayNames?: boolean;
  /** Show an ISO week-number column. */
  showWeekNumbers?: boolean;
  /** Turn the heading label into the day → month → year drill-down. Defaults to `true`. */
  showViewSwitcher?: boolean;
  /** Grid shown on mount: `'days'`, `'months'` or `'years'`. Defaults to `'days'`. */
  defaultView?: CalendarView;
  /** Called when the drill-down view changes. */
  onViewChange?: (view: CalendarView) => void;
  /** Move DOM focus onto the roving day cell as soon as the grid mounts. */
  autoFocus?: boolean;
}

/**
 * Start/end date-range selection driving the same grid engine as `Calendar` —
 * roving tabindex, month/year drill-down, `min`/`max`, week numbers.
 *
 * The first click anchors the range and paints a live band up to the hovered
 * (or keyboard-focused) day; the second commits it. `onChange` therefore only
 * ever fires with **both** ends filled in. Picking backwards is fine — the pair
 * is ordered before it is emitted — and <kbd>Esc</kbd> cancels a half-made
 * range (after leaving the drill-down, which Escape closes first).
 *
 * `visibleMonths` renders N panels side by side so a range spanning months can
 * be picked without navigating.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export const CalendarRange = ({
  value: controlledValue,
  defaultValue,
  onChange,
  onRangeStart,
  min,
  max,
  minRange = 1,
  maxRange,
  locale,
  ...props
}: CalendarRangeProps) => {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    () => defaultValue ?? emptyRange(),
  );
  const committed = (isControlled ? controlledValue : uncontrolledValue) ?? emptyRange();

  // The half-made range: `anchor` is the committed first click, `preview` the
  // day the pointer or the roving focus is currently over.
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [preview, setPreview] = useState<Date | null>(null);

  // What the grid paints right now: the range being drawn wins over the
  // committed one, so a new selection replaces the old band immediately.
  const active = anchor
    ? { ...orderRange(anchor, preview ?? anchor), pending: true }
    : committed.start && committed.end
      ? { ...orderRange(committed.start, committed.end), pending: false }
      : committed.start || committed.end
        ? (() => {
            const only = startOfDay((committed.start ?? committed.end) as Date);
            return { start: only, end: only, pending: false };
          })()
        : null;

  const rangeFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }), [locale]);

  const isDayDisabled = (date: Date) => {
    if (isOutOfRange(date, min, max)) {
      return true;
    }
    // While anchoring, days that could only produce a too-short or too-long
    // range are unreachable rather than silently rejected on click.
    return anchor ? !isRangeAllowed(orderRange(anchor, date), minRange, maxRange) : false;
  };

  const selection: CalendarSelectionModel = {
    seedFocus: committed.start ?? committed.end ?? null,
    isDayDisabled,
    dayState: (date) => {
      if (!active) {
        return {};
      }
      const isStart = isSameDay(date, active.start);
      const isEnd = isSameDay(date, active.end);
      if (!isStart && !isEnd) {
        return isWithinRange(date, active)
          ? { inRange: true, preview: active.pending, labelSuffix: ', in selected range' }
          : {};
      }
      return {
        rangeStart: isStart,
        rangeEnd: isEnd,
        preview: active.pending,
        // Mid-selection only the clicked anchor is a real end; the other side
        // is still just a preview, so it must not read as chosen.
        selected: !active.pending || (anchor ? isSameDay(date, anchor) : false),
        labelSuffix:
          isStart && isEnd
            ? ', start and end of range'
            : isStart
              ? ', start of range'
              : ', end of range',
      };
    },
    activateDay: (date) => {
      if (isDayDisabled(date)) {
        return;
      }
      const day = startOfDay(date);
      if (!anchor) {
        setAnchor(day);
        setPreview(day);
        onRangeStart?.(day);
        return;
      }
      const next = orderRange(anchor, day);
      setAnchor(null);
      setPreview(null);
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    hoverDay: (date) => {
      if (anchor) {
        setPreview(date);
      }
    },
    focusDayChange: (date) => {
      if (anchor) {
        setPreview(date);
      }
    },
    escape: () => {
      if (!anchor) {
        return false;
      }
      setAnchor(null);
      setPreview(null);
      return true;
    },
    isMonthSelected: (month) =>
      Boolean(
        (committed.start && isSameMonth(month, committed.start)) ||
          (committed.end && isSameMonth(month, committed.end)),
      ),
    isYearSelected: (year) =>
      committed.start?.getFullYear() === year || committed.end?.getFullYear() === year,
  };

  const status = anchor
    ? `Start date ${rangeFmt.format(anchor)} selected. Choose an end date.`
    : committed.start && committed.end
      ? `Range ${rangeFmt.format(committed.start)} to ${rangeFmt.format(committed.end)} selected.`
      : '';

  return (
    <CalendarBase
      selection={selection}
      fallbackMonth={committed.start ?? committed.end ?? null}
      min={min}
      max={max}
      locale={locale}
      footer={
        <VisuallyHidden role="status" aria-live="polite">
          {status}
        </VisuallyHidden>
      }
      {...props}
    />
  );
};
