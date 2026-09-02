import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef, type ReactElement } from 'react';
import type { View } from 'react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { RadioButton } from './RadioButton';

function renderWithProvider(ui: ReactElement) {
  return render(<GnomeProvider colorScheme="light">{ui}</GnomeProvider>);
}

describe('RadioButton', () => {
  describe('rendering', () => {
    it('renders with the radio accessibility role', async () => {
      await renderWithProvider(<RadioButton value={false} />);
      expect(screen.getByRole('radio')).toBeOnTheScreen();
    });

    it('reflects the selected state via accessibilityState', async () => {
      await renderWithProvider(<RadioButton value />);
      expect(screen.getByRole('radio').props.accessibilityState).toMatchObject({
        checked: true,
      });
    });

    it('reflects the unselected state via accessibilityState', async () => {
      await renderWithProvider(<RadioButton value={false} />);
      expect(screen.getByRole('radio').props.accessibilityState).toMatchObject({
        checked: false,
      });
    });
  });

  describe('interactions', () => {
    it('calls onSelect when pressed while unselected', async () => {
      const onSelect = jest.fn();

      await renderWithProvider(<RadioButton value={false} onSelect={onSelect} />);
      await fireEvent.press(screen.getByRole('radio'));

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onSelect when pressed while already selected', async () => {
      const onSelect = jest.fn();

      await renderWithProvider(<RadioButton value onSelect={onSelect} />);
      await fireEvent.press(screen.getByRole('radio'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not call onSelect when disabled', async () => {
      const onSelect = jest.fn();

      await renderWithProvider(<RadioButton value={false} onSelect={onSelect} disabled />);
      await fireEvent.press(screen.getByRole('radio'));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('does not throw when onSelect is omitted', async () => {
      await renderWithProvider(<RadioButton value={false} />);
      await expect(fireEvent.press(screen.getByRole('radio'))).resolves.not.toThrow();
    });
  });

  describe('grouping', () => {
    it('lets multiple radio buttons share one piece of selection state', async () => {
      const onChange = jest.fn();
      const options = ['a', 'b', 'c'] as const;

      const Group = ({ selected }: { selected: (typeof options)[number] }) => {
        return (
          <>
            {options.map((option) => (
              <RadioButton
                key={option}
                value={option === selected}
                onSelect={() => onChange(option)}
                testID={`option-${option}`}
              />
            ))}
          </>
        );
      };

      await renderWithProvider(<Group selected="a" />);

      expect(screen.getByTestId('option-a').props.accessibilityState).toMatchObject({
        checked: true,
      });
      expect(screen.getByTestId('option-b').props.accessibilityState).toMatchObject({
        checked: false,
      });

      await fireEvent.press(screen.getByTestId('option-b'));

      expect(onChange).toHaveBeenCalledWith('b');
    });
  });

  describe('disabled', () => {
    it('sets disabled via accessibilityState', async () => {
      await renderWithProvider(<RadioButton value={false} disabled />);
      expect(screen.getByRole('radio').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('dims the pressable when disabled', async () => {
      await renderWithProvider(<RadioButton value={false} disabled />);
      expect(screen.getByRole('radio')).toHaveStyle({ opacity: 0.5 });
    });
  });

  describe('prop forwarding', () => {
    it('forwards accessibilityLabel', async () => {
      await renderWithProvider(<RadioButton value={false} accessibilityLabel="Small" />);
      expect(screen.getByLabelText('Small')).toBeOnTheScreen();
    });

    it('merges a custom style over the pressable', async () => {
      await renderWithProvider(<RadioButton value={false} style={{ marginTop: 8 }} />);
      expect(screen.getByRole('radio')).toHaveStyle({ marginTop: 8 });
    });

    it('forwards testID', async () => {
      await renderWithProvider(<RadioButton value={false} testID="size-small" />);
      expect(screen.getByTestId('size-small')).toBeOnTheScreen();
    });

    it('forwards a ref to the underlying Pressable', async () => {
      const ref = createRef<View>();

      await renderWithProvider(<RadioButton value={false} ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});
