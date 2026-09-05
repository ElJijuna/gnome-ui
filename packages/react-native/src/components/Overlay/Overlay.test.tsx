import { fireEvent, render, screen } from '@testing-library/react-native';

import { Text } from '@/components/Text';
import { GnomeProvider } from '@/GnomeProvider';
import { Overlay } from './Overlay';

describe('Overlay', () => {
  it('renders nothing when closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Overlay open={false}>
          <Text>Content</Text>
        </Overlay>
      </GnomeProvider>,
    );

    expect(screen.queryByText('Content')).not.toBeOnTheScreen();
  });

  it('renders children when open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Overlay open>
          <Text>Content</Text>
        </Overlay>
      </GnomeProvider>,
    );

    expect(screen.getByText('Content')).toBeOnTheScreen();
  });

  it('calls onDismiss when the backdrop itself is pressed', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Overlay open onDismiss={onDismiss} testID="backdrop">
          <Text>Content</Text>
        </Overlay>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss when the content itself is pressed', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Overlay open onDismiss={onDismiss}>
          <Text>Content</Text>
        </Overlay>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByText('Content'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('does not throw when onDismiss is omitted and the backdrop is pressed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Overlay open testID="backdrop">
          <Text>Content</Text>
        </Overlay>
      </GnomeProvider>,
    );

    await expect(fireEvent.press(screen.getByTestId('backdrop'))).resolves.not.toThrow();
  });
});
