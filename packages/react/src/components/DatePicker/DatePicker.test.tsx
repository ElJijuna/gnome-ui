import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
});
