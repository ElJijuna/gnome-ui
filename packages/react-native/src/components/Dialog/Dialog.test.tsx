import { fireEvent, render, screen } from '@testing-library/react-native';

import { GnomeProvider } from '@/GnomeProvider';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open={false} title="Settings" />
      </GnomeProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeOnTheScreen();
  });

  it('renders with role=dialog when open', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Settings" />
      </GnomeProvider>,
    );

    expect(screen.getByRole('dialog')).toBeOnTheScreen();
  });

  it('renders the title and body', async () => {
    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Confirm deletion">
          This cannot be undone.
        </Dialog>
      </GnomeProvider>,
    );

    expect(screen.getByText('Confirm deletion')).toBeOnTheScreen();
    expect(screen.getByText('This cannot be undone.')).toBeOnTheScreen();
  });

  it('invokes button onPress handlers', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Settings" buttons={[{ label: 'Save', onPress }]} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress for a disabled button', async () => {
    const onPress = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Settings" buttons={[{ label: 'Save', onPress, disabled: true }]} />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('closes on backdrop press when closeOnBackdrop is true (default)', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Settings" onClose={onClose} testID="backdrop" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop press when closeOnBackdrop is false', async () => {
    const onClose = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog open title="Settings" onClose={onClose} closeOnBackdrop={false} testID="backdrop" />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses role=alertdialog and fires onResponse for the alert API', async () => {
    const onResponse = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog
          open
          role="alertdialog"
          title="Delete file?"
          responses={[
            { id: 'cancel', label: 'Cancel' },
            { id: 'delete', label: 'Delete', variant: 'destructive' },
          ]}
          onResponse={onResponse}
        />
      </GnomeProvider>,
    );

    expect(screen.getByRole('alertdialog')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));

    expect(onResponse).toHaveBeenCalledWith('delete');
  });

  it('fires the first non-destructive response on backdrop press in alert mode', async () => {
    const onResponse = jest.fn();

    await render(
      <GnomeProvider colorScheme="light">
        <Dialog
          open
          role="alertdialog"
          title="Delete file?"
          responses={[
            { id: 'delete', label: 'Delete', variant: 'destructive' },
            { id: 'cancel', label: 'Cancel' },
          ]}
          onResponse={onResponse}
          testID="backdrop"
        />
      </GnomeProvider>,
    );

    await fireEvent.press(screen.getByTestId('backdrop'));

    expect(onResponse).toHaveBeenCalledWith('cancel');
  });
});
