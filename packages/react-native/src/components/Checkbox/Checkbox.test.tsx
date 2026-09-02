import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Checkbox } from './Checkbox';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders with the checkbox accessibility role', async () => {
      await renderWithProvider(<Checkbox value={false} />);
      expect(screen.getByRole('checkbox')).toBeOnTheScreen();
    });

    it('reflects the checked state via accessibilityState', async () => {
      await renderWithProvider(<Checkbox value />);
      expect(screen.getByRole('checkbox').props.accessibilityState).toMatchObject({
        checked: true,
      });
    });

    it('reflects the unchecked state via accessibilityState', async () => {
      await renderWithProvider(<Checkbox value={false} />);
      expect(screen.getByRole('checkbox').props.accessibilityState).toMatchObject({
        checked: false,
      });
    });

    it('reflects the mixed state via accessibilityState when indeterminate', async () => {
      await renderWithProvider(<Checkbox value={false} indeterminate />);
      expect(screen.getByRole('checkbox').props.accessibilityState).toMatchObject({
        checked: 'mixed',
      });
    });

    it('reflects mixed even when value is true, since indeterminate takes precedence', async () => {
      await renderWithProvider(<Checkbox value indeterminate />);
      expect(screen.getByRole('checkbox').props.accessibilityState).toMatchObject({
        checked: 'mixed',
      });
    });
  });

  describe('marks', () => {
    it('shows the checkmark glyph when checked', async () => {
      await renderWithProvider(<Checkbox value />);
      expect(screen.getByText('✓')).toBeOnTheScreen();
    });

    it('does not show the checkmark glyph when indeterminate', async () => {
      await renderWithProvider(<Checkbox value indeterminate />);
      expect(screen.queryByText('✓')).toBeNull();
    });

    it('still renders the checkmark node when unchecked, just faded out', async () => {
      await renderWithProvider(<Checkbox value={false} />);
      expect(screen.getByText('✓')).toHaveStyle({ opacity: 0 });
    });

    it('renders the checkmark at full opacity when checked', async () => {
      await renderWithProvider(<Checkbox value />);
      expect(screen.getByText('✓')).toHaveStyle({ opacity: 1 });
    });
  });

  describe('interactions', () => {
    it('calls onValueChange with true when pressed while unchecked', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Checkbox value={false} onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByRole('checkbox'));

      expect(onValueChange).toHaveBeenCalledWith(true);
    });

    it('calls onValueChange with false when pressed while checked', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Checkbox value onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByRole('checkbox'));

      expect(onValueChange).toHaveBeenCalledWith(false);
    });

    it('does not call onValueChange when disabled', async () => {
      const onValueChange = jest.fn();

      await renderWithProvider(<Checkbox value={false} onValueChange={onValueChange} disabled />);
      await fireEvent.press(screen.getByRole('checkbox'));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('sets disabled via accessibilityState', async () => {
      await renderWithProvider(<Checkbox value={false} disabled />);
      expect(screen.getByRole('checkbox').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('dims the pressable when disabled', async () => {
      await renderWithProvider(<Checkbox value={false} disabled />);
      expect(screen.getByRole('checkbox')).toHaveStyle({ opacity: 0.5 });
    });
  });

  describe('prop forwarding', () => {
    it('forwards accessibilityLabel', async () => {
      await renderWithProvider(<Checkbox value={false} accessibilityLabel="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeOnTheScreen();
    });

    it('merges a custom style over the pressable', async () => {
      await renderWithProvider(<Checkbox value={false} style={{ marginTop: 8 }} />);
      expect(screen.getByRole('checkbox')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await renderWithProvider(<Checkbox value={false} testID="terms-checkbox" />);
      expect(screen.getByTestId('terms-checkbox')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying Pressable', async () => {
      const ref = createRef<View>();

      await renderWithProvider(<Checkbox value={false} ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});
