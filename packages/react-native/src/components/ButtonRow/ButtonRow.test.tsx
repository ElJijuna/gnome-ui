import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ButtonRow } from './ButtonRow';

describe('ButtonRow', () => {
  it('renders the title text', async () => {
    await render(<ButtonRow title="Sign out" />);

    expect(screen.getByText('Sign out')).toBeOnTheScreen();
  });

  it('exposes accessibilityRole="button"', async () => {
    await render(<ButtonRow title="Action" testID="row" />);

    expect(screen.getByTestId('row').props.accessibilityRole).toBe('button');
  });

  describe('leading and trailing slots', () => {
    it('renders leading content when provided', async () => {
      await render(<ButtonRow title="T" leading={<Text testID="lead">←</Text>} />);

      expect(screen.getByTestId('lead')).toBeOnTheScreen();
    });

    it('does not render leading slot when omitted', async () => {
      await render(<ButtonRow title="T" />);

      expect(screen.queryByTestId('lead')).not.toBeOnTheScreen();
    });

    it('renders trailing content when provided', async () => {
      await render(<ButtonRow title="T" trailing={<Text testID="trail">→</Text>} />);

      expect(screen.getByTestId('trail')).toBeOnTheScreen();
    });
  });

  describe('interaction', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();

      await render(<ButtonRow title="Action" onPress={onPress} />);
      await fireEvent.press(screen.getByText('Action'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is set', async () => {
      await render(<ButtonRow title="Action" disabled testID="row" />);

      expect(screen.getByTestId('row').props.accessibilityState.disabled).toBe(true);
    });

    it('does not call onPress when disabled', async () => {
      const onPress = jest.fn();

      await render(<ButtonRow title="Action" onPress={onPress} disabled />);
      await fireEvent.press(screen.getByText('Action'));

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  it('forwards a ref to the underlying view', async () => {
    const ref = { current: null };
    await render(<ButtonRow title="T" ref={ref} />);

    expect(ref.current).not.toBeNull();
  });
});
