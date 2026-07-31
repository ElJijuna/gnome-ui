import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ViewSwitcher } from './ViewSwitcher';
import { ViewSwitcherItem } from './ViewSwitcherItem';

const ControlledSwitcher = () => {
  const [active, setActive] = useState('all');
  const views = ['all', 'photos', 'shared'];

  return (
    <ViewSwitcher>
      {views.map((view) => (
        <ViewSwitcherItem
          key={view}
          label={view}
          active={active === view}
          onClick={() => setActive(view)}
        />
      ))}
    </ViewSwitcher>
  );
};

describe('ViewSwitcher', () => {
  describe('rendering', () => {
    it('renders as a radiogroup with a default accessible label', () => {
      render(<ViewSwitcher />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('View switcher');
    });

    it('accepts a custom aria-label', () => {
      render(<ViewSwitcher aria-label="Library views" />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Library views');
    });

    it('renders items with role=radio', () => {
      render(
        <ViewSwitcher>
          <ViewSwitcherItem label="All" active />
          <ViewSwitcherItem label="Photos" />
        </ViewSwitcher>,
      );

      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });

  describe('ViewSwitcherItem', () => {
    it('marks the active item aria-checked=true and others false', () => {
      render(
        <ViewSwitcher>
          <ViewSwitcherItem label="All" active />
          <ViewSwitcherItem label="Photos" />
        </ViewSwitcher>,
      );

      expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'Photos' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('gives only the active item tabIndex 0 (roving tabindex)', () => {
      render(
        <ViewSwitcher>
          <ViewSwitcherItem label="All" active />
          <ViewSwitcherItem label="Photos" />
        </ViewSwitcher>,
      );

      expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('tabIndex', '0');
      expect(screen.getByRole('radio', { name: 'Photos' })).toHaveAttribute('tabIndex', '-1');
    });

    it('calls onClick when clicked', async () => {
      const onClick = vi.fn();

      render(<ViewSwitcher>{<ViewSwitcherItem label="All" onClick={onClick} />}</ViewSwitcher>);
      await userEvent.click(screen.getByRole('radio', { name: 'All' }));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('can be disabled', () => {
      render(
        <ViewSwitcher>
          <ViewSwitcherItem label="All" disabled />
        </ViewSwitcher>,
      );

      expect(screen.getByRole('radio', { name: 'All' })).toBeDisabled();
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves to and activates the next item', async () => {
      render(<ControlledSwitcher />);

      screen.getByRole('radio', { name: 'all' }).focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(screen.getByRole('radio', { name: 'photos' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(screen.getByRole('radio', { name: 'photos' })).toHaveFocus();
    });

    it('ArrowLeft wraps from the first to the last item', async () => {
      render(<ControlledSwitcher />);

      screen.getByRole('radio', { name: 'all' }).focus();
      await userEvent.keyboard('{ArrowLeft}');

      expect(screen.getByRole('radio', { name: 'shared' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('ArrowRight wraps from the last to the first item', async () => {
      render(<ControlledSwitcher />);

      screen.getByRole('radio', { name: 'all' }).focus();
      await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

      expect(screen.getByRole('radio', { name: 'all' })).toHaveAttribute('aria-checked', 'true');
    });

    it('End jumps to the last item', async () => {
      render(<ControlledSwitcher />);

      screen.getByRole('radio', { name: 'all' }).focus();
      await userEvent.keyboard('{End}');

      expect(screen.getByRole('radio', { name: 'shared' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('Home jumps to the first item', async () => {
      render(<ControlledSwitcher />);

      screen.getByRole('radio', { name: 'all' }).focus();
      await userEvent.keyboard('{End}{Home}');

      expect(screen.getByRole('radio', { name: 'all' })).toHaveAttribute('aria-checked', 'true');
    });

    it('skips disabled items', async () => {
      render(
        <ViewSwitcher>
          <ViewSwitcherItem label="All" active />
          <ViewSwitcherItem label="Photos" disabled />
          <ViewSwitcherItem label="Shared" />
        </ViewSwitcher>,
      );

      screen.getByRole('radio', { name: 'All' }).focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(screen.getByRole('radio', { name: 'Shared' })).toHaveFocus();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className on ViewSwitcher', () => {
      const { container } = render(<ViewSwitcher className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards className on ViewSwitcherItem', () => {
      render(<ViewSwitcherItem label="All" className="custom" />);
      expect(screen.getByRole('radio')).toHaveClass('custom');
    });
  });
});
