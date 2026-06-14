import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

beforeEach(() => {
  // jsdom does not implement matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Modal', () => {
  // ─── Rendering ───────────────────────────────────────────────────────────────

  it('renders nothing when closed', () => {
    render(<Modal open={false} title="Settings" />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog role when open', () => {
    render(<Modal open title="Settings" />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has accessible name from title', () => {
    render(<Modal open title="Preferences" />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Preferences');
  });

  // ─── Close triggers ──────────────────────────────────────────────────────────

  it('close button fires onClose', () => {
    const onClose = vi.fn();

    render(<Modal open title="Settings" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape fires onClose', () => {
    const onClose = vi.fn();

    render(
      <Modal open title="Settings" onClose={onClose}>
        <button type="button">Action</button>
      </Modal>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('backdrop click fires onClose', () => {
    const onClose = vi.fn();

    render(<Modal open title="Settings" onClose={onClose} />);

    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('backdrop click ignored when closeOnBackdrop is false', () => {
    const onClose = vi.fn();

    render(<Modal open title="Settings" onClose={onClose} closeOnBackdrop={false} />);

    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  // ─── Scroll lock ─────────────────────────────────────────────────────────────

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Modal open title="Settings" />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Modal open={false} title="Settings" />);

    expect(document.body.style.overflow).toBe('');
  });

  // ─── Exit animation ──────────────────────────────────────────────────────────

  it('applies closing class when open flips to false', () => {
    const { rerender } = render(<Modal open title="Settings" />);

    const dialog = screen.getByRole('dialog');

    rerender(<Modal open={false} title="Settings" />);

    // Modal should still be mounted (exit animation in progress)
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toMatch(/closing/);
  });

  it('unmounts after exit animation duration elapses', () => {
    vi.useFakeTimers();

    const { rerender } = render(<Modal open title="Settings" />);

    rerender(<Modal open={false} title="Settings" />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // ─── Actions ─────────────────────────────────────────────────────────────────

  it('primaryAction renders and fires onClick', () => {
    const onClick = vi.fn();

    render(<Modal open title="Edit Profile" primaryAction={{ label: 'Save', onClick }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('secondaryActions render and fire their onClick', () => {
    const onClick = vi.fn();

    render(<Modal open title="Edit Profile" secondaryActions={[{ label: 'Cancel', onClick }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // ─── Focus trap ──────────────────────────────────────────────────────────────

  it('Tab key wraps focus back to first focusable element', () => {
    render(
      <Modal open title="Settings" onClose={vi.fn()}>
        <button type="button">Last</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled])'));
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(document.activeElement).toBe(focusable[0]);
  });
});
