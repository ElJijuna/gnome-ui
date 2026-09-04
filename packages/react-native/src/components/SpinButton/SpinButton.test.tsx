import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { SpinButton } from './SpinButton';

describe('SpinButton', () => {
  it('exposes min/max/now via accessibilityValue', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SpinButton value={5} onChange={jest.fn()} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    const spin = screen.getByRole('adjustable', { name: 'Volume' });

    expect(spin.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 5, text: undefined });
  });

  it('formats the displayed value using decimals derived from step', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SpinButton value={1} step={0.1} onChange={jest.fn()} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    expect(screen.getByText('1.0', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('honors an explicit decimals override', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SpinButton value={1} decimals={2} onChange={jest.fn()} accessibilityLabel="Volume" />
      </GnomeProvider>,
    );

    expect(screen.getByText('1.00', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('exposes a custom formatter as the accessibility value text', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <SpinButton
          value={13}
          onChange={jest.fn()}
          format={(v) => `${v}:00`}
          accessibilityLabel="Hour"
        />
      </GnomeProvider>,
    );

    expect(screen.getByText('13:00', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByRole('adjustable', { name: 'Hour' }).props.accessibilityValue.text).toBe(
      '13:00',
    );
  });

  describe('button interactions', () => {
    it('increments the value when + is pressed', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={5} onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('decrements the value when − is pressed', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={5} onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByText('−', { includeHiddenElements: true }));

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('does not step past max/min', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={1} min={0} max={1} onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('wraps past max back to min when wrap is set', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton
            value={1}
            min={0}
            max={1}
            wrap
            onChange={onChange}
            accessibilityLabel="Volume"
          />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));

      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('accessibility actions', () => {
    it('increments and decrements by one step via the adjustable accessibility action', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={50} step={5} onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      const spin = screen.getByRole('adjustable', { name: 'Volume' });

      await fireEvent(spin, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
      await fireEvent(spin, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });

      expect(onChange).toHaveBeenNthCalledWith(1, 55);
      expect(onChange).toHaveBeenNthCalledWith(2, 45);
    });

    it('ignores accessibility actions when disabled', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={50} disabled onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      const spin = screen.getByRole('adjustable', { name: 'Volume' });

      await fireEvent(spin, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('marks the control disabled in accessibilityState', async () => {
      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={5} disabled onChange={jest.fn()} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      expect(screen.getByRole('adjustable', { name: 'Volume' }).props.accessibilityState).toEqual({
        disabled: true,
      });
    });

    it('ignores button presses when disabled', async () => {
      const onChange = jest.fn();

      await render(
        <GnomeProvider colorScheme="light">
          <SpinButton value={5} disabled onChange={onChange} accessibilityLabel="Volume" />
        </GnomeProvider>,
      );

      await fireEvent.press(screen.getByText('+', { includeHiddenElements: true }));
      await fireEvent.press(screen.getByText('−', { includeHiddenElements: true }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
