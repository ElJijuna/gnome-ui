import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('renders an alertdialog with title and message', () => {
    render(
      <AlertDialog
        open
        title="Discard changes?"
        message="Unsaved changes will be lost."
        responses={[{ id: 'cancel', label: 'Cancel' }]}
        onResponse={vi.fn()}
      />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Discard changes?')).toBeInTheDocument();
    expect(screen.getByText('Unsaved changes will be lost.')).toBeInTheDocument();
  });

  it('calls onResponse with the selected response id', () => {
    const onResponse = vi.fn();

    render(
      <AlertDialog
        open
        title="Delete item?"
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
});
