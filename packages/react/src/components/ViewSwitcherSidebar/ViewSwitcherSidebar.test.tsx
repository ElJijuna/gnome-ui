import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ViewSwitcherSidebar } from './ViewSwitcherSidebar';
import { ViewSwitcherSidebarItem } from './ViewSwitcherSidebarItem';

const ControlledSidebar = () => {
  const [value, setValue] = useState('photos');
  const views = ['photos', 'albums', 'shared'];

  return (
    <ViewSwitcherSidebar value={value} onValueChange={setValue}>
      {views.map((v) => (
        <ViewSwitcherSidebarItem key={v} name={v} label={v} />
      ))}
    </ViewSwitcherSidebar>
  );
};

describe('ViewSwitcherSidebar', () => {
  describe('rendering', () => {
    it('renders as a nav containing a radiogroup', () => {
      render(<ViewSwitcherSidebar value="photos" onValueChange={vi.fn()} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Views');
    });

    it('accepts a custom aria-label', () => {
      render(<ViewSwitcherSidebar value="photos" onValueChange={vi.fn()} aria-label="Library" />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Library');
    });

    it('renders a header and footer slot', () => {
      render(
        <ViewSwitcherSidebar
          value="photos"
          onValueChange={vi.fn()}
          header={<div>Header content</div>}
          footer={<div>Footer content</div>}
        />,
      );

      expect(screen.getByText('Header content')).toBeInTheDocument();
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders items with role=radio', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem name="photos" label="Photos" />
          <ViewSwitcherSidebarItem name="albums" label="Albums" />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });

  describe('ViewSwitcherSidebarItem', () => {
    it('marks the item matching value as checked', () => {
      render(
        <ViewSwitcherSidebar value="albums" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem name="photos" label="Photos" />
          <ViewSwitcherSidebarItem name="albums" label="Albums" />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getByRole('radio', { name: 'Photos' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
      expect(screen.getByRole('radio', { name: 'Albums' })).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onValueChange with its name when clicked', async () => {
      const onValueChange = vi.fn();

      render(
        <ViewSwitcherSidebar value="photos" onValueChange={onValueChange}>
          <ViewSwitcherSidebarItem name="albums" label="Albums" />
        </ViewSwitcherSidebar>,
      );

      await userEvent.click(screen.getByRole('radio', { name: 'Albums' }));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('albums');
    });

    it('renders a numeric count badge, capped at 99+', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem name="inbox" label="Inbox" count={150} />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('renders a plain count when at or below 99', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem name="inbox" label="Inbox" count={12} />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders a custom suffix over count', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem
            name="inbox"
            label="Inbox"
            count={5}
            suffix={<span data-testid="suffix">•</span>}
          />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getByTestId('suffix')).toBeInTheDocument();
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('hides the label and trailing content when the sidebar is collapsed', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()} collapsed>
          <ViewSwitcherSidebarItem name="inbox" label="Inbox" count={5} />
        </ViewSwitcherSidebar>,
      );

      expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('can be disabled', () => {
      render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()}>
          <ViewSwitcherSidebarItem name="inbox" label="Inbox" disabled />
        </ViewSwitcherSidebar>,
      );

      expect(screen.getByRole('radio')).toBeDisabled();
    });

    it('throws when used outside a ViewSwitcherSidebar', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<ViewSwitcherSidebarItem name="x" label="X" />)).toThrow(
        'ViewSwitcherSidebarItem must be used inside ViewSwitcherSidebar',
      );

      consoleError.mockRestore();
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown moves to and activates the next item', async () => {
      render(<ControlledSidebar />);

      screen.getByRole('radio', { name: 'photos' }).focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(screen.getByRole('radio', { name: 'albums' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'albums' })).toHaveFocus();
    });

    it('ArrowUp wraps from the first to the last item', async () => {
      render(<ControlledSidebar />);

      screen.getByRole('radio', { name: 'photos' }).focus();
      await userEvent.keyboard('{ArrowUp}');

      expect(screen.getByRole('radio', { name: 'shared' })).toHaveAttribute('aria-checked', 'true');
    });

    it('End/Home jump to the last/first item', async () => {
      render(<ControlledSidebar />);

      screen.getByRole('radio', { name: 'photos' }).focus();
      await userEvent.keyboard('{End}');
      expect(screen.getByRole('radio', { name: 'shared' })).toHaveAttribute('aria-checked', 'true');

      await userEvent.keyboard('{Home}');
      expect(screen.getByRole('radio', { name: 'photos' })).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className on ViewSwitcherSidebar', () => {
      const { container } = render(
        <ViewSwitcherSidebar value="photos" onValueChange={vi.fn()} className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
