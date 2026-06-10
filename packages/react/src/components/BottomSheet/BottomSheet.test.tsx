import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BottomSheet } from './BottomSheet';

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
});
