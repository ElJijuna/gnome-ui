import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toISODateKey } from '@/components/Calendar/calendarUtils';

import { DateRangePicker } from './DateRangePicker';

beforeEach(() => {
  // Popover and CalendarRange schedule positioning/focus with rAF; run it inline.
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

const AUGUST = { start: new Date(2026, 7, 10), end: new Date(2026, 7, 19) };
const trigger = () => screen.getByRole('button', { name: 'Stay' });
const day = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

describe('DateRangePicker', () => {
  describe('trigger', () => {
    it('shows the placeholder while no range is selected', () => {
      render(<DateRangePicker aria-label="Stay" placeholder="Pick your dates" />);
      expect(trigger()).toHaveTextContent('Pick your dates');
    });

    it('reads out both ends of the selected range', () => {
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} locale="en-US" />);
      expect(trigger()).toHaveTextContent('Aug 10, 2026 – Aug 19, 2026');
    });

    it('keeps showing the placeholder for a half-filled value', () => {
      render(
        <DateRangePicker
          aria-label="Stay"
          value={{ start: new Date(2026, 7, 10), end: null }}
          placeholder="Pick your dates"
        />,
      );
      expect(trigger()).toHaveTextContent('Pick your dates');
    });

    it('honours a custom separator and formatOptions', () => {
      render(
        <DateRangePicker
          aria-label="Stay"
          defaultValue={AUGUST}
          locale="en-US"
          separator="to"
          formatOptions={{ month: 'short', day: 'numeric' }}
        />,
      );
      expect(trigger()).toHaveTextContent('Aug 10 to Aug 19');
    });

    it('associates a visible label with the trigger', () => {
      render(<DateRangePicker label="Stay" defaultValue={AUGUST} />);
      expect(screen.getByRole('button', { name: 'Stay' })).toBeInTheDocument();
    });

    it('marks the trigger as a dialog opener', () => {
      render(<DateRangePicker aria-label="Stay" />);
      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('opening', () => {
    it('opens two month panels on trigger click', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} />);

      await user.click(trigger());

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getAllByRole('grid')).toHaveLength(2);
      expect(within(dialog).getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
      expect(within(dialog).getByRole('grid', { name: /september 2026/i })).toBeInTheDocument();
    });

    it('opens on ArrowDown from the trigger', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} />);

      trigger().focus();
      await user.keyboard('{ArrowDown}');

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('does not open while disabled', () => {
      render(<DateRangePicker aria-label="Stay" disabled />);

      expect(trigger()).toBeDisabled();
      // Bypass the pointer-events:none guard to prove the trigger itself refuses.
      fireEvent.click(trigger());

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('honours visibleMonths', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} visibleMonths={1} />);

      await user.click(trigger());

      expect(within(await screen.findByRole('dialog')).getAllByRole('grid')).toHaveLength(1);
    });
  });

  describe('selecting', () => {
    it('stays open through the first click and closes on the second', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} onChange={onChange} />);

      await user.click(trigger());
      await screen.findByRole('dialog');

      await user.click(day('Tuesday, August 4, 2026'));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(day('Friday, August 7, 2026'));

      expect(onChange).toHaveBeenCalledOnce();
      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-04');
      expect(toISODateKey(range.end)).toBe('2026-08-07');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('updates the trigger with the new range', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} locale="en-US" />);

      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(day('Tuesday, August 4, 2026'));
      await user.click(day('Friday, August 7, 2026'));

      await waitFor(() => expect(trigger()).toHaveTextContent('Aug 4, 2026 – Aug 7, 2026'));
    });

    it('does not update its own value when controlled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker aria-label="Stay" value={AUGUST} locale="en-US" onChange={onChange} />,
      );

      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(day('Tuesday, August 4, 2026'));
      await user.click(day('Friday, August 7, 2026'));

      expect(onChange).toHaveBeenCalledOnce();
      await waitFor(() => expect(trigger()).toHaveTextContent('Aug 10, 2026 – Aug 19, 2026'));
    });
  });

  describe('presets', () => {
    const presets = [
      { label: 'First week', range: { start: new Date(2026, 7, 1), end: new Date(2026, 7, 7) } },
      {
        label: 'Computed week',
        range: () => ({ start: new Date(2026, 7, 8), end: new Date(2026, 7, 14) }),
      },
    ];

    it('renders no shortcut group without presets', async () => {
      const user = userEvent.setup();
      render(<DateRangePicker aria-label="Stay" defaultValue={AUGUST} />);

      await user.click(trigger());

      expect(
        within(await screen.findByRole('dialog')).queryByRole('group', {
          name: 'Range shortcuts',
        }),
      ).not.toBeInTheDocument();
    });

    it('applies a preset and closes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker
          aria-label="Stay"
          defaultValue={AUGUST}
          locale="en-US"
          presets={presets}
          onChange={onChange}
        />,
      );

      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'First week' }));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-01');
      expect(toISODateKey(range.end)).toBe('2026-08-07');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(trigger()).toHaveTextContent('Aug 1, 2026 – Aug 7, 2026');
    });

    it('computes a function preset at click time', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateRangePicker
          aria-label="Stay"
          defaultValue={AUGUST}
          presets={presets}
          onChange={onChange}
        />,
      );

      await user.click(trigger());
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Computed week' }));

      const [[range]] = onChange.mock.calls;
      expect(toISODateKey(range.start)).toBe('2026-08-08');
      expect(toISODateKey(range.end)).toBe('2026-08-14');
    });
  });

  describe('range limits', () => {
    it('passes min, max and the length limits down to the calendar', async () => {
      const user = userEvent.setup();
      render(
        <DateRangePicker
          aria-label="Stay"
          defaultValue={AUGUST}
          min={new Date(2026, 7, 3)}
          maxRange={4}
        />,
      );

      await user.click(trigger());
      await screen.findByRole('dialog');

      expect(day('Saturday, August 1, 2026')).toHaveAttribute('aria-disabled', 'true');

      await user.click(day('Tuesday, August 4, 2026'));
      // maxRange caps the candidate range at four days.
      expect(day('Saturday, August 8, 2026')).toHaveAttribute('aria-disabled', 'true');
      expect(day('Friday, August 7, 2026')).not.toHaveAttribute('aria-disabled');
    });
  });
});
