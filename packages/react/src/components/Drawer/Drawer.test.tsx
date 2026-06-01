import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders children from the right by default', () => {
    render(
      <Drawer open aria-label="Details">
        <button type="button">Drawer action</button>
      </Drawer>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute('data-side', 'right');
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute('data-size', 'classic');
    expect(screen.getByRole('button', { name: 'Drawer action' })).toBeInTheDocument();
  });

  it('renders content prop with configured side and size', () => {
    render(
      <Drawer
        open
        aria-label="Filters"
        side="left"
        size="wide"
        content={<div>Left panel content</div>}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Filters' })).toHaveAttribute('data-side', 'left');
    expect(screen.getByRole('dialog', { name: 'Filters' })).toHaveAttribute('data-size', 'wide');
    expect(screen.getByText('Left panel content')).toBeInTheDocument();
  });

  it('closes from Escape and backdrop clicks', () => {
    const onClose = vi.fn();

    render(
      <Drawer open aria-label="Menu" onClose={onClose}>
        <button type="button">Menu action</button>
      </Drawer>,
    );

    const drawer = screen.getByRole('dialog', { name: 'Menu' });

    fireEvent.keyDown(drawer, { key: 'Escape' });
    fireEvent.click(drawer.parentElement as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('can keep backdrop clicks from closing', () => {
    const onClose = vi.fn();

    render(
      <Drawer open aria-label="Persistent" onClose={onClose} closeOnBackdrop={false}>
        <button type="button">Done</button>
      </Drawer>,
    );

    fireEvent.click(
      screen.getByRole('dialog', { name: 'Persistent' }).parentElement as HTMLElement,
    );

    expect(onClose).not.toHaveBeenCalled();
  });
});
