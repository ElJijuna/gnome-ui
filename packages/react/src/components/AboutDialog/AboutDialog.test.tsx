import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AboutDialog } from './AboutDialog';

describe('AboutDialog', () => {
  it('renders nothing when closed', () => {
    render(<AboutDialog open={false} applicationName="Files" />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Regression: the backdrop must not carry aria-hidden, or the dialog
  // disappears from the accessibility tree entirely.
  it('is exposed to assistive technology and labelled by the app name', () => {
    render(<AboutDialog open applicationName="Files" />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Files');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();

    render(<AboutDialog open applicationName="Files" onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the Close button', () => {
    const onClose = vi.fn();

    render(<AboutDialog open applicationName="Files" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows tabs and switches to Credits', () => {
    render(<AboutDialog open applicationName="Files" developers={['Ada Lovelace']} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }));

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders external links safely', () => {
    render(<AboutDialog open applicationName="Files" website="https://example.org" />);

    const link = screen.getByRole('link', { name: 'https://example.org' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<AboutDialog open applicationName="Files" />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<AboutDialog open={false} applicationName="Files" />);

    expect(document.body.style.overflow).toBe('');
  });
});
