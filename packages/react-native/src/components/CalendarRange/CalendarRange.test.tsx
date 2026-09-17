import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { toISODateKey } from '@/components/Calendar/calendarUtils';
import { GnomeProvider } from '@/GnomeProvider';
import { CalendarRange } from './CalendarRange';
import { isRangeAllowed, isWithinRange, orderRange, rangeLength } from './rangeUtils';

const wrap = (ui: ReactElement) => render(<GnomeProvider locale="en-US">{ui}</GnomeProvider>);

// 1 Aug 2026 was a Saturday; defaultMonth pins the grid so testIDs are stable.
const AUG_2026 = new Date(2026, 7, 1);
const dayId = (iso: string) => `cr-day-${iso}`;

describe('CalendarRange', () => {
  describe('selection', () => {
    it('emits only once both ends have a value', async () => {
      const onChange = jest.fn();
      await wrap(<CalendarRange defaultMonth={AUG_2026} onChange={onChange} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      expect(onChange).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByTestId(dayId('2026-08-14')));
      expect(onChange).toHaveBeenCalledTimes(1);
      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-14');
    });

    it('reports the anchor separately through onRangeStart', async () => {
      const onRangeStart = jest.fn();
      await wrap(<CalendarRange defaultMonth={AUG_2026} onRangeStart={onRangeStart} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));

      expect(onRangeStart).toHaveBeenCalledTimes(1);
      const [[anchor]] = onRangeStart.mock.calls;
      expect(toISODateKey(anchor)).toBe('2026-08-10');
    });

    it('orders a range picked backwards', async () => {
      const onChange = jest.fn();
      await wrap(<CalendarRange defaultMonth={AUG_2026} onChange={onChange} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-14')));
      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-14');
    });

    it('accepts a single-day range', async () => {
      const onChange = jest.fn();
      await wrap(<CalendarRange defaultMonth={AUG_2026} onChange={onChange} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-10');
    });

    it('marks both ends and every day between them', async () => {
      await wrap(<CalendarRange defaultMonth={AUG_2026} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      await fireEvent.press(screen.getByTestId(dayId('2026-08-14')));

      expect(screen.getByTestId(dayId('2026-08-10')).props.accessibilityLabel).toContain(
        'start of range',
      );
      expect(screen.getByTestId(dayId('2026-08-14')).props.accessibilityLabel).toContain(
        'end of range',
      );
      expect(screen.getByTestId(dayId('2026-08-12')).props.accessibilityLabel).toContain(
        'in selected range',
      );
      expect(screen.getByTestId(dayId('2026-08-12')).props.accessibilityState.selected).toBe(true);
      // Outside the range nothing is marked.
      expect(screen.getByTestId(dayId('2026-08-15')).props.accessibilityLabel).not.toContain(
        'range',
      );
    });

    it('announces the half-made and finished range', async () => {
      await wrap(<CalendarRange defaultMonth={AUG_2026} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      expect(
        screen.getByText(/Start date August 10, 2026 selected\. Choose an end date\./),
      ).toBeOnTheScreen();

      await fireEvent.press(screen.getByTestId(dayId('2026-08-14')));
      expect(
        screen.getByText(/Range August 10, 2026 to August 14, 2026 selected\./),
      ).toBeOnTheScreen();
    });

    it('does not update its own value when controlled', async () => {
      const onChange = jest.fn();
      await wrap(
        <CalendarRange
          month={AUG_2026}
          value={{ start: new Date(2026, 7, 3), end: new Date(2026, 7, 5) }}
          onChange={onChange}
          testID="cr"
        />,
      );

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      await fireEvent.press(screen.getByTestId(dayId('2026-08-14')));

      expect(onChange).toHaveBeenCalledTimes(1);
      // Still painting the controlled range, not the pressed one.
      expect(screen.getByTestId(dayId('2026-08-03')).props.accessibilityLabel).toContain(
        'start of range',
      );
      expect(screen.getByTestId(dayId('2026-08-10')).props.accessibilityLabel).not.toContain(
        'range',
      );
    });

    it('paints a partially filled controlled range as a single-day pill', async () => {
      await wrap(
        <CalendarRange
          month={AUG_2026}
          value={{ start: new Date(2026, 7, 3), end: null }}
          testID="cr"
        />,
      );

      const label = screen.getByTestId(dayId('2026-08-03')).props.accessibilityLabel;
      expect(label).toContain('start and end of range');
    });
  });

  describe('range limits', () => {
    it('disables days that would break maxRange while anchoring', async () => {
      const onChange = jest.fn();
      await wrap(
        <CalendarRange defaultMonth={AUG_2026} maxRange={3} onChange={onChange} testID="cr" />,
      );

      // Nothing is limited before the first tap.
      expect(screen.getByTestId(dayId('2026-08-14')).props.accessibilityState.disabled).toBe(false);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));
      expect(screen.getByTestId(dayId('2026-08-12')).props.accessibilityState.disabled).toBe(false);
      expect(screen.getByTestId(dayId('2026-08-13')).props.accessibilityState.disabled).toBe(true);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-13')));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables days that would break minRange while anchoring', async () => {
      await wrap(<CalendarRange defaultMonth={AUG_2026} minRange={3} testID="cr" />);

      await fireEvent.press(screen.getByTestId(dayId('2026-08-10')));

      expect(screen.getByTestId(dayId('2026-08-11')).props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId(dayId('2026-08-12')).props.accessibilityState.disabled).toBe(false);
    });

    it('still honours min and max', async () => {
      await wrap(
        <CalendarRange
          defaultMonth={AUG_2026}
          min={new Date(2026, 7, 10)}
          max={new Date(2026, 7, 20)}
          testID="cr"
        />,
      );

      expect(screen.getByTestId(dayId('2026-08-08')).props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId(dayId('2026-08-10')).props.accessibilityState.disabled).toBe(false);
      expect(screen.getByTestId(dayId('2026-08-30')).props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('drill-down', () => {
    it('marks the months and years holding the range', async () => {
      await wrap(
        <CalendarRange
          defaultMonth={AUG_2026}
          defaultValue={{ start: new Date(2026, 7, 10), end: new Date(2026, 9, 2) }}
          testID="cr"
        />,
      );

      await fireEvent.press(screen.getByText('August 2026'));
      expect(screen.getByTestId('cr-month-7').props.accessibilityState.selected).toBe(true);
      expect(screen.getByTestId('cr-month-9').props.accessibilityState.selected).toBe(true);
      expect(screen.getByTestId('cr-month-2').props.accessibilityState.selected).toBe(false);

      await fireEvent.press(screen.getByText('2026'));
      expect(screen.getByTestId('cr-year-2026').props.accessibilityState.selected).toBe(true);
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await wrap(<CalendarRange defaultMonth={AUG_2026} testID="my-range" />);
      expect(screen.getByTestId('my-range')).toBeOnTheScreen();
    });
  });
});

// The range maths is asserted directly, the way `calendarUtils` is.
describe('rangeUtils', () => {
  it('orderRange sorts the pair and normalises to local midnight', () => {
    const range = orderRange(new Date(2026, 7, 14, 23, 30), new Date(2026, 7, 10, 6, 15));
    expect(toISODateKey(range.start)).toBe('2026-08-10');
    expect(toISODateKey(range.end)).toBe('2026-08-14');
    expect(range.start.getHours()).toBe(0);
  });

  it('rangeLength counts both ends', () => {
    expect(rangeLength(orderRange(new Date(2026, 7, 10), new Date(2026, 7, 10)))).toBe(1);
    expect(rangeLength(orderRange(new Date(2026, 7, 10), new Date(2026, 7, 14)))).toBe(5);
    // Across a DST boundary a "day" is 23 or 25 hours; the count must not drift.
    expect(rangeLength(orderRange(new Date(2026, 2, 28), new Date(2026, 3, 1)))).toBe(5);
  });

  it('isWithinRange includes both ends', () => {
    const range = orderRange(new Date(2026, 7, 10), new Date(2026, 7, 14));
    expect(isWithinRange(new Date(2026, 7, 10), range)).toBe(true);
    expect(isWithinRange(new Date(2026, 7, 14), range)).toBe(true);
    expect(isWithinRange(new Date(2026, 7, 15), range)).toBe(false);
  });

  it('isRangeAllowed enforces the day limits', () => {
    const fiveDays = orderRange(new Date(2026, 7, 10), new Date(2026, 7, 14));
    expect(isRangeAllowed(fiveDays)).toBe(true);
    expect(isRangeAllowed(fiveDays, 6)).toBe(false);
    expect(isRangeAllowed(fiveDays, 1, 4)).toBe(false);
    expect(isRangeAllowed(fiveDays, 1, 5)).toBe(true);
  });
});
