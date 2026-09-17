import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { GnomeProvider } from '@/GnomeProvider';
import { DatePicker } from './DatePicker';

const wrap = (ui: ReactElement) => render(<GnomeProvider locale="en-US">{ui}</GnomeProvider>);

const AUG_15 = new Date(2026, 7, 15);

describe('DatePicker', () => {
  describe('trigger', () => {
    it('shows the placeholder when no date is selected', async () => {
      await wrap(<DatePicker accessibilityLabel="Date" placeholder="Pick a day" />);
      expect(screen.getByText('Pick a day')).toBeOnTheScreen();
    });

    it('shows the formatted selected date', async () => {
      await wrap(<DatePicker accessibilityLabel="Date" defaultValue={AUG_15} />);
      expect(screen.getByText(/Aug 15, 2026/)).toBeOnTheScreen();
    });

    it('associates a visible label with the trigger', async () => {
      await wrap(<DatePicker label="Start date" defaultValue={AUG_15} testID="dp" />);
      expect(screen.getByText('Start date')).toBeOnTheScreen();
      expect(screen.getByTestId('dp').props.accessibilityLabel).toBe('Start date');
    });
  });

  describe('opening', () => {
    it('opens the calendar popover on trigger press', async () => {
      await wrap(<DatePicker accessibilityLabel="Date" defaultValue={AUG_15} testID="dp" />);

      await fireEvent.press(screen.getByTestId('dp'));

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
      expect(screen.getByTestId('dp-calendar-grid')).toBeOnTheScreen();
    });

    it('does not open when disabled', async () => {
      await wrap(
        <DatePicker accessibilityLabel="Date" defaultValue={AUG_15} disabled testID="dp" />,
      );

      await fireEvent.press(screen.getByTestId('dp'));

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });
  });

  describe('selecting a date', () => {
    it('calls onChange, updates the trigger, and closes (uncontrolled)', async () => {
      const onChange = jest.fn();
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          defaultValue={AUG_15}
          onChange={onChange}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent.press(screen.getByTestId('dp-calendar-day-2026-08-20'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].getDate()).toBe(20);
      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
      expect(screen.getByText(/Aug 20, 2026/)).toBeOnTheScreen();
    });

    it('does not change its own trigger text when controlled', async () => {
      const onChange = jest.fn();
      await wrap(
        <DatePicker accessibilityLabel="Date" value={AUG_15} onChange={onChange} testID="dp" />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent.press(screen.getByTestId('dp-calendar-day-2026-08-20'));

      expect(onChange).toHaveBeenCalledTimes(1);
      // The popover still closes on its own (open state isn't tied to the
      // controlled value), but the trigger keeps showing the controlled date.
      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
      expect(screen.getByText(/Aug 15, 2026/)).toBeOnTheScreen();
    });
  });

  describe('min/max', () => {
    it('forwards min/max so out-of-range days are disabled in the panel', async () => {
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          defaultValue={AUG_15}
          min={new Date(2026, 7, 10)}
          max={new Date(2026, 7, 20)}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));

      expect(
        screen.getByTestId('dp-calendar-day-2026-08-08').props.accessibilityState.disabled,
      ).toBe(true);
      expect(
        screen.getByTestId('dp-calendar-day-2026-08-20').props.accessibilityState.disabled,
      ).toBe(false);
    });
  });

  describe('showWeekNumbers', () => {
    it('passes through to the panel Calendar', async () => {
      await wrap(
        <DatePicker accessibilityLabel="Date" defaultValue={AUG_15} showWeekNumbers testID="dp" />,
      );

      await fireEvent.press(screen.getByTestId('dp'));

      expect(screen.getByLabelText('Week')).toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('marks the trigger disabled', async () => {
      await wrap(<DatePicker accessibilityLabel="Date" disabled testID="dp" />);
      expect(screen.getByTestId('dp').props.accessibilityState.disabled).toBe(true);
    });
  });

  // `showTime` turns the civil date into a point in time: the calendar keeps
  // handing back local midnight, so the clock reading has to be carried
  // across every day tap, and the popover must wait for Done.
  describe('showTime', () => {
    it('shows the date and time in the trigger (24-hour default)', async () => {
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
        />,
      );
      expect(screen.getByText(/Aug 15, 2026.*09:30/)).toBeOnTheScreen();
    });

    it('reads the trigger on the same clock as the columns (12-hour)', async () => {
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          hourCycle={12}
          defaultValue={new Date(2026, 7, 15, 15, 30)}
        />,
      );
      expect(screen.getByText(/Aug 15, 2026.*3:30\s*PM/)).toBeOnTheScreen();
    });

    it('renders the time columns and a Done button', async () => {
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));

      expect(screen.getByLabelText('Hours').props.accessibilityValue.now).toBe(9);
      expect(screen.getByLabelText('Minutes').props.accessibilityValue.now).toBe(30);
      expect(screen.getByRole('button', { name: 'Done' })).toBeOnTheScreen();
    });

    it('keeps the popover open on a day tap and carries the time over', async () => {
      const onChange = jest.fn();
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          onChange={onChange}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent.press(screen.getByTestId('dp-calendar-day-2026-08-20'));

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(20);
      expect(picked.getHours()).toBe(9);
      expect(picked.getMinutes()).toBe(30);
    });

    it('commits immediately when a time column steps, keeping the popover open', async () => {
      const onChange = jest.fn();
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          onChange={onChange}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent(screen.getByLabelText('Hours'), 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(15);
      expect(picked.getHours()).toBe(10);
      expect(picked.getMinutes()).toBe(30);
    });

    it('attaches a time edited before any day to today', async () => {
      const onChange = jest.fn();
      await wrap(<DatePicker accessibilityLabel="Date" showTime onChange={onChange} testID="dp" />);

      await fireEvent.press(screen.getByTestId('dp'));
      // Nothing selected yet: the columns start from the neutral noon fallback.
      await fireEvent(screen.getByLabelText('Minutes'), 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });

      const today = new Date();
      const [[picked]] = onChange.mock.calls;
      expect(picked.getDate()).toBe(today.getDate());
      expect(picked.getHours()).toBe(12);
      expect(picked.getMinutes()).toBe(1);
    });

    it('closes on Done', async () => {
      await wrap(
        <DatePicker
          accessibilityLabel="Date"
          showTime
          defaultValue={new Date(2026, 7, 15, 9, 30)}
          testID="dp"
        />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent.press(screen.getByRole('button', { name: 'Done' }));

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });

    it('still closes on a day tap when showTime is off', async () => {
      await wrap(
        <DatePicker accessibilityLabel="Date" defaultValue={new Date(2026, 7, 15)} testID="dp" />,
      );

      await fireEvent.press(screen.getByTestId('dp'));
      await fireEvent.press(screen.getByTestId('dp-calendar-day-2026-08-20'));

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });
  });
});
