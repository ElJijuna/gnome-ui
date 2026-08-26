import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toISODateKey } from '@/components/Calendar/calendarUtils';

import { CalendarRange } from './CalendarRange';
import { isRangeAllowed, isWithinRange, orderRange, rangeLength } from './rangeUtils';

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
const day = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}`) });
const cellOf = (label: string) => day(label).closest('[role="gridcell"]') as HTMLElement;

describe('CalendarRange', () => {
  describe('selection', () => {
    it('emits only once both ends have a value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} onChange={onChange} />);

      await user.click(day('Monday, August 10, 2026'));
      expect(onChange).not.toHaveBeenCalled();

      await user.click(day('Friday, August 14, 2026'));
      expect(onChange).toHaveBeenCalledOnce();
      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-14');
    });

    it('reports the anchor separately through onRangeStart', async () => {
      const user = userEvent.setup();
      const onRangeStart = vi.fn();
      render(<CalendarRange defaultMonth={august2026} onRangeStart={onRangeStart} />);

      await user.click(day('Monday, August 10, 2026'));

      expect(onRangeStart).toHaveBeenCalledOnce();
      const [[anchor]] = onRangeStart.mock.calls;
      expect(toISODateKey(anchor)).toBe('2026-08-10');
    });

    it('orders a range picked backwards', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} onChange={onChange} />);

      await user.click(day('Friday, August 14, 2026'));
      await user.click(day('Monday, August 10, 2026'));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-14');
    });

    it('accepts a single-day range', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} onChange={onChange} />);

      await user.click(day('Monday, August 10, 2026'));
      await user.click(day('Monday, August 10, 2026'));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-10');
      expect(toISODateKey(range.end)).toBe('2026-08-10');
    });

    it('marks both ends and every day between them', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      await user.click(day('Friday, August 14, 2026'));

      expect(cellOf('Monday, August 10, 2026')).toHaveAttribute('data-range-start');
      expect(cellOf('Friday, August 14, 2026')).toHaveAttribute('data-range-end');
      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('data-in-range');
      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('aria-selected', 'true');
      // A committed range is not a preview.
      expect(cellOf('Wednesday, August 12, 2026')).not.toHaveAttribute('data-preview');
      // Outside the range nothing is marked.
      expect(cellOf('Saturday, August 15, 2026')).not.toHaveAttribute('data-in-range');
    });

    it('names the ends and the days inside for screen readers', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      await user.click(day('Friday, August 14, 2026'));

      expect(
        screen.getByRole('button', { name: 'Monday, August 10, 2026, start of range' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Friday, August 14, 2026, end of range' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Wednesday, August 12, 2026, in selected range' }),
      ).toBeInTheDocument();
    });

    it('announces the half-made and finished range', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      expect(screen.getByRole('status')).toHaveTextContent(
        /Start date August 10, 2026 selected\. Choose an end date\./,
      );

      await user.click(day('Friday, August 14, 2026'));
      expect(screen.getByRole('status')).toHaveTextContent(
        /Range August 10, 2026 to August 14, 2026 selected\./,
      );
    });

    it('does not update its own value when controlled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CalendarRange
          month={august2026}
          value={{ start: new Date(2026, 7, 3), end: new Date(2026, 7, 5) }}
          onChange={onChange}
        />,
      );

      await user.click(day('Monday, August 10, 2026'));
      await user.click(day('Friday, August 14, 2026'));

      expect(onChange).toHaveBeenCalledOnce();
      // Still painting the controlled range, not the clicked one.
      expect(cellOf('Monday, August 3, 2026')).toHaveAttribute('data-range-start');
      expect(cellOf('Monday, August 10, 2026')).not.toHaveAttribute('data-range-start');
    });

    it('paints a partially filled controlled range', () => {
      render(
        <CalendarRange month={august2026} value={{ start: new Date(2026, 7, 3), end: null }} />,
      );

      const start = cellOf('Monday, August 3, 2026');
      expect(start).toHaveAttribute('data-range-start');
      expect(start).toHaveAttribute('data-range-end');
    });
  });

  describe('preview', () => {
    it('paints the band up to the hovered day while anchoring', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      await user.hover(day('Friday, August 14, 2026'));

      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('data-in-range');
      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('data-preview');
      // The anchor is a real end; the hovered day is still tentative.
      expect(day('Monday, August 10, 2026')).toHaveAttribute('data-selected');
      expect(day('Friday, August 14, 2026')).not.toHaveAttribute('data-selected');
    });

    it('ignores hover before the first click', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.hover(day('Friday, August 14, 2026'));

      expect(cellOf('Friday, August 14, 2026')).not.toHaveAttribute('data-range-start');
      expect(cellOf('Wednesday, August 12, 2026')).not.toHaveAttribute('data-in-range');
    });

    it('collapses the band when the pointer leaves the grid', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      await user.hover(day('Friday, August 14, 2026'));
      await user.unhover(day('Friday, August 14, 2026'));

      expect(cellOf('Wednesday, August 12, 2026')).not.toHaveAttribute('data-in-range');
    });

    it('follows the roving focus so the keyboard previews too', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} />);

      await user.click(day('Monday, August 10, 2026'));
      const [grid] = screen.getAllByRole('grid');
      fireEvent.keyDown(grid, { key: 'ArrowRight' });
      fireEvent.keyDown(grid, { key: 'ArrowRight' });

      expect(cellOf('Tuesday, August 11, 2026')).toHaveAttribute('data-in-range');
      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('data-range-end');
      expect(cellOf('Wednesday, August 12, 2026')).toHaveAttribute('data-preview');
    });

    it('commits the previewed range with Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} onChange={onChange} />);

      await user.click(day('Monday, August 10, 2026'));
      const [grid] = screen.getAllByRole('grid');
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      fireEvent.keyDown(grid, { key: 'Enter' });

      const [[committed]] = onChange.mock.calls;
      expect(toISODateKey(committed.end)).toBe('2026-08-17');
    });

    it('Escape cancels a half-made range without reaching an enclosing popover', async () => {
      const user = userEvent.setup();
      const onEscape = vi.fn();
      render(
        <div onKeyDown={onEscape}>
          <CalendarRange defaultMonth={august2026} />
        </div>,
      );

      await user.click(day('Monday, August 10, 2026'));
      await user.hover(day('Friday, August 14, 2026'));
      fireEvent.keyDown(screen.getAllByRole('grid')[0], { key: 'Escape' });

      expect(cellOf('Wednesday, August 12, 2026')).not.toHaveAttribute('data-in-range');
      expect(cellOf('Monday, August 10, 2026')).not.toHaveAttribute('data-range-start');
      expect(onEscape).not.toHaveBeenCalled();
    });

    it('lets Escape through once there is nothing to cancel', () => {
      const onEscape = vi.fn();
      render(
        <div onKeyDown={onEscape}>
          <CalendarRange defaultMonth={august2026} />
        </div>,
      );

      fireEvent.keyDown(screen.getAllByRole('grid')[0], { key: 'Escape' });
      expect(onEscape).toHaveBeenCalledOnce();
    });
  });

  describe('range limits', () => {
    it('disables days that would break maxRange while anchoring', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} maxRange={3} onChange={onChange} />);

      // Nothing is limited before the first click.
      expect(day('Friday, August 14, 2026')).not.toHaveAttribute('aria-disabled');

      await user.click(day('Monday, August 10, 2026'));
      expect(day('Wednesday, August 12, 2026')).not.toHaveAttribute('aria-disabled');
      expect(day('Thursday, August 13, 2026')).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(day('Thursday, August 13, 2026'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables days that would break minRange while anchoring', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} minRange={3} />);

      await user.click(day('Monday, August 10, 2026'));

      expect(day('Tuesday, August 11, 2026')).toHaveAttribute('aria-disabled', 'true');
      expect(day('Wednesday, August 12, 2026')).not.toHaveAttribute('aria-disabled');
    });

    it('still honours min and max', () => {
      render(
        <CalendarRange
          defaultMonth={august2026}
          min={new Date(2026, 7, 10)}
          max={new Date(2026, 7, 20)}
        />,
      );

      expect(day('Saturday, August 8, 2026')).toHaveAttribute('aria-disabled', 'true');
      expect(day('Monday, August 10, 2026')).not.toHaveAttribute('aria-disabled');
      expect(day('Sunday, August 30, 2026')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('multiple month panels', () => {
    it('renders one grid per visible month, paged as one unit', async () => {
      const user = userEvent.setup();
      render(<CalendarRange defaultMonth={august2026} visibleMonths={2} />);

      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
      expect(screen.getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
      expect(screen.getAllByRole('grid')).toHaveLength(2);

      await user.click(screen.getByRole('button', { name: 'Next month' }));
      expect(screen.getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
      expect(screen.getByRole('grid', { name: /october 2026/i })).toBeInTheDocument();
    });

    it('names the span of months in the heading', () => {
      render(<CalendarRange defaultMonth={august2026} visibleMonths={2} />);
      expect(
        screen.getByRole('button', { name: /^August – September 2026, choose a month$/ }),
      ).toBeInTheDocument();
    });

    it('keeps exactly one tabbable day across all panels', () => {
      const { container } = render(<CalendarRange defaultMonth={august2026} visibleMonths={3} />);
      expect(container.querySelectorAll('button[tabindex="0"][data-date]')).toHaveLength(1);
    });

    it('selects a range spanning two panels without navigating', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<CalendarRange defaultMonth={august2026} visibleMonths={2} onChange={onChange} />);

      await user.click(day('Thursday, August 27, 2026'));
      // 3 September shows twice: as a trailing day of August and as its own
      // cell on the second panel. Click the one the September panel owns.
      const septemberThird = screen.getAllByRole('button', {
        name: /^Thursday, September 3, 2026/,
      });
      expect(septemberThird).toHaveLength(2);
      await user.click(septemberThird[1]);

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-27');
      expect(toISODateKey(range.end)).toBe('2026-09-03');
    });

    it('pages the window when the keyboard walks off the last panel', () => {
      render(<CalendarRange defaultMonth={august2026} visibleMonths={2} />);

      const [grid] = screen.getAllByRole('grid');
      // Today (12 Aug) is the roving cell; walk it forward month by month.
      fireEvent.keyDown(grid, { key: 'PageDown' }); // 12 Sep, still in view
      expect(screen.getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();

      fireEvent.keyDown(grid, { key: 'PageDown' }); // 12 Oct, off the last panel
      expect(screen.getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
      expect(screen.getByRole('grid', { name: /october 2026/i })).toBeInTheDocument();
      expect(screen.queryByRole('grid', { name: /august 2026/i })).not.toBeInTheDocument();
    });
  });

  describe('drill-down', () => {
    it('marks the months and years holding the range', async () => {
      const user = userEvent.setup();
      render(
        <CalendarRange
          defaultMonth={august2026}
          defaultValue={{ start: new Date(2026, 7, 10), end: new Date(2026, 9, 2) }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /choose a month/i }));
      expect(screen.getByRole('button', { name: 'August 2026' })).toHaveAttribute('data-selected');
      expect(screen.getByRole('button', { name: 'October 2026' })).toHaveAttribute('data-selected');
      expect(screen.getByRole('button', { name: 'March 2026' })).not.toHaveAttribute(
        'data-selected',
      );

      await user.click(screen.getByRole('button', { name: /choose a year/i }));
      expect(screen.getByRole('button', { name: '2026' })).toHaveAttribute('data-selected');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root', () => {
      const { container } = render(<CalendarRange defaultMonth={august2026} className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
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
