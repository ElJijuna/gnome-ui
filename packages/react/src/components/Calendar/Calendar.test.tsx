import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Calendar } from './Calendar';
import {
  addMonths,
  addYears,
  getCalendarWeeks,
  isMonthOutOfRange,
  isoWeekNumber,
  isYearOutOfRange,
  startOfYearPage,
  toISODateKey,
} from './calendarUtils';

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

    it('follows real DOM focus so arrow keys continue from there', () => {
      render(<Calendar defaultMonth={august2026} />);

      // A screen reader can park focus on any cell, not just the tabbable one.
      act(() => day('Monday, August 24, 2026').focus());
      expect(day('Monday, August 24, 2026')).toHaveAttribute('tabindex', '0');
      expect(day('Wednesday, August 12, 2026')).toHaveAttribute('tabindex', '-1');

      fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });
      expect(day('Tuesday, August 25, 2026')).toHaveAttribute('tabindex', '0');
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

  // Modern date pickers reach a distant year by drilling down through a month
  // grid and a year grid rather than paging month by month; the heading label
  // is the drill-down trigger.
  describe('view drill-down', () => {
    const heading = (name: RegExp) => screen.getByRole('button', { name });

    it('opens the month grid from the heading label', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(heading(/^august 2026, choose a month$/i));

      expect(screen.getByRole('grid', { name: /select a month in 2026/i })).toBeInTheDocument();
      // Twelve months, one row of four per quarter.
      expect(screen.getAllByRole('gridcell')).toHaveLength(12);
      expect(screen.getByRole('button', { name: 'March 2026' })).toBeInTheDocument();
    });

    it("picking a month returns to that month's day grid", async () => {
      const user = userEvent.setup();
      const onMonthChange = vi.fn();
      render(<Calendar defaultMonth={august2026} onMonthChange={onMonthChange} />);

      await user.click(heading(/choose a month/i));
      await user.click(screen.getByRole('button', { name: 'March 2026' }));

      expect(onMonthChange).toHaveBeenCalledOnce();
      expect(toISODateKey(onMonthChange.mock.calls[0][0])).toBe('2026-03-01');
      expect(screen.getByRole('grid', { name: /march 2026/i })).toBeInTheDocument();
    });

    it('opens the year grid on the second step and pages by twelve years', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(heading(/choose a month/i));
      await user.click(heading(/^2026, choose a year$/i));

      // 2026 sits in the 2016–2027 page.
      expect(screen.getByRole('grid', { name: /select a year, 2016 – 2027/i })).toBeInTheDocument();
      expect(screen.getAllByRole('gridcell')).toHaveLength(12);

      await user.click(screen.getByRole('button', { name: 'Previous years' }));
      expect(screen.getByRole('grid', { name: /2004 – 2015/i })).toBeInTheDocument();
    });

    it("picking a year drops back to that year's month grid", async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(heading(/choose a month/i));
      await user.click(heading(/choose a year/i));
      await user.click(screen.getByRole('button', { name: '2019' }));

      expect(screen.getByRole('grid', { name: /select a month in 2019/i })).toBeInTheDocument();

      // …and picking a month from there lands on the day grid of that year.
      await user.click(screen.getByRole('button', { name: 'August 2019' }));
      expect(screen.getByRole('grid', { name: /august 2019/i })).toBeInTheDocument();
    });

    it('relabels the step buttons for the active view', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();

      await user.click(heading(/choose a month/i));
      await user.click(screen.getByRole('button', { name: 'Next year' }));
      expect(screen.getByRole('grid', { name: /select a month in 2027/i })).toBeInTheDocument();
    });

    it('reports view changes through onViewChange', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();
      render(<Calendar defaultMonth={august2026} onViewChange={onViewChange} />);

      await user.click(heading(/choose a month/i));
      await user.click(heading(/choose a year/i));

      expect(onViewChange.mock.calls.map(([v]) => v)).toEqual(['months', 'years']);
    });

    it('cycles back to the day grid from the year grid', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={august2026} />);

      await user.click(heading(/choose a month/i));
      await user.click(heading(/choose a year/i));
      await user.click(heading(/back to days/i));

      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });

    it('Escape backs out of a drill-down without bubbling to an enclosing popover', async () => {
      const user = userEvent.setup();
      const onEscape = vi.fn();
      render(
        <div onKeyDown={onEscape}>
          <Calendar defaultMonth={august2026} />
        </div>,
      );

      await user.click(heading(/choose a month/i));
      fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' });

      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
      expect(onEscape).not.toHaveBeenCalled();
    });

    it('opens directly on a requested view', () => {
      render(<Calendar defaultMonth={august2026} defaultView="years" />);
      expect(screen.getByRole('grid', { name: /select a year/i })).toBeInTheDocument();
    });

    it('keeps a plain label — and the day grid — when the switcher is off', () => {
      render(<Calendar defaultMonth={august2026} showViewSwitcher={false} defaultView="years" />);

      expect(screen.queryByRole('button', { name: /choose a month/i })).not.toBeInTheDocument();
      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });

    describe('keyboard', () => {
      const rovingCell = () =>
        screen.getByRole('grid').querySelector<HTMLButtonElement>('button[tabindex="0"]');

      it('moves the roving cell across the month grid and selects with Enter', async () => {
        const user = userEvent.setup();
        render(<Calendar defaultMonth={august2026} />);
        await user.click(heading(/choose a month/i));

        const grid = screen.getByRole('grid');
        // Seeded on August; one column right is September, one row down is +4.
        expect(rovingCell()).toHaveAttribute('aria-label', 'August 2026');
        fireEvent.keyDown(grid, { key: 'ArrowRight' });
        expect(rovingCell()).toHaveAttribute('aria-label', 'September 2026');
        fireEvent.keyDown(grid, { key: 'ArrowUp' });
        expect(rovingCell()).toHaveAttribute('aria-label', 'May 2026');

        fireEvent.keyDown(grid, { key: 'Enter' });
        expect(screen.getByRole('grid', { name: /may 2026/i })).toBeInTheDocument();
      });

      it('pages the month grid a year at a time when focus leaves it', async () => {
        const user = userEvent.setup();
        render(<Calendar defaultMonth={new Date(2026, 0, 1)} />);
        await user.click(heading(/choose a month/i));

        // January - one column left wraps into December of the previous year.
        fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowLeft' });
        expect(screen.getByRole('grid', { name: /select a month in 2025/i })).toBeInTheDocument();
        expect(rovingCell()).toHaveAttribute('aria-label', 'December 2025');
      });

      it('moves across the year grid and selects with Enter', async () => {
        const user = userEvent.setup();
        render(<Calendar defaultMonth={august2026} />);
        await user.click(heading(/choose a month/i));
        await user.click(heading(/choose a year/i));

        const grid = screen.getByRole('grid');
        expect(rovingCell()).toHaveAttribute('aria-label', '2026');
        fireEvent.keyDown(grid, { key: 'ArrowUp' });
        expect(rovingCell()).toHaveAttribute('aria-label', '2022');

        fireEvent.keyDown(grid, { key: 'Enter' });
        expect(screen.getByRole('grid', { name: /select a month in 2022/i })).toBeInTheDocument();
      });

      it('re-pages the year grid when focus leaves the twelve-year page', async () => {
        const user = userEvent.setup();
        render(<Calendar defaultMonth={new Date(2016, 7, 1)} />);
        await user.click(heading(/choose a month/i));
        await user.click(heading(/choose a year/i));

        // 2016 opens the 2016-2027 page; one step left falls into the previous.
        fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowLeft' });
        expect(screen.getByRole('grid', { name: /2004 – 2015/i })).toBeInTheDocument();
        expect(rovingCell()).toHaveAttribute('aria-label', '2015');
      });
    });

    describe('range limits', () => {
      it('disables months entirely outside [min, max]', async () => {
        const user = userEvent.setup();
        const onMonthChange = vi.fn();
        render(
          <Calendar
            defaultMonth={august2026}
            min={new Date(2026, 5, 15)}
            max={new Date(2026, 8, 5)}
            onMonthChange={onMonthChange}
          />,
        );
        await user.click(heading(/choose a month/i));

        expect(screen.getByRole('button', { name: 'May 2026' })).toHaveAttribute(
          'aria-disabled',
          'true',
        );
        // June is only partly out of range, so it stays selectable.
        expect(screen.getByRole('button', { name: 'June 2026' })).not.toHaveAttribute(
          'aria-disabled',
        );

        fireEvent.click(screen.getByRole('button', { name: 'May 2026' }));
        expect(onMonthChange).not.toHaveBeenCalled();
      });

      it('disables years entirely outside [min, max]', async () => {
        const user = userEvent.setup();
        render(
          <Calendar
            defaultMonth={august2026}
            min={new Date(2025, 0, 1)}
            max={new Date(2027, 0, 1)}
          />,
        );
        await user.click(heading(/choose a month/i));
        await user.click(heading(/choose a year/i));

        expect(screen.getByRole('button', { name: '2024' })).toHaveAttribute(
          'aria-disabled',
          'true',
        );
        expect(screen.getByRole('button', { name: '2027' })).not.toHaveAttribute('aria-disabled');
      });
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

  it('addYears clamps a leap day onto the shorter target year', () => {
    expect(toISODateKey(addYears(new Date(2028, 1, 29), -1))).toBe('2027-02-28');
  });

  it('startOfYearPage aligns years onto fixed twelve-year pages', () => {
    expect(startOfYearPage(2026)).toBe(2016);
    expect(startOfYearPage(2016)).toBe(2016);
    expect(startOfYearPage(2015)).toBe(2004);
  });

  it('isMonthOutOfRange only rejects months with no selectable day', () => {
    const min = new Date(2026, 5, 15);
    // June still has 15-30 available; May has nothing.
    expect(isMonthOutOfRange(new Date(2026, 5, 1), min)).toBe(false);
    expect(isMonthOutOfRange(new Date(2026, 4, 31), min)).toBe(true);
  });

  it('isYearOutOfRange only rejects years with no selectable day', () => {
    const max = new Date(2026, 0, 1);
    expect(isYearOutOfRange(new Date(2026, 11, 31), undefined, max)).toBe(false);
    expect(isYearOutOfRange(new Date(2027, 0, 1), undefined, max)).toBe(true);
  });

  it('isoWeekNumber matches known ISO-8601 boundaries', () => {
    expect(isoWeekNumber(new Date(2026, 0, 1))).toBe(1); // 1 Jan 2026 (Thu) → W1
    expect(isoWeekNumber(new Date(2026, 7, 12))).toBe(33);
    // 1 Jan 2027 is a Friday → still ISO week 53 of 2026.
    expect(isoWeekNumber(new Date(2027, 0, 1))).toBe(53);
  });
});
