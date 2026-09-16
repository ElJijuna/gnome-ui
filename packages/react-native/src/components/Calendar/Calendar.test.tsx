import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { GnomeProvider } from '@/GnomeProvider';
import { Calendar } from './Calendar';

const wrap = (ui: ReactElement) => render(<GnomeProvider locale="en-US">{ui}</GnomeProvider>);

// 1 Jan 2024 was a Monday, so with the default weekStartsOn=1 the first
// week row starts exactly on the 1st — no leading December days to account
// for, which keeps testID/day-count math simple.
const JAN_2024 = new Date(2024, 0, 1);

describe('Calendar', () => {
  describe('rendering', () => {
    it('renders the day grid for the given month', async () => {
      await wrap(<Calendar month={JAN_2024} testID="cal" />);

      expect(screen.getByTestId('cal-grid')).toBeOnTheScreen();
      expect(screen.getByTestId('cal-day-2024-01-01')).toBeOnTheScreen();
      expect(screen.getByTestId('cal-day-2024-01-31')).toBeOnTheScreen();
    });

    it('shows the month/year heading by default', async () => {
      await wrap(<Calendar month={JAN_2024} />);
      expect(screen.getByText('January 2024')).toBeOnTheScreen();
    });

    it('hides the heading when showHeading is false', async () => {
      await wrap(<Calendar month={JAN_2024} showHeading={false} />);
      expect(screen.queryByText('January 2024')).not.toBeOnTheScreen();
    });

    it('shows abbreviated day names by default', async () => {
      await wrap(<Calendar month={JAN_2024} />);
      expect(screen.getByLabelText('Monday')).toBeOnTheScreen();
      expect(screen.getByLabelText('Sunday')).toBeOnTheScreen();
    });

    it('hides day names when showDayNames is false', async () => {
      await wrap(<Calendar month={JAN_2024} showDayNames={false} />);
      expect(screen.queryByLabelText('Monday')).not.toBeOnTheScreen();
    });

    it('marks every day cell with role="cell"', async () => {
      await wrap(<Calendar month={JAN_2024} testID="cal" />);
      expect(screen.getByTestId('cal-day-2024-01-15').props.role).toBe('cell');
    });
  });

  describe('selection', () => {
    it('is uncontrolled by default, selecting nothing', async () => {
      await wrap(<Calendar month={JAN_2024} testID="cal" />);
      const day = screen.getByTestId('cal-day-2024-01-10');
      expect(day.props.accessibilityState.selected).toBe(false);
    });

    it('selects a day when tapped and reports it via onChange', async () => {
      const onChange = jest.fn();
      await wrap(<Calendar month={JAN_2024} onChange={onChange} testID="cal" />);

      await fireEvent.press(screen.getByTestId('cal-day-2024-01-10'));

      expect(onChange).toHaveBeenCalledWith(new Date(2024, 0, 10));
      expect(screen.getByTestId('cal-day-2024-01-10').props.accessibilityState.selected).toBe(true);
    });

    it('respects an uncontrolled defaultValue', async () => {
      await wrap(<Calendar month={JAN_2024} defaultValue={new Date(2024, 0, 5)} testID="cal" />);
      expect(screen.getByTestId('cal-day-2024-01-05').props.accessibilityState.selected).toBe(true);
    });

    it('stays on the controlled value and does not self-update', async () => {
      const onChange = jest.fn();
      await wrap(
        <Calendar month={JAN_2024} value={new Date(2024, 0, 3)} onChange={onChange} testID="cal" />,
      );

      await fireEvent.press(screen.getByTestId('cal-day-2024-01-20'));

      expect(onChange).toHaveBeenCalledWith(new Date(2024, 0, 20));
      // The controlled value hasn't moved because the app didn't feed it back.
      expect(screen.getByTestId('cal-day-2024-01-03').props.accessibilityState.selected).toBe(true);
      expect(screen.getByTestId('cal-day-2024-01-20').props.accessibilityState.selected).toBe(
        false,
      );
    });

    it('treats value={null} as no selection', async () => {
      await wrap(<Calendar month={JAN_2024} value={null} testID="cal" />);
      expect(screen.getByTestId('cal-day-2024-01-10').props.accessibilityState.selected).toBe(
        false,
      );
    });
  });

  describe('min/max', () => {
    it('disables days before min', async () => {
      await wrap(<Calendar month={JAN_2024} min={new Date(2024, 0, 10)} testID="cal" />);
      expect(screen.getByTestId('cal-day-2024-01-05').props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId('cal-day-2024-01-10').props.accessibilityState.disabled).toBe(
        false,
      );
    });

    it('disables days after max', async () => {
      await wrap(<Calendar month={JAN_2024} max={new Date(2024, 0, 20)} testID="cal" />);
      expect(screen.getByTestId('cal-day-2024-01-25').props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId('cal-day-2024-01-20').props.accessibilityState.disabled).toBe(
        false,
      );
    });

    it('does not select a disabled day when pressed', async () => {
      const onChange = jest.fn();
      await wrap(
        <Calendar month={JAN_2024} max={new Date(2024, 0, 20)} onChange={onChange} testID="cal" />,
      );

      await fireEvent.press(screen.getByTestId('cal-day-2024-01-25'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('month navigation', () => {
    it('pages to the next month and reports it via onMonthChange', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} />);

      await fireEvent.press(screen.getByLabelText('Next month'));

      expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 1, 1));
      expect(screen.getByText('February 2024')).toBeOnTheScreen();
    });

    it('pages to the previous month', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} />);

      await fireEvent.press(screen.getByLabelText('Previous month'));

      expect(onMonthChange).toHaveBeenCalledWith(new Date(2023, 11, 1));
      expect(screen.getByText('December 2023')).toBeOnTheScreen();
    });

    it('stays on the controlled month and does not self-update', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar month={JAN_2024} onMonthChange={onMonthChange} />);

      await fireEvent.press(screen.getByLabelText('Next month'));

      expect(onMonthChange).toHaveBeenCalled();
      expect(screen.getByText('January 2024')).toBeOnTheScreen();
    });

    it('moves the display month when an outside day is tapped', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} testID="cal" />);

      // The trailing days from February shown on the January grid.
      await fireEvent.press(screen.getByTestId('cal-day-2024-02-01'));

      expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 1, 1));
    });
  });

  describe('view drill-down', () => {
    it('cycles days -> months -> years -> days when the heading is tapped', async () => {
      await wrap(<Calendar month={JAN_2024} />);

      await fireEvent.press(screen.getByText('January 2024'));
      expect(screen.getByText('2024')).toBeOnTheScreen();

      await fireEvent.press(screen.getByText('2024'));
      expect(screen.getByText('2016 – 2027')).toBeOnTheScreen();

      await fireEvent.press(screen.getByText('2016 – 2027'));
      expect(screen.getByText('January 2024')).toBeOnTheScreen();
    });

    it('selecting a month drops back to the day grid on that month', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} testID="cal" />);

      await fireEvent.press(screen.getByText('January 2024'));
      await fireEvent.press(screen.getByTestId('cal-month-4'));

      expect(onMonthChange).toHaveBeenCalledWith(new Date(2024, 4, 1));
      expect(screen.getByText('May 2024')).toBeOnTheScreen();
    });

    it('selecting a year drops back to the month grid for that year', async () => {
      const onMonthChange = jest.fn();
      await wrap(<Calendar defaultMonth={JAN_2024} onMonthChange={onMonthChange} testID="cal" />);

      await fireEvent.press(screen.getByText('January 2024'));
      await fireEvent.press(screen.getByText('2024'));
      await fireEvent.press(screen.getByTestId('cal-year-2020'));

      expect(onMonthChange).toHaveBeenCalledWith(new Date(2020, 0, 1));
      expect(screen.getByText('2020')).toBeOnTheScreen();
    });

    it('honors defaultView', async () => {
      await wrap(<Calendar month={JAN_2024} defaultView="months" />);
      expect(screen.getByText('2024')).toBeOnTheScreen();
    });

    it('renders a non-interactive heading when showViewSwitcher is false', async () => {
      await wrap(<Calendar month={JAN_2024} showViewSwitcher={false} />);

      expect(screen.getByText('January 2024')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: /January 2024/ })).toBeNull();
    });

    it('calls onViewChange when the view changes', async () => {
      const onViewChange = jest.fn();
      await wrap(<Calendar month={JAN_2024} onViewChange={onViewChange} />);

      await fireEvent.press(screen.getByText('January 2024'));

      expect(onViewChange).toHaveBeenCalledWith('months');
    });
  });

  describe('weekStartsOn', () => {
    it('defaults to Monday-first weeks', async () => {
      await wrap(<Calendar month={JAN_2024} testID="cal" />);
      // With Monday-first weeks and Jan 1 2024 landing on a Monday, the
      // first row starts exactly on the 1st (no December lead-in).
      expect(screen.queryByTestId('cal-day-2023-12-31')).toBeNull();
    });

    it('shows a Sunday-first week when weekStartsOn={0}', async () => {
      await wrap(<Calendar month={JAN_2024} weekStartsOn={0} testID="cal" />);
      // Jan 1 2024 is a Monday, so a Sunday-first grid leads with Dec 31.
      expect(screen.getByTestId('cal-day-2023-12-31')).toBeOnTheScreen();
    });
  });

  describe('showWeekNumbers', () => {
    it('is off by default', async () => {
      await wrap(<Calendar month={JAN_2024} />);
      expect(screen.queryByLabelText('Week')).toBeNull();
    });

    it('adds an ISO week-number column when enabled', async () => {
      await wrap(<Calendar month={JAN_2024} showWeekNumbers />);
      expect(screen.getByLabelText('Week')).toBeOnTheScreen();
      // The week starting Mon 1 Jan 2024 is ISO week 1.
      expect(screen.getByLabelText('Week 1')).toBeOnTheScreen();
    });
  });

  describe('prop forwarding', () => {
    it('forwards testID to the root container', async () => {
      await wrap(<Calendar month={JAN_2024} testID="my-calendar" />);
      expect(screen.getByTestId('my-calendar')).toBeOnTheScreen();
    });
  });
});
