import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native';

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
import { useDateTimeFormatter } from '@/GnomeProvider';

import {
  type DateRange,
  emptyRange,
  isRangeAllowed,
  isWithinRange,
  orderRange,
  type SelectedDateRange,
} from './rangeUtils';

export type { DateRange, SelectedDateRange } from './rangeUtils';

export interface CalendarRangeProps {
  /** Controlled range. Either end may be `null` while nothing is chosen. */
  value?: DateRange | null;
  /** Initial range when uncontrolled. Defaults to an empty range. */
  defaultValue?: DateRange | null;
  /**
   * Called with the finished range — **only once both ends have a value**.
   * The first tap merely anchors the range, so this never fires with a half
   * selection.
   */
  onChange?: (range: SelectedDateRange) => void;
  /** Called with the anchor day when the first of the two taps lands. */
  onRangeStart?: (date: Date) => void;
  /** Controlled displayed month (any date within the desired month). */
  month?: Date;
  /**
   * Initial displayed month when uncontrolled. Defaults to the range's
   * start month, falling back to the current month.
   */
  defaultMonth?: Date;
  /** Called when the displayed month changes via navigation. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** Shortest range the user may commit, in days (both ends counted). Defaults to `1`. */
  minRange?: number;
  /** Longest range the user may commit, in days (both ends counted). Unlimited by default. */
  maxRange?: number;
  weekStartsOn?: WeekStart;
  showHeading?: boolean;
  showDayNames?: boolean;
  showWeekNumbers?: boolean;
  showViewSwitcher?: boolean;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Visually hides the live-region status announcement without removing it
// from the accessibility tree — same recipe `CopyButton`'s own
// `LIVE_REGION_STYLE` already established (this package has no extracted
// `VisuallyHidden` component yet — see the ROADMAP's own note on that gap).
const LIVE_REGION_STYLE = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  overflow: 'hidden' as const,
};

/**
 * Start/end date-range selection driving the same grid engine as `Calendar`
 * — month/year drill-down, `min`/`max`, week numbers — via `CalendarBase`,
 * the shared engine `Calendar` extracted once this component actually
 * needed it.
 *
 * The first tap anchors the range; the second commits it. `onChange`
 * therefore only ever fires with **both** ends filled in. Tapping backwards
 * is fine — the pair is ordered before it is emitted.
 *
 * **No live drag-preview band, unlike the web version.** The web
 * `CalendarRange` grows the band under the mouse/keyboard focus between the
 * two clicks; RN has no hover and this package's whole keyboard layer is
 * already dropped (see `Calendar`'s own doc comment), so there is no signal
 * to preview against. The anchor day simply shows as a normal selected day
 * until the second tap lands and the full band appears at once — the
 * touch-first subset of the same interaction, the same kind of trade-off
 * `RatingStars`/`ToggleGroup`/`Calendar` itself already made for dropped
 * hover/keyboard affordances. `CalendarBase`'s `CalendarSelectionModel` was
 * trimmed to match — no `hoverDay`/`focusDayChange` to wire up here.
 *
 * `visibleMonths` (side-by-side month panels, the usual desktop range-picker
 * shape) has no phone-width equivalent — dropped, the same `Calendar`
 * `visibleMonths` precedent. `locale` is dropped too, in favor of
 * `GnomeProvider`'s app-wide `useDateTimeFormatter`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/gtk/gtk4/class.Calendar.html
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
  ...props
}: CalendarRangeProps) => {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<DateRange>(
    () => defaultValue ?? emptyRange(),
  );
  const committed = (isControlled ? controlledValue : uncontrolledValue) ?? emptyRange();

  // The half-made range: the committed first tap, waiting on the second.
  const [anchor, setAnchor] = useState<Date | null>(null);

  // What the grid paints right now: the range being drawn wins over the
  // committed one, so a new selection replaces the old band immediately.
  const active = anchor
    ? { ...orderRange(anchor, anchor), pending: true }
    : committed.start && committed.end
      ? { ...orderRange(committed.start, committed.end), pending: false }
      : committed.start || committed.end
        ? (() => {
            const only = startOfDay((committed.start ?? committed.end) as Date);
            return { start: only, end: only, pending: false };
          })()
        : null;

  const rangeFmt = useDateTimeFormatter({ dateStyle: 'long' });

  const isDayDisabled = (date: Date) => {
    if (isOutOfRange(date, min, max)) {
      return true;
    }
    // While anchoring, days that could only produce a too-short or too-long
    // range are unreachable rather than silently rejected on tap.
    return anchor ? !isRangeAllowed(orderRange(anchor, date), minRange, maxRange) : false;
  };

  const selection: CalendarSelectionModel = {
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
        // Mid-selection only the clicked anchor is a real end; the other
        // side is still just a preview, so it must not read as chosen.
        selected: !active.pending || (anchor ? isSameDay(date, anchor) : false),
        labelSuffix:
          isStart && isEnd
            ? ', start and end of range'
            : isStart
              ? ', start of range'
              : ', end of range',
      };
    },
    activateDay: (day) => {
      if (!anchor) {
        setAnchor(day);
        onRangeStart?.(day);
        return;
      }
      const next = orderRange(anchor, day);
      setAnchor(null);
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
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
      footer={
        <Text role="status" accessibilityLiveRegion="polite" style={LIVE_REGION_STYLE}>
          {status}
        </Text>
      }
      {...props}
    />
  );
};
