import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Calendar } from './Calendar';
import { addMonths, getCalendarWeeks, isoWeekNumber, toISODateKey } from './calendarUtils';

// A fixed "today" keeps the today-ring and default-focus assertions stable.
const TODAY = new Date(2026, 7, 12); // Wed 12 Aug 2026

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

const august2026 = new Date(2026, 7, 1);
const day = (label: string) => screen.getByRole('button', { name: label });

describe('Calendar', () => {
  describe('rendering', () => {
    it('renders a labelled grid for the displayed month', () => {
      render(<Calendar defaultMonth={august2026} />);
      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });

    it('renders every day of the displayed month', () => {
      render(<Calendar defaultMonth={august2026} />);
      // August has 31 days.
      expect(day('Saturday, August 1, 2026')).toBeInTheDocument();
      expect(day('Monday, August 31, 2026')).toBeInTheDocument();
    });

    it('renders weekday column headers', () => {
      render(<Calendar defaultMonth={august2026} weekStartsOn={1} />);
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveAttribute('aria-label', 'Monday');
      expect(headers[6]).toHaveAttribute('aria-label', 'Sunday');
    });

    it('marks today with aria-current', () => {
      render(<Calendar defaultMonth={august2026} />);
      expect(day('Wednesday, August 12, 2026')).toHaveAttribute('aria-current', 'date');
    });

    it('shows week numbers when requested', () => {
      render(<Calendar defaultMonth={august2026} showWeekNumbers weekStartsOn={1} />);
      expect(screen.getByRole('columnheader', { name: 'Week' })).toBeInTheDocument();
      expect(screen.getAllByRole('rowheader').length).toBe(6);
    });

    it('omits the heading when showHeading is false', () => {
      render(<Calendar defaultMonth={august2026} showHeading={false} />);
      expect(screen.queryByRole('button', { name: 'Previous month' })).not.toBeInTheDocument();
      // Grid still names itself via aria-label.
      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('selects a day on click and marks its gridcell', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar defaultMonth={august2026} onChange={onChange} />);

      await user.click(day('Saturday, August 15, 2026'));

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
      expect(toISODateKey(onChange.mock.calls[0][0])).toBe('2026-08-15');
      expect(day('Saturday, August 15, 2026').closest('[role="gridcell"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('does not update its own selection when controlled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Calendar month={august2026} value={new Date(2026, 7, 10)} onChange={onChange} />);

      await user.click(day('Saturday, August 15, 2026'));

      expect(onChange).toHaveBeenCalledOnce();
      // Still shows the controlled value as selected, not the clicked day.
      expect(day('Monday, August 10, 2026').closest('[role="gridcell"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('selecting an adjacent-month day navigates to that month', async () => {
      const user = userEvent.setup();
      const onMonthChange = vi.fn();
      render(<Calendar defaultMonth={august2026} onMonthChange={onMonthChange} />);

      // The last row of August 2026 spills into early September.
      await user.click(day('Tuesday, September 1, 2026'));

      expect(onMonthChange).toHaveBeenCalledOnce();
      expect(screen.getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
    });
  });

  describe('month navigation', () => {
    it('steps back a month via the heading button', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(screen.getByRole('button', { name: 'Previous month' }));
      expect(screen.getByRole('grid', { name: /july 2026/i })).toBeInTheDocument();
    });

    it('steps forward a month via the heading button', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(screen.getByRole('button', { name: 'Next month' }));
      expect(screen.getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
    });

    it('does not change its own month when controlled', async () => {
      const user = userEvent.setup();
      const onMonthChange = vi.fn();
      render(<Calendar month={august2026} onMonthChange={onMonthChange} />);

      await user.click(screen.getByRole('button', { name: 'Next month' }));

      expect(onMonthChange).toHaveBeenCalledOnce();
      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });
  });

  describe('roving tabindex', () => {
    it('makes today the only tabbable day by default', () => {
      render(<Calendar defaultMonth={august2026} />);
      expect(day('Wednesday, August 12, 2026')).toHaveAttribute('tabindex', '0');
      expect(day('Saturday, August 15, 2026')).toHaveAttribute('tabindex', '-1');
    });

    it('makes the selected day the tabbable one', () => {
      render(<Calendar defaultMonth={august2026} defaultValue={new Date(2026, 7, 20)} />);
      expect(day('Thursday, August 20, 2026')).toHaveAttribute('tabindex', '0');
      expect(day('Wednesday, August 12, 2026')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('range limits', () => {
    it('disables days outside [min, max]', () => {
      render(
        <Calendar
          defaultMonth={august2026}
          min={new Date(2026, 7, 10)}
          max={new Date(2026, 7, 20)}
        />,
      );
      expect(day('Saturday, August 8, 2026')).toHaveAttribute('aria-disabled', 'true');
      expect(day('Monday, August 10, 2026')).not.toHaveAttribute('aria-disabled');
      expect(day('Sunday, August 30, 2026')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not select a disabled day', () => {
      const onChange = vi.fn();
      render(
        <Calendar defaultMonth={august2026} min={new Date(2026, 7, 10)} onChange={onChange} />,
      );

      // Bypass the pointer-events:none guard to prove the handler itself refuses.
      fireEvent.click(day('Saturday, August 8, 2026'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root', () => {
      const { container } = render(<Calendar defaultMonth={august2026} className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});

// The pure date maths carries the algorithmic weight (grid layout, ISO weeks),
// so it is asserted directly rather than only through the rendered component.
describe('calendarUtils', () => {
  it('getCalendarWeeks always returns a 6×7 grid aligned to weekStartsOn', () => {
    const weeks = getCalendarWeeks(august2026, 1);
    expect(weeks).toHaveLength(6);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    // Monday-start: 1 Aug 2026 is a Saturday, so the grid opens on 27 Jul.
    expect(toISODateKey(weeks[0][0])).toBe('2026-07-27');
    expect(weeks[0][0].getDay()).toBe(1); // Monday
  });

  it('getCalendarWeeks respects a Sunday start', () => {
    const weeks = getCalendarWeeks(august2026, 0);
    expect(weeks[0][0].getDay()).toBe(0); // Sunday
    expect(toISODateKey(weeks[0][0])).toBe('2026-07-26');
  });

  it('addMonths clamps the day to the shorter target month', () => {
    // 31 Jan + 1 month → 28 Feb (2026 is not a leap year).
    expect(toISODateKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
  });

  it('isoWeekNumber matches known ISO-8601 boundaries', () => {
    expect(isoWeekNumber(new Date(2026, 0, 1))).toBe(1); // 1 Jan 2026 (Thu) → W1
    expect(isoWeekNumber(new Date(2026, 7, 12))).toBe(33);
    // 1 Jan 2027 is a Friday → still ISO week 53 of 2026.
    expect(isoWeekNumber(new Date(2027, 0, 1))).toBe(53);
  });
});
