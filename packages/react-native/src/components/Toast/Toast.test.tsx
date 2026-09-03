import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders the title', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toast title="Saved successfully" duration={0} />
      </GnomeProvider>,
    );

    expect(screen.getByText('Saved successfully')).toBeOnTheScreen();
  });

  it('auto-dismisses after duration', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Toast title="Copied" duration={30} onDismiss={onDismiss} />
      </GnomeProvider>,
    );

    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });

  it('never calls onDismiss when duration is 0', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Toast title="Persistent" duration={0} onDismiss={onDismiss} />
      </GnomeProvider>,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('renders no action/dismiss buttons by default', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Toast title="Plain" duration={0} />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('calls onAction then onDismiss when the action button is pressed', async () => {
    const onAction = jest.fn();
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Toast
          title="File deleted"
          duration={0}
          actionLabel="Undo"
          onAction={onAction}
          onDismiss={onDismiss}
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the dismiss button is pressed, without onAction', async () => {
    const onAction = jest.fn();
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Toast
          title="Notice"
          duration={0}
          dismissible
          actionLabel="Retry"
          onAction={onAction}
          onDismiss={onDismiss}
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('pausing (pressIn without pressOut) delays auto-dismiss past the original duration', async () => {
    const onDismiss = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Toast title="Held" duration={30} onDismiss={onDismiss} testID="toast" />
      </GnomeProvider>,
    );

    await fireEvent(screen.getByTestId('toast'), 'pressIn');

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(onDismiss).not.toHaveBeenCalled();

    await fireEvent(screen.getByTestId('toast'), 'pressOut');
    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
  });
});
