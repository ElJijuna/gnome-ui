import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Banner } from './Banner';

describe('Banner', () => {
  it('renders the message', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Banner>Update available</Banner>
      </GnomeProvider>,
    );

    expect(screen.getByText('Update available')).toBeOnTheScreen();
  });

  it('renders no action/dismiss buttons by default', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Banner>Message</Banner>
      </GnomeProvider>,
    );

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('renders an action button when actionLabel is provided', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Banner actionLabel="Retry">Failed</Banner>
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  });

  it('renders a dismiss button when dismissible is true', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Banner dismissible>Message</Banner>
      </GnomeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeOnTheScreen();
  });

  it('calls onAction when the action button is pressed', async () => {
    const onAction = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Banner actionLabel="Retry" onAction={onAction}>
          Failed
        </Banner>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the dismiss button is pressed', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Banner dismissible onDismiss={onDismiss}>
          Message
        </Banner>
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('forwards testID', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Banner testID="my-banner">Message</Banner>
      </GnomeProvider>,
    );

    expect(screen.getByTestId('my-banner')).toBeOnTheScreen();
  });
});
