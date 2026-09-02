import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Switch } from './Switch';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('Switch', () => {
  describe('rendering', () => {
    it('renders with the switch accessibility role', async () => {
      await renderWithProvider(<Switch value={false} />);
      expect(screen.getByRole('switch')).toBeOnTheScreen();
    });

    it('reflects the checked state via accessibilityState', async () => {
      await renderWithProvider(<Switch value />);
      expect(screen.getByRole('switch').props.accessibilityState).toMatchObject({
        checked: true,
      });
    });

    it('reflects the unchecked state via accessibilityState', async () => {
      await renderWithProvider(<Switch value={false} />);
      expect(screen.getByRole('switch').props.accessibilityState).toMatchObject({
        checked: false,
      });
    });
  });

  describe('interactions', () => {
    it('calls onValueChange with true when pressed while off', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Switch value={false} onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByRole('switch'));

      expect(onValueChange).toHaveBeenCalledWith(true);
    });

    it('calls onValueChange with false when pressed while on', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Switch value onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByRole('switch'));

      expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it('does not throw when onValueChange is omitted', async () => {
      await renderWithProvider(<Switch value={false} />);
      await expect(fireEvent.press(screen.getByRole('switch'))).resolves.not.toThrow();
    });

    it('does not call onValueChange when disabled', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Switch value={false} onValueChange={onValueChange} disabled />);
      await fireEvent.press(screen.getByRole('switch'));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('sets disabled via accessibilityState', async () => {
      await renderWithProvider(<Switch value={false} disabled />);
      expect(screen.getByRole('switch').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('dims the pressable when disabled', async () => {
      await renderWithProvider(<Switch value={false} disabled />);
      expect(screen.getByRole('switch')).toHaveStyle({ opacity: 0.5 });
    });

    it('does not dim the pressable when enabled', async () => {
      await renderWithProvider(<Switch value={false} />);
      expect(screen.getByRole('switch')).toHaveStyle({ opacity: 1 });
    });
  });

  describe('prop forwarding', () => {
    it('forwards accessibilityLabel', async () => {
      await renderWithProvider(<Switch value={false} accessibilityLabel="Wi-Fi" />);
      expect(screen.getByLabelText('Wi-Fi')).toBeOnTheScreen();
    });

    it('merges a custom style over the pressable', async () => {
      await renderWithProvider(<Switch value={false} style={{ marginTop: 8 }} />);
      expect(screen.getByRole('switch')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await renderWithProvider(<Switch value={false} testID="wifi-switch" />);
      expect(screen.getByTestId('wifi-switch')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying Pressable', async () => {
      const ref = createRef<View>();

      await renderWithProvider(<Switch value={false} ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});
