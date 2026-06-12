import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WindowHandle } from './WindowHandle';

describe('WindowHandle', () => {
  it('renders window controls', () => {
    render(<WindowHandle />);

    expect(screen.getByRole('group', { name: 'Window controls' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minimize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('switches maximize to restore when maximized', () => {
    render(<WindowHandle maximized />);

    expect(screen.getByRole('button', { name: 'Restore' })).toHaveAttribute(
      'data-window-action',
      'restore',
    );
  });

  it('calls action callbacks', () => {
    const onMinimize = vi.fn();
    const onToggleMaximize = vi.fn();
    const onClose = vi.fn();

    render(
      <WindowHandle
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onToggleMaximize).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
