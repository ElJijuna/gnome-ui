import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePicker } from './DatePicker';

beforeEach(() => {
  // Popover and Calendar schedule positioning/focus with rAF; run it inline.
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

const AUG_15 = new Date(2026, 7, 15);
const trigger = () => screen.getByRole('button', { name: /date|fecha|delivery|appointment/i });

describe('DatePicker', () => {
  describe('trigger', () => {
    it('shows the placeholder when no date is selected', () => {
      render(<DatePicker aria-label="Date" placeholder="Pick a day" />);
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Pick a day');
    });

    it('shows the formatted selected date', () => {
      render(<DatePicker aria-label="Date" defaultValue={AUG_15} locale="en-US" />);
      // Default format is `dateStyle: 'medium'`.
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Aug 15, 2026');
    });

    it('honours a custom formatOptions', () => {
      render(
        <DatePicker
          aria-label="Date"
          defaultValue={AUG_15}
          locale="en-US"
          formatOptions={{ dateStyle: 'full' }}
        />,
      );
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent(
        'Saturday, August 15, 2026',
      );
    });

    it('associates a visible label with the trigger', () => {
      render(<DatePicker label="Start date" defaultValue={AUG_15} />);
      expect(screen.getByRole('button', { name: 'Start date' })).toBeInTheDocument();
    });

    it('marks the trigger as a dialog opener', () => {
      render(<DatePicker aria-label="Date" />);
      expect(screen.getByRole('button', { name: 'Date' })).toHaveAttribute(
        'aria-haspopup',
        'dialog',
      );
    });
  });

  describe('opening', () => {
    it('opens the calendar on trigger click', async () => {
      render(<DatePicker aria-label="Date" defaultValue={AUG_15} />);
      fireEvent.click(trigger());

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('grid', { name: /august 2026/i })).toBeInTheDocument();
    });

    it('opens the calendar on ArrowDown', async () => {
      render(<DatePicker aria-label="Date" defaultValue={AUG_15} />);
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' });

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('does not open when disabled', () => {
      render(<DatePicker aria-label="Date" defaultValue={AUG_15} disabled />);
      fireEvent.click(trigger());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('selecting a date', () => {
    it('calls onChange, updates the trigger, and closes (uncontrolled)', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker aria-label="Date" defaultValue={AUG_15} locale="en-US" onChange={onChange} />,
      );

      fireEvent.click(trigger());
      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'Thursday, August 20, 2026' }));

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0].getDate()).toBe(20);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Aug 20, 2026');
    });

    it('does not change its own trigger text when controlled', async () => {
      const onChange = vi.fn();
      render(<DatePicker aria-label="Date" value={AUG_15} locale="en-US" onChange={onChange} />);

      fireEvent.click(trigger());
      await screen.findByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'Thursday, August 20, 2026' }));

      expect(onChange).toHaveBeenCalledOnce();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      // Still shows the controlled value, not the clicked day.
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Aug 15, 2026');
    });
  });

  describe('range limits', () => {
    it('forwards min/max so out-of-range days are disabled', async () => {
      render(
        <DatePicker
          aria-label="Date"
          defaultValue={AUG_15}
          min={new Date(2026, 7, 10)}
          max={new Date(2026, 7, 20)}
        />,
      );

      fireEvent.click(trigger());
      await screen.findByRole('dialog');
      expect(screen.getByRole('button', { name: 'Saturday, August 8, 2026' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
  });

  // `showTime` turns the civil date into a point in time: the calendar keeps
  // handing back local midnight, so the clock reading has to be carried across
  // every day click, and the popover must wait for Done.
  describe('showTime', () => {
    it('shows the date and the time in the trigger', () => {
      render(
        <DatePicker
          aria-label="Date"
          showTime
          locale="en-US"
          defaultValue={new Date(2026, 7, 15, 9, 30)}
        />,
      );
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Aug 15, 2026, 09:30');
    });

    it('reads the trigger on the same clock as the columns', () => {
      render(
        <DatePicker
          aria-label="Date"
          showTime
          hourCycle={12}
          locale="en-US"
          defaultValue={new Date(2026, 7, 15, 15, 30)}
        />,
      );
      expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent(
        'Aug 15, 2026, 3:30 PM',
      );
    });

    it('renders the time columns and a Done button', async () => {
      const user = userEvent.setup();
      render(<DatePicker aria-label="Date" showTime defaultValue={new Date(2026, 7, 15, 9, 30)} />);

      await user.click(screen.getByRole('button', { name: 'Date' }));
      const panel = await screen.findByRole('dialog');

      expect(within(panel).getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute(
        'aria-valuenow',
        '9',
      );
      expect(within(panel).getByRole('spinbutton', { name: 'Minutes' })).toHaveAttribute(
        'aria-valuenow',
        '30',
      );
      expect(within(panel).getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    it('keeps the popover open on a day click and carries the time over', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          aria-label="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Date' }));
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: /^Thursday, August 20, 2026/ }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(20);
      expect(picked.getHours()).toBe(9);
      expect(picked.getMinutes()).toBe(30);
    });

    it('emits the same day at the new hour when a column steps', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DatePicker
          aria-label="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Date' }));
      await screen.findByRole('dialog');
      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Hours' }), { key: 'ArrowUp' });

      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(15);
      expect(picked.getHours()).toBe(10);
      expect(picked.getMinutes()).toBe(30);
    });

    it('attaches a time edited before any day to today', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker aria-label="Date" showTime onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'Date' }));
      await screen.findByRole('dialog');
      // Nothing selected yet: the columns start from the neutral noon fallback.
      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Minutes' }), { key: 'ArrowUp' });

      const today = new Date();
      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(today.getDate());
      expect(picked.getHours()).toBe(12);
      expect(picked.getMinutes()).toBe(1);
    });

    it('closes on Done', async () => {
      const user = userEvent.setup();
      render(<DatePicker aria-label="Date" showTime defaultValue={new Date(2026, 7, 15, 9, 30)} />);

      await user.click(screen.getByRole('button', { name: 'Date' }));
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Done' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('still closes on a day click when showTime is off', async () => {
      const user = userEvent.setup();
      render(<DatePicker aria-label="Date" defaultValue={new Date(2026, 7, 15)} />);

      await user.click(screen.getByRole('button', { name: 'Date' }));
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: /^Thursday, August 20, 2026/ }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });
});
