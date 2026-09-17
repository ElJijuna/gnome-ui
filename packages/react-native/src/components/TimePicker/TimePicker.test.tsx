import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { GnomeProvider } from '@/GnomeProvider';
import { TimePicker } from './TimePicker';

const wrap = (ui: ReactElement) => render(<GnomeProvider locale="en-US">{ui}</GnomeProvider>);

describe('TimePicker', () => {
  describe('trigger', () => {
    it('shows the placeholder when no time is selected', async () => {
      await wrap(<TimePicker accessibilityLabel="Time" placeholder="Pick a time" />);
      expect(screen.getByText('Pick a time')).toBeOnTheScreen();
    });

    it('shows the formatted 24-hour value', async () => {
      await wrap(
        <TimePicker accessibilityLabel="Time" defaultValue={{ hours: 14, minutes: 30 }} />,
      );
      expect(screen.getByText('14:30')).toBeOnTheScreen();
    });

    it('shows the formatted 12-hour value with a period', async () => {
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          hourCycle={12}
          defaultValue={{ hours: 14, minutes: 30 }}
        />,
      );
      expect(screen.getByText(/2:30\s*PM/)).toBeOnTheScreen();
    });

    it('associates a visible label with the trigger', async () => {
      await wrap(
        <TimePicker label="Start time" defaultValue={{ hours: 9, minutes: 0 }} testID="tp" />,
      );
      expect(screen.getByText('Start time')).toBeOnTheScreen();
      expect(screen.getByTestId('tp').props.accessibilityLabel).toBe('Start time');
    });
  });

  describe('opening', () => {
    it('opens the panel on trigger press', async () => {
      await wrap(<TimePicker accessibilityLabel="Time" testID="tp" />);

      await fireEvent.press(screen.getByTestId('tp'));

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
      expect(screen.getByLabelText('Hours')).toBeOnTheScreen();
      expect(screen.getByLabelText('Minutes')).toBeOnTheScreen();
    });

    it('does not open when disabled', async () => {
      await wrap(<TimePicker accessibilityLabel="Time" disabled testID="tp" />);

      await fireEvent.press(screen.getByTestId('tp'));

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });
  });

  describe('panel', () => {
    it('shows no AM/PM column in 24-hour mode (default)', async () => {
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          defaultValue={{ hours: 14, minutes: 30 }}
          testID="tp"
        />,
      );

      await fireEvent.press(screen.getByTestId('tp'));

      expect(screen.getByLabelText('Hours').props.accessibilityValue.now).toBe(14);
      expect(screen.getByLabelText('Minutes').props.accessibilityValue.now).toBe(30);
      expect(screen.queryByLabelText('AM/PM')).not.toBeOnTheScreen();
    });

    it('adds an AM/PM column in 12-hour mode', async () => {
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          hourCycle={12}
          defaultValue={{ hours: 14, minutes: 30 }}
          testID="tp"
        />,
      );

      await fireEvent.press(screen.getByTestId('tp'));

      expect(screen.getByLabelText('Hours').props.accessibilityValue.now).toBe(2);
      expect(screen.getByLabelText('AM/PM').props.accessibilityValue.now).toBe(1);
    });

    it('starts from a noon fallback when nothing is selected yet', async () => {
      await wrap(<TimePicker accessibilityLabel="Time" testID="tp" />);

      await fireEvent.press(screen.getByTestId('tp'));

      expect(screen.getByLabelText('Hours').props.accessibilityValue.now).toBe(12);
      expect(screen.getByLabelText('Minutes').props.accessibilityValue.now).toBe(0);
    });
  });

  describe('selecting a time', () => {
    it('calls onChange and updates the trigger live (uncontrolled)', async () => {
      const onChange = jest.fn();
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          defaultValue={{ hours: 14, minutes: 30 }}
          onChange={onChange}
          testID="tp"
        />,
      );

      await fireEvent.press(screen.getByTestId('tp'));
      await fireEvent(screen.getByLabelText('Minutes'), 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });

      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 31 });
      expect(screen.getByText('14:31')).toBeOnTheScreen();
      // Committing live doesn't close the popover — there's no Done button.
      expect(screen.getByRole('dialog')).toBeOnTheScreen();
    });

    it('does not change its own trigger text when controlled', async () => {
      const onChange = jest.fn();
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          value={{ hours: 14, minutes: 30 }}
          onChange={onChange}
          testID="tp"
        />,
      );

      await fireEvent.press(screen.getByTestId('tp'));
      await fireEvent(screen.getByLabelText('Minutes'), 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });

      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 31 });
      expect(screen.getByText('14:30')).toBeOnTheScreen();
    });

    it('rolls minutes over to the next hour on wrap', async () => {
      const onChange = jest.fn();
      await wrap(
        <TimePicker
          accessibilityLabel="Time"
          defaultValue={{ hours: 14, minutes: 59 }}
          onChange={onChange}
          testID="tp"
        />,
      );

      await fireEvent.press(screen.getByTestId('tp'));
      await fireEvent(screen.getByLabelText('Minutes'), 'accessibilityAction', {
        nativeEvent: { actionName: 'increment' },
      });

      // `SpinButton`'s own `wrap` rolls the minute column back to 0 without
      // touching the hour column — this component doesn't carry the rollover.
      expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 0 });
    });
  });

  describe('disabled', () => {
    it('marks the trigger disabled', async () => {
      await wrap(<TimePicker accessibilityLabel="Time" disabled testID="tp" />);
      expect(screen.getByTestId('tp').props.accessibilityState.disabled).toBe(true);
    });
  });
});
