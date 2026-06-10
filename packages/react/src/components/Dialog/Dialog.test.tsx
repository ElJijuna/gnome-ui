import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(<Dialog open={false} title="Settings" />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Regression: the backdrop must not carry aria-hidden, or the dialog
  // disappears from the accessibility tree entirely.
  it('is exposed to assistive technology when open', () => {
    render(<Dialog open title="Settings" />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is labelled by its title', () => {
    render(<Dialog open title="Confirm deletion" />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Confirm deletion');
  });

  it('omits aria-labelledby when there is no title', () => {
    render(<Dialog open>Body only</Dialog>);

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();

    render(
      <Dialog open title="Settings" onClose={onClose}>
        <button type="button">Ok</button>
      </Dialog>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes button onClick handlers', () => {
    const onClick = vi.fn();

    render(<Dialog open title="Settings" buttons={[{ label: 'Save', onClick }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses role alertdialog and fires onResponse for the alert API', () => {
    const onResponse = vi.fn();

    render(
      <Dialog
        open
        role="alertdialog"
        title="Delete file?"
        responses={[
          { id: 'cancel', label: 'Cancel' },
          { id: 'delete', label: 'Delete', variant: 'destructive' },
        ]}
        onResponse={onResponse}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onResponse).toHaveBeenCalledWith('delete');
  });

  it('fires the first non-destructive response on Escape', () => {
    const onResponse = vi.fn();

    render(
      <Dialog
        open
        role="alertdialog"
        title="Delete file?"
        responses={[
          { id: 'delete', label: 'Delete', variant: 'destructive' },
          { id: 'cancel', label: 'Cancel' },
        ]}
        onResponse={onResponse}
      />,
    );

    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });

    expect(onResponse).toHaveBeenCalledWith('cancel');
  });

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(<Dialog open title="Settings" />);

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Dialog open={false} title="Settings" />);

    expect(document.body.style.overflow).toBe('');
  });
});
