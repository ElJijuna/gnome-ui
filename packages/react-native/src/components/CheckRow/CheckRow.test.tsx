import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CheckRow } from './CheckRow';

describe('CheckRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', async () => {
      await render(<CheckRow title="Wi-Fi" subtitle="Home Network" />);

      expect(screen.getByText('Wi-Fi')).toBeOnTheScreen();
      expect(screen.getByText('Home Network')).toBeOnTheScreen();
    });

    it('exposes accessibilityRole="checkbox"', async () => {
      await render(<CheckRow title="Wi-Fi" testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityRole).toBe('checkbox');
    });

    it('renders leading content', async () => {
      await render(<CheckRow title="Bluetooth" leading={<Text testID="leading">B</Text>} />);

      expect(screen.getByTestId('leading')).toBeOnTheScreen();
    });

    it('combines title and subtitle into accessibilityLabel', async () => {
      await render(<CheckRow title="Wi-Fi" subtitle="Home Network" testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityLabel).toBe('Wi-Fi, Home Network');
    });

    it('uses just the title as accessibilityLabel when no subtitle', async () => {
      await render(<CheckRow title="Wi-Fi" testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityLabel).toBe('Wi-Fi');
    });
  });

  describe('checked state', () => {
    it('is unchecked by default', async () => {
      await render(<CheckRow title="Wi-Fi" testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityState.checked).toBe(false);
    });

    it('is checked when defaultChecked is true', async () => {
      await render(<CheckRow title="Wi-Fi" defaultChecked testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityState.checked).toBe(true);
    });

    it('reflects a controlled checked prop', async () => {
      await render(<CheckRow title="Wi-Fi" checked onCheckedChange={() => {}} testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityState.checked).toBe(true);
    });

    it('does not change on press when controlled', async () => {
      const onCheckedChange = jest.fn();

      await render(
        <CheckRow title="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} testID="row" />,
      );
      await fireEvent.press(screen.getByTestId('row'));

      expect(screen.getByTestId('row').props.accessibilityState.checked).toBe(false);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('interactions', () => {
    it('toggles checked state on press when uncontrolled', async () => {
      await render(<CheckRow title="Wi-Fi" testID="row" />);
      const row = screen.getByTestId('row');

      await fireEvent.press(row);
      expect(row.props.accessibilityState.checked).toBe(true);

      await fireEvent.press(row);
      expect(row.props.accessibilityState.checked).toBe(false);
    });

    it('calls onCheckedChange with the next value on press', async () => {
      const onCheckedChange = jest.fn();

      await render(<CheckRow title="Wi-Fi" onCheckedChange={onCheckedChange} testID="row" />);
      await fireEvent.press(screen.getByTestId('row'));

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const onCheckedChange = jest.fn();

      await render(
        <CheckRow title="Wi-Fi" disabled onCheckedChange={onCheckedChange} testID="row" />,
      );
      await fireEvent.press(screen.getByTestId('row'));

      expect(onCheckedChange).not.toHaveBeenCalled();
      expect(screen.getByTestId('row').props.accessibilityState.checked).toBe(false);
    });

    it('is disabled when disabled prop is set', async () => {
      await render(<CheckRow title="Wi-Fi" disabled testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityState.disabled).toBe(true);
    });
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null };
    await render(<CheckRow title="Wi-Fi" ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
