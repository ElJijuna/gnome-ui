import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { SpinRow } from './SpinRow';

const wrap = (ui: ReactElement) => render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);

describe('SpinRow', () => {
  it('renders the title and subtitle', async () => {
    await wrap(<SpinRow title="Volume" subtitle="Output level" />);

    expect(screen.getByText('Volume')).toBeOnTheScreen();
    expect(screen.getByText('Output level')).toBeOnTheScreen();
  });

  it('renders leading content', async () => {
    await wrap(<SpinRow title="Volume" leading={<RNText>icon</RNText>} />);

    expect(screen.getByText('icon')).toBeOnTheScreen();
  });

  it('defaults to value 0', async () => {
    await wrap(<SpinRow title="Volume" />);

    expect(screen.getByText('0', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('formats the displayed value using decimals derived from step', async () => {
    await wrap(<SpinRow title="Volume" defaultValue={1} step={0.1} />);

    expect(screen.getByText('1.0', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('honors an explicit decimals override', async () => {
    await wrap(<SpinRow title="Volume" defaultValue={1} decimals={2} />);

    expect(screen.getByText('1.00', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  describe('controlled vs uncontrolled', () => {
    it('reflects a controlled value prop', async () => {
      await wrap(<SpinRow title="Volume" value={42} onValueChange={jest.fn()} />);

      expect(screen.getByText('42', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('reports the changed value but keeps the displayed value when controlled', async () => {
      const onValueChange = jest.fn();
      await wrap(<SpinRow title="Volume" value={10} onValueChange={onValueChange} />);

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(onValueChange).toHaveBeenCalledWith(11);
      expect(screen.getByText('10', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('keeps its own value when uncontrolled', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={5} />);

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(screen.getByText('6', { includeHiddenElements: true })).toBeOnTheScreen();
    });
  });

  describe('button interactions', () => {
    it('increments the value when + is pressed', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={5} />);

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(screen.getByText('6', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('decrements the value when − is pressed', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={5} />);

      await fireEvent.press(screen.getByText('−', { includeHiddenElements: true }));

      expect(screen.getByText('4', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('clamps to the configured min/max', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={100} min={0} max={100} />);

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(screen.getByText('100', { includeHiddenElements: true })).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('names the spin button after the title', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={5} />);

      expect(screen.getByRole('adjustable', { name: 'Volume' })).toBeOnTheScreen();
    });

    it('accepts an explicit accessibility label', async () => {
      await wrap(<SpinRow title="Volume" accessibilityLabel="Playback volume" />);

      expect(screen.getByRole('adjustable', { name: 'Playback volume' })).toBeOnTheScreen();
    });
  });

  describe('disabled', () => {
    it('dims the row', async () => {
      await wrap(<SpinRow testID="row" title="Volume" disabled />);

      expect(StyleSheet.flatten(screen.getByTestId('row').props.style).opacity).toBe(0.5);
    });

    it('disables the increment/decrement buttons', async () => {
      await wrap(<SpinRow title="Volume" defaultValue={5} disabled />);

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));
      await fireEvent.press(screen.getByText('−', { includeHiddenElements: true }));

      expect(screen.getByText('5', { includeHiddenElements: true })).toBeOnTheScreen();
    });
  });

  it('inherits ActionRow metrics', async () => {
    await wrap(<SpinRow testID="row" title="Volume" />);

    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(52);
  });
});
