import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TimePicker } from './TimePicker';

beforeEach(() => {
  // Popover schedules positioning/focus with rAF; run it inline.
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

const trigger = () => screen.getByRole('button', { name: 'Time' });
const openPanel = () => {
  fireEvent.click(trigger());
  return screen.getByRole('dialog');
};

describe('TimePicker', () => {
  describe('trigger', () => {
    it('shows the placeholder when no time is selected', () => {
      render(<TimePicker aria-label="Time" placeholder="Pick a time" />);
      expect(trigger()).toHaveTextContent('Pick a time');
    });

    it('shows the formatted 24-hour value', () => {
      render(
        <TimePicker aria-label="Time" locale="en-US" defaultValue={{ hours: 14, minutes: 30 }} />,
      );
      expect(trigger()).toHaveTextContent('14:30');
    });

    it('shows the formatted 12-hour value with a period', () => {
      render(
        <TimePicker
          aria-label="Time"
          locale="en-US"
          hourCycle={12}
          defaultValue={{ hours: 14, minutes: 30 }}
        />,
      );
      expect(trigger()).toHaveTextContent('02:30 PM');
    });

    it('marks the trigger as a dialog opener', () => {
      render(<TimePicker aria-label="Time" />);
      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('panel', () => {
    it('opens hour and minute spinners on click (24-hour: no period)', () => {
      render(<TimePicker aria-label="Time" defaultValue={{ hours: 14, minutes: 30 }} />);
      const panel = openPanel();

      expect(within(panel).getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute(
        'aria-valuetext',
        '14',
      );
      expect(within(panel).getByRole('spinbutton', { name: 'Minutes' })).toHaveAttribute(
        'aria-valuetext',
        '30',
      );
      expect(within(panel).queryByRole('spinbutton', { name: 'AM/PM' })).not.toBeInTheDocument();
    });

    it('adds an AM/PM spinner in 12-hour mode', () => {
      render(
        <TimePicker aria-label="Time" hourCycle={12} defaultValue={{ hours: 14, minutes: 30 }} />,
      );
      const panel = openPanel();

      expect(within(panel).getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute(
        'aria-valuetext',
        '02',
      );
      expect(within(panel).getByRole('spinbutton', { name: 'AM/PM' })).toHaveAttribute(
        'aria-valuetext',
        'PM',
      );
    });

    it('does not open when disabled', () => {
      render(<TimePicker aria-label="Time" defaultValue={{ hours: 14, minutes: 30 }} disabled />);
      fireEvent.click(trigger());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('changing the time', () => {
    it('increments minutes with ArrowUp and updates the trigger', () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Time"
          locale="en-US"
          defaultValue={{ hours: 14, minutes: 30 }}
          onChange={onChange}
        />,
      );
      openPanel();

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Minutes' }), { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 31 });
      expect(trigger()).toHaveTextContent('14:31');
    });

    it('wraps minutes from 59 back to 00', () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Time"
          defaultValue={{ hours: 14, minutes: 59 }}
          onChange={onChange}
        />,
      );
      openPanel();

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Minutes' }), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 0 });
    });

    it('wraps hours from 23 back to 00', () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Time"
          defaultValue={{ hours: 23, minutes: 0 }}
          onChange={onChange}
        />,
      );
      openPanel();

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Hours' }), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith({ hours: 0, minutes: 0 });
    });

    it('toggling AM/PM shifts the hour by twelve', () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Time"
          hourCycle={12}
          defaultValue={{ hours: 9, minutes: 5 }}
          onChange={onChange}
        />,
      );
      openPanel();

      // 09:05 is AM (period 0); stepping the period selects PM → 21:05.
      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'AM/PM' }), { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith({ hours: 21, minutes: 5 });
    });

    it('does not change its own trigger text when controlled', () => {
      const onChange = vi.fn();
      render(
        <TimePicker
          aria-label="Time"
          locale="en-US"
          value={{ hours: 14, minutes: 30 }}
          onChange={onChange}
        />,
      );
      openPanel();

      fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Minutes' }), { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 31 });
      // Trigger still reflects the controlled value.
      expect(trigger()).toHaveTextContent('14:30');
    });
  });
});
