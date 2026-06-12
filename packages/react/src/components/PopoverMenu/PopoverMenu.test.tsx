import { Add } from '@gnome-ui/icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PopoverMenu } from './PopoverMenu';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

describe('PopoverMenu', () => {
  it('renders menu items when open', async () => {
    render(
      <PopoverMenu
        open
        sections={[{ items: [{ id: 'new', label: 'New Window', icon: Add, shortcut: 'Ctrl+N' }] }]}
      >
        <button type="button">Menu</button>
      </PopoverMenu>,
    );

    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /New Window/ })).toBeInTheDocument();
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
  });

  it('calls item onSelect and closes on activation', async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <PopoverMenu
        open
        onOpenChange={onOpenChange}
        sections={[{ items: [{ id: 'save', label: 'Save', onSelect }] }]}
      >
        <button type="button">Menu</button>
      </PopoverMenu>,
    );

    fireEvent.click(await screen.findByRole('menuitem', { name: 'Save' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
