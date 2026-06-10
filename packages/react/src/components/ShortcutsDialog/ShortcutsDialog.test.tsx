import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ShortcutsDialog, type ShortcutsSection } from './ShortcutsDialog';

const sections: ShortcutsSection[] = [
  {
    title: 'File',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save document' },
      { keys: ['Ctrl', 'O'], description: 'Open file' },
    ],
  },
  {
    title: 'Edit',
    shortcuts: [{ keys: ['Ctrl', 'Z'], description: 'Undo' }],
  },
];

describe('ShortcutsDialog', () => {
  it('renders nothing when closed', () => {
    render(<ShortcutsDialog open={false} onClose={() => {}} sections={sections} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Regression: the backdrop must not carry aria-hidden, or the dialog
  // disappears from the accessibility tree entirely.
  it('is exposed to assistive technology and labelled by its title', () => {
    render(<ShortcutsDialog open onClose={() => {}} sections={sections} />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Keyboard Shortcuts');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();

    render(<ShortcutsDialog open onClose={onClose} sections={sections} />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the close button', () => {
    const onClose = vi.fn();

    render(<ShortcutsDialog open onClose={onClose} sections={sections} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filters shortcuts by description', () => {
    render(<ShortcutsDialog open onClose={() => {}} sections={sections} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search shortcuts' }), {
      target: { value: 'undo' },
    });

    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.queryByText('Save document')).toBeNull();
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<ShortcutsDialog open onClose={() => {}} sections={sections} />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<ShortcutsDialog open={false} onClose={() => {}} sections={sections} />);

    expect(document.body.style.overflow).toBe('');
  });
});
