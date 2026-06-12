import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InlineViewSwitcher } from './InlineViewSwitcher';
import styles from './InlineViewSwitcher.module.css';
import { InlineViewSwitcherItem } from './InlineViewSwitcherItem';

// ─── Shared helper ─────────────────────────────────────────────────────────────

function renderSwitcher(value = 'list', onValueChange = vi.fn()) {
  return render(
    <InlineViewSwitcher value={value} onValueChange={onValueChange} aria-label="View">
      <InlineViewSwitcherItem name="list" label="List" />
      <InlineViewSwitcherItem name="grid" label="Grid" />
      <InlineViewSwitcherItem name="columns" label="Columns" />
    </InlineViewSwitcher>,
  );
}

// ─── ResizeObserver mock helpers ───────────────────────────────────────────────

let triggerResize: () => void;

function mockResizeObserver() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: ResizeObserverCallback) {
        triggerResize = () => cb([], {} as ResizeObserver);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
}

function simulateOverflow(el: Element) {
  Object.defineProperty(el, 'scrollWidth', { get: () => 300, configurable: true });
  Object.defineProperty(el, 'clientWidth', { get: () => 150, configurable: true });
  act(() => triggerResize());
}

describe('InlineViewSwitcher', () => {
  // ─── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all item labels', () => {
      renderSwitcher();
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('Columns')).toBeInTheDocument();
    });

    it('exposes the container as a radiogroup with the given aria-label', () => {
      renderSwitcher();
      expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    });

    it('marks only the active item with aria-checked=true', () => {
      renderSwitcher('grid');
      expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('radio', { name: 'Columns' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('gives tabIndex=0 to the active item and -1 to the rest', () => {
      renderSwitcher('grid');
      expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('tabIndex', '0');
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('tabIndex', '-1');
    });

    it('renders a disabled item as a disabled button', () => {
      render(
        <InlineViewSwitcher value="list" onValueChange={vi.fn()} aria-label="View">
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" disabled />
        </InlineViewSwitcher>,
      );
      expect(screen.getByRole('radio', { name: 'Grid' })).toBeDisabled();
    });

    it('renders an accessible sliding indicator element', () => {
      const { container } = renderSwitcher();
      const indicator = container.querySelector('[aria-hidden]');
      expect(indicator).toBeInTheDocument();
    });
  });

  // ─── Interaction ─────────────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onValueChange with the clicked item name', () => {
      const onValueChange = vi.fn();
      renderSwitcher('list', onValueChange);
      fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(onValueChange).toHaveBeenCalledWith('grid');
    });

    it('does not call onValueChange when a disabled item is clicked', () => {
      const onValueChange = vi.fn();
      render(
        <InlineViewSwitcher value="list" onValueChange={onValueChange} aria-label="View">
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" disabled />
        </InlineViewSwitcher>,
      );
      fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  // ─── Keyboard navigation ─────────────────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('ArrowRight selects the next item', () => {
      const onValueChange = vi.fn();
      renderSwitcher('list', onValueChange);
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(onValueChange).toHaveBeenCalledWith('grid');
    });

    it('ArrowLeft selects the previous item', () => {
      const onValueChange = vi.fn();
      renderSwitcher('grid', onValueChange);
      screen.getByRole('radio', { name: 'Grid' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
      expect(onValueChange).toHaveBeenCalledWith('list');
    });

    it('ArrowDown selects the next item', () => {
      const onValueChange = vi.fn();
      renderSwitcher('list', onValueChange);
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });
      expect(onValueChange).toHaveBeenCalledWith('grid');
    });

    it('Home selects the first item', () => {
      const onValueChange = vi.fn();
      renderSwitcher('columns', onValueChange);
      screen.getByRole('radio', { name: 'Columns' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Home' });
      expect(onValueChange).toHaveBeenCalledWith('list');
    });

    it('End selects the last item', () => {
      const onValueChange = vi.fn();
      renderSwitcher('list', onValueChange);
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'End' });
      expect(onValueChange).toHaveBeenCalledWith('columns');
    });

    it('ArrowRight wraps from last to first', () => {
      const onValueChange = vi.fn();
      renderSwitcher('columns', onValueChange);
      screen.getByRole('radio', { name: 'Columns' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(onValueChange).toHaveBeenCalledWith('list');
    });

    it('ArrowLeft wraps from first to last', () => {
      const onValueChange = vi.fn();
      renderSwitcher('list', onValueChange);
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' });
      expect(onValueChange).toHaveBeenCalledWith('columns');
    });

    it('skips disabled items', () => {
      const onValueChange = vi.fn();
      render(
        <InlineViewSwitcher value="list" onValueChange={onValueChange} aria-label="View">
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" disabled />
          <InlineViewSwitcherItem name="columns" label="Columns" />
        </InlineViewSwitcher>,
      );
      screen.getByRole('radio', { name: 'List' }).focus();
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
      expect(onValueChange).toHaveBeenCalledWith('columns');
    });
  });

  // ─── overflow="scroll" ───────────────────────────────────────────────────────

  describe('overflow="scroll"', () => {
    it('applies overflowScroll CSS class', () => {
      const { container } = render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          overflow="scroll"
          aria-label="View"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
        </InlineViewSwitcher>,
      );
      expect(container.firstElementChild).toHaveClass(styles.overflowScroll);
    });

    it('renders all items normally', () => {
      render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          overflow="scroll"
          aria-label="View"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
        </InlineViewSwitcher>,
      );
      expect(screen.getByRole('radio', { name: 'List' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Grid' })).toBeInTheDocument();
    });
  });

  // ─── overflow="compact" ──────────────────────────────────────────────────────

  describe('overflow="compact"', () => {
    beforeEach(mockResizeObserver);
    afterEach(() => vi.unstubAllGlobals());

    it('does not apply compact class when content fits', () => {
      const { container } = render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          overflow="compact"
          aria-label="View"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
        </InlineViewSwitcher>,
      );
      expect(container.firstElementChild).not.toHaveClass(styles.compact);
    });

    it('applies compact class when content overflows', () => {
      const { container } = render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          overflow="compact"
          aria-label="View"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
        </InlineViewSwitcher>,
      );
      simulateOverflow(container.firstElementChild!);
      expect(container.firstElementChild).toHaveClass(styles.compact);
    });

    it('keeps items in the DOM when compact', () => {
      const { container } = render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          overflow="compact"
          aria-label="View"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
        </InlineViewSwitcher>,
      );
      simulateOverflow(container.firstElementChild!);
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });

  // ─── overflow="menu" ─────────────────────────────────────────────────────────

  describe('overflow="menu"', () => {
    beforeEach(mockResizeObserver);
    afterEach(() => vi.unstubAllGlobals());

    function renderMenuSwitcher(value = 'list') {
      const onValueChange = vi.fn();
      const result = render(
        <InlineViewSwitcher
          value={value}
          onValueChange={onValueChange}
          overflow="menu"
          aria-label="Library"
        >
          <InlineViewSwitcherItem name="list" label="List" />
          <InlineViewSwitcherItem name="grid" label="Grid" />
          <InlineViewSwitcherItem name="columns" label="Columns" />
        </InlineViewSwitcher>,
      );
      return { ...result, onValueChange };
    }

    it('shows normal radio items when not overflowing', () => {
      renderMenuSwitcher();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('replaces items with a trigger button when overflowing', () => {
      const { container } = renderMenuSwitcher('grid');
      simulateOverflow(container.firstElementChild!);
      expect(screen.queryByRole('radiogroup')).toBeNull();
      expect(screen.getByRole('button', { name: 'Library: Grid' })).toBeInTheDocument();
    });

    it('opens a BottomSheet with all items on trigger click', () => {
      const { container } = renderMenuSwitcher('list');
      simulateOverflow(container.firstElementChild!);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('calls onValueChange and closes the sheet on item selection', () => {
      const { container, onValueChange } = renderMenuSwitcher('list');
      simulateOverflow(container.firstElementChild!);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(onValueChange).toHaveBeenCalledWith('grid');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('marks the active item with aria-checked=true inside the BottomSheet', () => {
      const { container } = renderMenuSwitcher('grid');
      simulateOverflow(container.firstElementChild!);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false');
    });
  });

  // ─── HTML attribute forwarding ───────────────────────────────────────────────

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root element', () => {
      render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          aria-label="View"
          className="custom"
        >
          <InlineViewSwitcherItem name="list" label="List" />
        </InlineViewSwitcher>,
      );
      expect(screen.getByRole('radiogroup')).toHaveClass('custom');
    });

    it('forwards data attributes to the root element', () => {
      render(
        <InlineViewSwitcher
          value="list"
          onValueChange={vi.fn()}
          aria-label="View"
          data-testid="switcher"
        >
          <InlineViewSwitcherItem name="list" label="List" />
        </InlineViewSwitcher>,
      );
      expect(screen.getByTestId('switcher')).toBeInTheDocument();
    });
  });
});
