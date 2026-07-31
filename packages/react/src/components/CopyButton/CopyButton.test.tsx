import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { CopyButton } from './CopyButton';

// @testing-library/user-event's setup() defines its own navigator.clipboard
// stub (to support .copy()/.paste()) the moment it runs, overwriting any
// prior definition — so it must run *before* we spy on writeText, not after.
let user: ReturnType<typeof userEvent.setup>;
let writeTextSpy: MockInstance<Clipboard['writeText']>;

beforeEach(() => {
  user = userEvent.setup();
  writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CopyButton', () => {
  it('renders with the default label', () => {
    render(<CopyButton value="hello" />);

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    render(<CopyButton value="hello" label="Copy CVE ID" />);

    expect(screen.getByRole('button', { name: 'Copy CVE ID' })).toBeInTheDocument();
  });

  it('writes the value to the clipboard when clicked', async () => {
    render(<CopyButton value="CVE-2024-3094" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeTextSpy).toHaveBeenCalledExactlyOnceWith('CVE-2024-3094');
  });

  it('switches to the copied label after a successful copy', async () => {
    render(<CopyButton value="hello" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  });

  it('accepts a custom copied label', async () => {
    render(<CopyButton value="hello" copiedLabel="Added to clipboard" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Added to clipboard' })).toBeInTheDocument();
  });

  it('reverts to the default label after resetDelay elapses', async () => {
    render(<CopyButton value="hello" resetDelay={50} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('calls onCopied with the copied value', async () => {
    const onCopied = vi.fn();

    render(<CopyButton value="hello" onCopied={onCopied} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopied).toHaveBeenCalledExactlyOnceWith('hello');
  });

  it('announces the copied state in a live region', async () => {
    render(<CopyButton value="hello" />);

    expect(screen.getByRole('status')).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Copied!');
  });

  it('calls onCopyError and keeps the default label when the clipboard write rejects', async () => {
    const error = new Error('denied');

    writeTextSpy.mockRejectedValueOnce(error);
    const onCopyError = vi.fn();
    const onCopied = vi.fn();

    render(<CopyButton value="hello" onCopied={onCopied} onCopyError={onCopyError} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await vi.waitFor(() => expect(onCopyError).toHaveBeenCalledExactlyOnceWith(error));
    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('calls onCopyError when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    const onCopyError = vi.fn();

    render(<CopyButton value="hello" onCopyError={onCopyError} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopyError).toHaveBeenCalledOnce();
    expect(writeTextSpy).not.toHaveBeenCalled();
  });

  it('forwards IconButton props such as variant and size', () => {
    render(<CopyButton value="hello" size="sm" variant="flat" />);

    const button = screen.getByRole('button', { name: 'Copy' });

    expect(button.className).toMatch(/flat/);
  });

  it('clears the pending reset timer on unmount without throwing', async () => {
    const { unmount } = render(<CopyButton value="hello" resetDelay={5000} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(() => unmount()).not.toThrow();
  });

  it('clears a pending reset timer when clicked again before it elapses', async () => {
    render(<CopyButton value="hello" resetDelay={100} />);
    const button = () => screen.getByRole('button');

    await user.click(button());
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    await user.click(button());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(writeTextSpy).toHaveBeenCalledTimes(2);
  });
});
