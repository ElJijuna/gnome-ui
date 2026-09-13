import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CopyButton } from './CopyButton';

const mockSetString = jest.fn();

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    setString: (value: string) => mockSetString(value),
  },
}));

describe('CopyButton', () => {
  beforeEach(() => {
    mockSetString.mockReset();
  });

  it('renders with the default label', async () => {
    await render(<CopyButton value="hello" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeOnTheScreen();
  });

  it('accepts a custom label', async () => {
    await render(<CopyButton value="hello" label="Copy CVE ID" />);
    expect(screen.getByRole('button', { name: 'Copy CVE ID' })).toBeOnTheScreen();
  });

  it('writes the value to the clipboard when pressed', async () => {
    await render(<CopyButton value="CVE-2024-3094" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(mockSetString).toHaveBeenCalledTimes(1);
    expect(mockSetString).toHaveBeenCalledWith('CVE-2024-3094');
  });

  it('switches to the copied label after a successful copy', async () => {
    const { unmount } = await render(<CopyButton value="hello" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeOnTheScreen();
    // Default resetDelay is 2000ms — unmount explicitly so the pending
    // setCopied(false) timer doesn't fire after this test ends and log an
    // "update not wrapped in act()" warning (the same class of issue as
    // AnimatedIcon's continuous loops, just a one-shot timer here).
    unmount();
  });

  it('accepts a custom copied label', async () => {
    const { unmount } = await render(<CopyButton value="hello" copiedLabel="Added to clipboard" />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Added to clipboard' })).toBeOnTheScreen();
    unmount();
  });

  it('reverts to the default label after resetDelay elapses', async () => {
    await render(<CopyButton value="hello" resetDelay={50} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Copy' })).toBeOnTheScreen();
  });

  it('calls onCopied with the copied value', async () => {
    const onCopied = jest.fn();

    const { unmount } = await render(<CopyButton value="hello" onCopied={onCopied} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(onCopied).toHaveBeenCalledWith('hello');
    unmount();
  });

  it('announces the copied state in a live region', async () => {
    const { unmount } = await render(<CopyButton value="hello" testID="copy-button" />);
    const status = screen.getByRole('status');

    expect(status.props.children).toBe('');

    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(status.props.children).toBe('Copied!');
    unmount();
  });

  it('calls onCopyError and keeps the default label when the clipboard write throws', async () => {
    const error = new Error('unavailable');

    mockSetString.mockImplementationOnce(() => {
      throw error;
    });
    const onCopyError = jest.fn();
    const onCopied = jest.fn();

    await render(<CopyButton value="hello" onCopied={onCopied} onCopyError={onCopyError} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopyError).toHaveBeenCalledTimes(1);
    expect(onCopyError).toHaveBeenCalledWith(error);
    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeOnTheScreen();
  });

  it('forwards IconButton props such as variant and size', async () => {
    await render(<CopyButton value="hello" size="sm" variant="flat" testID="copy-button" />);
    expect(screen.getByTestId('copy-button')).toBeOnTheScreen();
  });

  it('clears the pending reset timer on unmount without throwing', async () => {
    const { unmount } = await render(<CopyButton value="hello" resetDelay={5000} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeOnTheScreen();
    expect(() => unmount()).not.toThrow();
  });

  it('clears a pending reset timer when pressed again before it elapses', async () => {
    await render(<CopyButton value="hello" resetDelay={100} />);
    const button = () => screen.getByRole('button');

    await fireEvent.press(button());
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeOnTheScreen();

    await fireEvent.press(button());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(mockSetString).toHaveBeenCalledTimes(2);
  });
});
