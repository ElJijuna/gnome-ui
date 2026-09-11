import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Callout } from './Callout';

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('Callout', () => {
  it('renders the message', async () => {
    await render(<Callout>Save your work before continuing.</Callout>);

    expect(screen.getByText('Save your work before continuing.')).toBeOnTheScreen();
  });

  it('exposes role="note"', async () => {
    await render(<Callout testID="callout">Message</Callout>);

    expect(screen.getByTestId('callout').props.role).toBe('note');
  });

  it('does not render a dismiss button by default', async () => {
    await render(<Callout>Message</Callout>);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeOnTheScreen();
  });

  it('renders a dismiss button when dismissible is true', async () => {
    await render(<Callout dismissible>Message</Callout>);

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeOnTheScreen();
  });

  describe('variants', () => {
    it.each([
      'info',
      'warning',
      'tip',
    ] as const)('tints the border and background for the %s variant', async (variant) => {
      await render(
        <Callout testID="callout" variant={variant}>
          Message
        </Callout>,
      );

      expect(styleOf('callout').borderStartColor).toBeTruthy();
      expect(styleOf('callout').backgroundColor).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onDismiss when the dismiss button is pressed', async () => {
      const onDismiss = jest.fn();

      await render(
        <Callout dismissible onDismiss={onDismiss}>
          Message
        </Callout>,
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  it('forwards extra view props', async () => {
    await render(
      <Callout testID="callout" accessibilityLabel="Tip">
        Message
      </Callout>,
    );

    expect(screen.getByTestId('callout').props.accessibilityLabel).toBe('Tip');
  });
});
