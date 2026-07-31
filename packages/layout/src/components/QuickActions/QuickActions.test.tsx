import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type QuickAction, QuickActions } from './QuickActions';

const makeActions = (overrides: Partial<QuickAction>[] = []): QuickAction[] => [
  {
    id: 'new-file',
    label: 'New File',
    icon: <span>+</span>,
    onActivate: vi.fn(),
    ...overrides[0],
  },
  {
    id: 'share',
    label: 'Share',
    icon: <span>S</span>,
    onActivate: vi.fn(),
    ...overrides[1],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <span>*</span>,
    onActivate: vi.fn(),
    ...overrides[2],
  },
];

describe('QuickActions', () => {
  it('renders action labels', () => {
    render(<QuickActions actions={makeActions()} />);

    expect(screen.getByRole('button', { name: 'New File' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('activates an enabled action on click', () => {
    const onActivate = vi.fn();

    render(<QuickActions actions={makeActions([{ onActivate }])} />);

    fireEvent.click(screen.getByRole('button', { name: 'New File' }));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('marks disabled actions and blocks interaction', () => {
    const onActivate = vi.fn();

    render(<QuickActions actions={makeActions([{}, { disabled: true, onActivate }])} />);

    const disabledAction = screen.getByRole('button', { name: 'Share' });

    fireEvent.click(disabledAction);

    expect(disabledAction).toBeDisabled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('moves focus with arrow keys between enabled actions', () => {
    render(<QuickActions actions={makeActions()} />);

    const first = screen.getByRole('button', { name: 'New File' });
    const second = screen.getByRole('button', { name: 'Share' });
    const third = screen.getByRole('button', { name: 'Settings' });

    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: 'ArrowDown' });
    expect(third).toHaveFocus();

    fireEvent.keyDown(third, { key: 'ArrowLeft' });
    expect(second).toHaveFocus();
  });

  it('skips disabled actions during keyboard navigation', () => {
    render(<QuickActions actions={makeActions([{}, { disabled: true }, {}])} />);

    const first = screen.getByRole('button', { name: 'New File' });
    const third = screen.getByRole('button', { name: 'Settings' });

    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });

    expect(third).toHaveFocus();
  });

  it('moves focus to the first enabled action on Home', () => {
    render(<QuickActions actions={makeActions()} />);

    const first = screen.getByRole('button', { name: 'New File' });
    const third = screen.getByRole('button', { name: 'Settings' });

    third.focus();
    fireEvent.keyDown(third, { key: 'Home' });

    expect(first).toHaveFocus();
  });

  it('moves focus to the last enabled action on End', () => {
    render(<QuickActions actions={makeActions()} />);

    const first = screen.getByRole('button', { name: 'New File' });
    const third = screen.getByRole('button', { name: 'Settings' });

    first.focus();
    fireEvent.keyDown(first, { key: 'End' });

    expect(third).toHaveFocus();
  });

  it('End skips a trailing disabled action and lands on the last enabled one', () => {
    render(<QuickActions actions={makeActions([{}, {}, { disabled: true }])} />);

    const first = screen.getByRole('button', { name: 'New File' });
    const second = screen.getByRole('button', { name: 'Share' });

    first.focus();
    fireEvent.keyDown(first, { key: 'End' });

    expect(second).toHaveFocus();
  });

  it('ignores keys that are not navigation keys', () => {
    render(<QuickActions actions={makeActions()} />);

    const first = screen.getByRole('button', { name: 'New File' });

    first.focus();
    fireEvent.keyDown(first, { key: 'a' });

    expect(first).toHaveFocus();
  });

  it('does nothing when every action is disabled and an arrow key is pressed', () => {
    const actions = makeActions([
      { disabled: true },
      { disabled: true },
      { disabled: true },
    ]);

    const { container } = render(<QuickActions actions={actions} />);
    const buttons = container.querySelectorAll('button');

    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' });

    // No button is focusable, and no error is thrown navigating a fully-disabled group.
    expect(document.activeElement).not.toBe(buttons[0]);
  });

  it('ignores keydown dispatched on a disabled action', () => {
    const { container } = render(
      <QuickActions actions={makeActions([{}, { disabled: true }])} />,
    );
    const disabledButton = screen.getByRole('button', { name: 'Share' });
    const firstButton = screen.getByRole('button', { name: 'New File' });

    expect(() => fireEvent.keyDown(disabledButton, { key: 'ArrowRight' })).not.toThrow();
    expect(container.querySelectorAll('button')[0]).toBe(firstButton);
    expect(firstButton).not.toHaveFocus();
  });

  it('forwards className and data attributes to the root', () => {
    render(
      <QuickActions
        actions={makeActions()}
        className="custom-actions"
        data-testid="quick-actions"
      />,
    );

    expect(screen.getByTestId('quick-actions')).toHaveClass('custom-actions');
  });

  it('sets the requested column count as a CSS variable', () => {
    render(<QuickActions actions={makeActions()} columns={5} data-testid="quick-actions" />);

    expect(screen.getByTestId('quick-actions')).toHaveStyle({
      '--quick-actions-columns': '5',
    });
  });

  it('preserves user inline styles', () => {
    render(
      <QuickActions
        actions={makeActions()}
        style={{ maxWidth: 320 }}
        data-testid="quick-actions"
      />,
    );

    expect(screen.getByTestId('quick-actions')).toHaveStyle({
      maxWidth: '320px',
    });
  });
});
