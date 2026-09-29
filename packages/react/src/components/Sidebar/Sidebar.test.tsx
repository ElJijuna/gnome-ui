import { GoHome } from '@gnome-ui/icons';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Sidebar,
  SidebarCollapsedContext,
  SidebarFilterContext,
  useSidebarCollapsed,
} from './Sidebar';
import { SidebarItem } from './SidebarItem';
import { SidebarSection, type SidebarSectionHandle } from './SidebarSection';

describe('Sidebar', () => {
  describe('rendering', () => {
    it('renders as a nav landmark', () => {
      render(<Sidebar>Content</Sidebar>);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <Sidebar>
          <div>Nav content</div>
        </Sidebar>,
      );

      expect(screen.getByText('Nav content')).toBeInTheDocument();
    });

    it('propagates collapsed to descendant SidebarItems', () => {
      render(
        <Sidebar collapsed>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      // A hidden tooltip (auto-derived from the label when collapsed) also
      // contains the text "Inbox" elsewhere in the document, so assert on the
      // button's own text content rather than a document-wide text query.
      expect(screen.getByRole('button')).toHaveTextContent('');
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Inbox');
    });
  });

  describe('prefix / suffix', () => {
    it('renders prefix and suffix content', () => {
      render(
        <Sidebar prefix={<div>Account</div>} suffix={<button type="button">Help</button>}>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    });

    it('places prefix before the items and suffix after them', () => {
      render(
        <Sidebar prefix={<span>Top</span>} suffix={<span>Bottom</span>}>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      const nav = screen.getByRole('navigation');
      const text = nav.textContent ?? '';
      expect(text.indexOf('Top')).toBeLessThan(text.indexOf('Inbox'));
      expect(text.indexOf('Inbox')).toBeLessThan(text.indexOf('Bottom'));
    });

    it('renders prefix above the built-in search bar', () => {
      render(
        <Sidebar searchable prefix={<span data-testid="prefix">Top</span>}>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      const prefix = screen.getByTestId('prefix');
      const search = screen.getByPlaceholderText('Search…');
      expect(
        prefix.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('keeps prefix and suffix visible when the filter has no matches', () => {
      render(
        <Sidebar filter="zzz" prefix={<span>Top</span>} suffix={<span>Bottom</span>}>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.getByText('Top')).toBeInTheDocument();
      expect(screen.getByText('Bottom')).toBeInTheDocument();
    });

    it('exposes the collapsed state to slot content', () => {
      const Slot = () => <span>{useSidebarCollapsed() ? 'rail' : 'full'}</span>;

      render(<Sidebar collapsed prefix={<Slot />} suffix={<Slot />} />);
      expect(screen.getAllByText('rail')).toHaveLength(2);
    });

    it('does not forward prefix as an HTML attribute', () => {
      render(<Sidebar prefix={<span>Top</span>} />);
      expect(screen.getByRole('navigation')).not.toHaveAttribute('prefix');
    });

    it('omits the slot wrappers when not provided', () => {
      render(
        <Sidebar>
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      // Only the scrollable content region wraps the items.
      expect(screen.getByRole('navigation').children).toHaveLength(1);
    });
  });

  describe('searchable', () => {
    it('renders a search box when searchable', () => {
      render(<Sidebar searchable />);
      expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    });

    it('omits the search box by default', () => {
      render(<Sidebar />);
      expect(screen.queryByPlaceholderText('Search…')).not.toBeInTheDocument();
    });

    it('filters items as the user types (uncontrolled)', async () => {
      render(
        <Sidebar searchable>
          <SidebarItem label="Inbox" />
          <SidebarItem label="Archive" />
        </Sidebar>,
      );

      await userEvent.type(screen.getByPlaceholderText('Search…'), 'arch');

      expect(screen.getByText('Inbox').closest('li')).toHaveAttribute('hidden');
      expect(screen.getByText('Archive').closest('li')).not.toHaveAttribute('hidden');
    });
  });

  describe('controlled filter', () => {
    it('hides items that do not match the external filter prop', () => {
      render(
        <Sidebar filter="arch">
          <SidebarItem label="Inbox" />
          <SidebarItem label="Archive" />
        </Sidebar>,
      );

      expect(screen.getByText('Inbox').closest('li')).toHaveAttribute('hidden');
      expect(screen.getByText('Archive').closest('li')).not.toHaveAttribute('hidden');
    });

    it('shows a "No Results" status page when nothing matches', () => {
      render(
        <Sidebar filter="zzz">
          <SidebarItem label="Inbox" />
        </Sidebar>,
      );

      expect(screen.getByText('No Results')).toBeInTheDocument();
      expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
    });

    it('calls onFilterChange when typing in the built-in search box', async () => {
      const onFilterChange = vi.fn();

      render(<Sidebar searchable onFilterChange={onFilterChange} filter="" />);
      await userEvent.type(screen.getByPlaceholderText('Search…'), 'a');

      expect(onFilterChange).toHaveBeenCalledWith('a');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<Sidebar className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});

describe('SidebarItem', () => {
  describe('rendering', () => {
    it('renders the label', () => {
      render(<SidebarItem label="Inbox" />);
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    it('sets aria-current=page when active', () => {
      render(<SidebarItem label="Inbox" active />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current when inactive', () => {
      render(<SidebarItem label="Inbox" />);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-current');
    });

    it('renders suffix content, preferred over the deprecated badge prop', () => {
      render(
        <SidebarItem
          label="Inbox"
          badge={<span data-testid="badge">B</span>}
          suffix={<span data-testid="suffix">S</span>}
        />,
      );

      expect(screen.getByTestId('suffix')).toBeInTheDocument();
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });

    it('falls back to the deprecated badge prop when no suffix is given', () => {
      render(<SidebarItem label="Inbox" badge={<span data-testid="badge">B</span>} />);
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });
  });

  describe('prefix', () => {
    it('renders the prefix before the label', () => {
      render(<SidebarItem label="Inbox" prefix={<span data-testid="prefix">P</span>} />);

      const prefix = screen.getByTestId('prefix');
      expect(screen.getByRole('button')).toContainElement(prefix);
      expect(
        prefix.compareDocumentPosition(screen.getByText('Inbox')) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('takes precedence over icon', () => {
      render(
        <SidebarItem label="Inbox" icon={GoHome} prefix={<span data-testid="prefix">P</span>} />,
      );

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('svg')).toBeNull();
    });

    it('still renders the icon when no prefix is given', () => {
      render(<SidebarItem label="Inbox" icon={GoHome} />);
      expect(screen.getByRole('button').querySelector('svg')).not.toBeNull();
    });

    it('keeps the prefix in rail (collapsed) mode', () => {
      render(
        <SidebarCollapsedContext.Provider value={true}>
          <SidebarItem label="Inbox" prefix={<span data-testid="prefix">P</span>} />
        </SidebarCollapsedContext.Provider>,
      );

      expect(screen.getByTestId('prefix')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Inbox');
    });

    it('does not forward prefix as an HTML attribute', () => {
      render(<SidebarItem label="Inbox" prefix={<span>P</span>} />);
      expect(screen.getByRole('button')).not.toHaveAttribute('prefix');
    });
  });

  describe('collapsed sidebar context', () => {
    it('hides the visible label span and sets it as aria-label instead', () => {
      render(
        <SidebarCollapsedContext.Provider value={true}>
          <SidebarItem label="Inbox" />
        </SidebarCollapsedContext.Provider>,
      );

      // A hidden tooltip (auto-derived from the label when collapsed) also
      // contains the text "Inbox" elsewhere in the document, so assert on the
      // button's own text content rather than a document-wide text query.
      expect(screen.getByRole('button')).toHaveTextContent('');
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Inbox');
    });
  });

  describe('filter context', () => {
    it('hides the item when the filter does not match the label', () => {
      render(
        <SidebarFilterContext.Provider value="zzz">
          <ul>
            <SidebarItem label="Inbox" />
          </ul>
        </SidebarFilterContext.Provider>,
      );

      expect(screen.getByText('Inbox').closest('li')).toHaveAttribute('hidden');
    });

    it('keeps the item visible when the filter matches', () => {
      render(
        <SidebarFilterContext.Provider value="inb">
          <ul>
            <SidebarItem label="Inbox" />
          </ul>
        </SidebarFilterContext.Provider>,
      );

      expect(screen.getByText('Inbox').closest('li')).not.toHaveAttribute('hidden');
    });
  });

  describe('context menu', () => {
    const menuItems = [
      { label: 'Rename', onClick: vi.fn() },
      { label: 'Delete', onClick: vi.fn(), destructive: true },
    ];

    it('opens on right-click and lists the entries', () => {
      render(<SidebarItem label="Inbox" menuItems={menuItems} />);

      fireEvent.contextMenu(screen.getByRole('button'));

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    });

    it('calls the entry onClick and closes the menu when selected', () => {
      const onClick = vi.fn();

      render(<SidebarItem label="Inbox" menuItems={[{ label: 'Rename', onClick }]} />);

      fireEvent.contextMenu(screen.getByRole('button'));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

      expect(onClick).toHaveBeenCalledOnce();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes on Escape', () => {
      render(<SidebarItem label="Inbox" menuItems={menuItems} />);

      fireEvent.contextMenu(screen.getByRole('button'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes when clicking outside', () => {
      render(<SidebarItem label="Inbox" menuItems={menuItems} />);

      fireEvent.contextMenu(screen.getByRole('button'));
      fireEvent.mouseDown(document.body);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('does not open when no menuItems are given', () => {
      render(<SidebarItem label="Inbox" />);
      fireEvent.contextMenu(screen.getByRole('button'));

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens via Shift+F10', () => {
      render(<SidebarItem label="Inbox" menuItems={menuItems} />);

      fireEvent.keyDown(screen.getByRole('button'), { key: 'F10', shiftKey: true });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('calls onDrop when a row is dropped and onDrop is provided', () => {
      const onDrop = vi.fn();

      render(<SidebarItem label="Inbox" onDrop={onDrop} />);
      fireEvent.drop(screen.getByRole('button'));

      expect(onDrop).toHaveBeenCalledOnce();
    });

    it('does not error when dropped with no onDrop handler', () => {
      render(<SidebarItem label="Inbox" />);
      expect(() => fireEvent.drop(screen.getByRole('button'))).not.toThrow();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<SidebarItem label="Inbox" className="custom" />);
      expect(screen.getByRole('button')).toHaveClass('custom');
    });
  });
});

describe('SidebarSection', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <SidebarSection>
          <li>Row</li>
        </SidebarSection>,
      );

      expect(screen.getByText('Row')).toBeInTheDocument();
    });

    it('renders a title', () => {
      render(<SidebarSection title="Favorites" />);
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('renders the header as a plain (non-interactive) block when not collapsible', () => {
      render(<SidebarSection title="Favorites" />);
      expect(screen.queryByRole('button', { name: /Favorites/ })).not.toBeInTheDocument();
    });
  });

  describe('suffix', () => {
    it('renders the suffix in the header of a plain section', () => {
      render(
        <SidebarSection title="Favorites" suffix={<button type="button">Add</button>}>
          <SidebarItem label="Inbox" />
        </SidebarSection>,
      );

      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders a header for a suffix-only section', () => {
      render(<SidebarSection suffix={<span>3</span>} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('keeps the suffix outside the toggle button of a collapsible section', () => {
      render(
        <SidebarSection title="Favorites" collapsible suffix={<button type="button">Add</button>}>
          <SidebarItem label="Inbox" />
        </SidebarSection>,
      );

      const toggle = screen.getByRole('button', { name: /Favorites/ });
      expect(toggle).not.toContainElement(screen.getByRole('button', { name: 'Add' }));
    });

    it('does not toggle a collapsible section when the suffix is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onAdd = vi.fn();
      render(
        <SidebarSection
          title="Favorites"
          collapsible
          onOpenChange={onOpenChange}
          suffix={
            <button type="button" onClick={onAdd}>
              Add
            </button>
          }
        >
          <SidebarItem label="Inbox" />
        </SidebarSection>,
      );

      await user.click(screen.getByRole('button', { name: 'Add' }));
      expect(onAdd).toHaveBeenCalledOnce();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /Favorites/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('hides the suffix in rail (collapsed) mode', () => {
      render(
        <SidebarCollapsedContext.Provider value={true}>
          <SidebarSection title="Favorites" suffix={<span>Suffix</span>}>
            <SidebarItem label="Inbox" />
          </SidebarSection>
        </SidebarCollapsedContext.Provider>,
      );

      expect(screen.queryByText('Suffix')).not.toBeInTheDocument();
    });
  });

  describe('collapsible', () => {
    it('renders the header as a toggle button, open by default', () => {
      render(
        <SidebarSection title="Favorites" collapsible>
          <li>Row</li>
        </SidebarSection>,
      );

      const header = screen.getByRole('button', { name: /Favorites/ });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles aria-expanded and the body aria-hidden on click', async () => {
      render(
        <SidebarSection title="Favorites" collapsible>
          <li>Row</li>
        </SidebarSection>,
      );

      const header = screen.getByRole('button', { name: /Favorites/ });
      await userEvent.click(header);

      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(header).toHaveAttribute('aria-controls');

      const body = document.getElementById(header.getAttribute('aria-controls') as string);
      expect(body).toHaveAttribute('aria-hidden', 'true');
    });

    it('respects defaultOpen=false', () => {
      render(
        <SidebarSection title="Favorites" collapsible defaultOpen={false}>
          <li>Row</li>
        </SidebarSection>,
      );

      expect(screen.getByRole('button', { name: /Favorites/ })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('supports controlled open + onOpenChange', async () => {
      const onOpenChange = vi.fn();

      render(
        <SidebarSection title="Favorites" collapsible open={true} onOpenChange={onOpenChange}>
          <li>Row</li>
        </SidebarSection>,
      );

      const header = screen.getByRole('button', { name: /Favorites/ });
      await userEvent.click(header);

      // Controlled: visual state does not change on its own...
      expect(header).toHaveAttribute('aria-expanded', 'true');
      // ...but the callback still fires with the requested next value.
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('exposes an imperative expand/collapse/toggle ref handle', () => {
      const ref = createRef<SidebarSectionHandle>();

      render(
        <SidebarSection title="Favorites" collapsible defaultOpen={false} ref={ref}>
          <li>Row</li>
        </SidebarSection>,
      );

      const header = screen.getByRole('button', { name: /Favorites/ });
      expect(header).toHaveAttribute('aria-expanded', 'false');

      act(() => ref.current?.expand());
      expect(header).toHaveAttribute('aria-expanded', 'true');

      act(() => ref.current?.collapse());
      expect(header).toHaveAttribute('aria-expanded', 'false');

      act(() => ref.current?.toggle());
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('always shows the body when the sidebar itself is collapsed (rail mode)', () => {
      render(
        <SidebarCollapsedContext.Provider value={true}>
          <SidebarSection title="Favorites" collapsible defaultOpen={false}>
            <li>Row</li>
          </SidebarSection>
        </SidebarCollapsedContext.Provider>,
      );

      // No toggle header in rail mode — body is unconditionally visible.
      expect(screen.queryByRole('button', { name: /Favorites/ })).not.toBeInTheDocument();
      expect(screen.getByText('Row')).toBeVisible();
    });
  });

  describe('filter context', () => {
    it('renders nothing when the filter matches no children', () => {
      const { container } = render(
        <SidebarFilterContext.Provider value="zzz">
          <SidebarSection title="Favorites">
            <SidebarItem label="Inbox" />
          </SidebarSection>
        </SidebarFilterContext.Provider>,
      );

      expect(container.firstElementChild).toBeNull();
    });

    it('renders when the filter matches at least one child', () => {
      render(
        <SidebarFilterContext.Provider value="inb">
          <SidebarSection title="Favorites">
            <SidebarItem label="Inbox" />
          </SidebarSection>
        </SidebarFilterContext.Provider>,
      );

      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<SidebarSection title="Favorites" className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
