import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from './BottomSheet';

afterEach(() => {
  vi.useRealTimers();
});

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

  // jsdom does not implement setPointerCapture
  Element.prototype.setPointerCapture = vi.fn();
});

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(<BottomSheet open={false} title="Options" />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Regression: the backdrop must not carry aria-hidden, or the sheet
  // disappears from the accessibility tree entirely.
  it('is exposed to assistive technology when open', () => {
    render(<BottomSheet open title="Options" />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is labelled by its title', () => {
    render(<BottomSheet open title="Share file" />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Share file');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();

    render(
      <BottomSheet open title="Options" onClose={onClose}>
        <button type="button">Ok</button>
      </BottomSheet>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on backdrop click when closeOnBackdrop is false', () => {
    const onClose = vi.fn();

    render(<BottomSheet open title="Options" onClose={onClose} closeOnBackdrop={false} />);

    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<BottomSheet open title="Options" />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<BottomSheet open={false} title="Options" />);

    expect(document.body.style.overflow).toBe('');
  });

  // ─── Exit animation ─────────────────────────────────────────────────────────

  it('applies closing class when open flips to false', () => {
    const { rerender } = render(<BottomSheet open title="Options" />);

    const dialog = screen.getByRole('dialog');

    rerender(<BottomSheet open={false} title="Options" />);

    // Sheet should still be mounted (exit animation in progress)
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toMatch(/closing/);
  });

  it('unmounts after exit animation duration elapses', () => {
    vi.useFakeTimers();

    const { rerender } = render(<BottomSheet open title="Options" />);

    rerender(<BottomSheet open={false} title="Options" />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // ─── Drag-to-dismiss ────────────────────────────────────────────────────────

  it('calls onClose when dragged past threshold', () => {
    // Simulate reduced motion so onClose fires synchronously (no setTimeout)
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const onClose = vi.fn();

    render(<BottomSheet open title="Options" onClose={onClose} />);

    const handle = screen.getByRole('dialog').querySelector('[aria-hidden="true"]') as HTMLElement;

    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 160 });
    fireEvent.pointerUp(handle);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when drag is under threshold', () => {
    const onClose = vi.fn();

    render(<BottomSheet open title="Options" onClose={onClose} />);

    const handle = screen.getByRole('dialog').querySelector('[aria-hidden="true"]') as HTMLElement;

    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 80 });
    fireEvent.pointerUp(handle);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores upward drag (negative delta)', () => {
    const onClose = vi.fn();

    render(<BottomSheet open title="Options" onClose={onClose} />);

    const handle = screen.getByRole('dialog').querySelector('[aria-hidden="true"]') as HTMLElement;

    fireEvent.pointerDown(handle, { clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 0 }); // upward
    fireEvent.pointerUp(handle);

    expect(onClose).not.toHaveBeenCalled();
  });
});
