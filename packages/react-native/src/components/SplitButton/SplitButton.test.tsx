import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { SplitButton } from './SplitButton';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

const primary = (name = 'Save') => screen.getByRole('button', { name });
const toggle = (name = 'More options') => screen.getByRole('button', { name });

describe('SplitButton', () => {
  it('renders the label', async () => {
    await wrap(<SplitButton label="Save" dropdownContent={<RNText>Save as…</RNText>} />);

    expect(screen.getByText('Save')).toBeOnTheScreen();
  });

  it('fires onPress when the primary half is pressed', async () => {
    const onPress = jest.fn();

    await wrap(
      <SplitButton label="Save" onPress={onPress} dropdownContent={<RNText>Save as…</RNText>} />,
    );

    await fireEvent.press(primary());

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  describe('dropdown', () => {
    it('does not show the panel before the arrow is pressed', async () => {
      await wrap(<SplitButton label="Save" dropdownContent={<RNText>Save as…</RNText>} />);

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });

    it('opens the panel when the arrow half is pressed', async () => {
      await wrap(<SplitButton label="Save" dropdownContent={<RNText>Save as…</RNText>} />);

      await fireEvent.press(toggle());

      expect(screen.getByRole('dialog')).toBeOnTheScreen();
      expect(screen.getByText('Save as…')).toBeOnTheScreen();
    });

    it('pressing the primary half never opens the panel', async () => {
      await wrap(<SplitButton label="Save" dropdownContent={<RNText>Save as…</RNText>} />);

      await fireEvent.press(primary());

      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });

    it('accepts a custom dropdown label', async () => {
      await wrap(
        <SplitButton
          label="Save"
          dropdownLabel="Save options"
          dropdownContent={<RNText>Save as…</RNText>}
        />,
      );

      expect(toggle('Save options')).toBeOnTheScreen();
    });

    it('exposes expanded state on the arrow half', async () => {
      await wrap(<SplitButton label="Save" dropdownContent={<RNText>Save as…</RNText>} />);

      expect(toggle().props.accessibilityState.expanded).toBe(false);

      await fireEvent.press(toggle());

      expect(toggle().props.accessibilityState.expanded).toBe(true);
    });
  });

  describe('disabled', () => {
    it('ignores presses on both halves', async () => {
      const onPress = jest.fn();

      await wrap(
        <SplitButton
          label="Save"
          onPress={onPress}
          disabled
          dropdownContent={<RNText>Save as…</RNText>}
        />,
      );

      await fireEvent.press(primary());
      await fireEvent.press(toggle());

      expect(onPress).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
    });

    it('marks the arrow half disabled', async () => {
      await wrap(<SplitButton label="Save" disabled dropdownContent={<RNText>Save as…</RNText>} />);

      expect(toggle().props.accessibilityState.disabled).toBe(true);
    });
  });

  it('forwards testID to the container', async () => {
    await wrap(
      <SplitButton testID="split" label="Save" dropdownContent={<RNText>Save as…</RNText>} />,
    );

    expect(StyleSheet.flatten(screen.getByTestId('split').props.style).borderRadius).toBe(8);
  });
});
