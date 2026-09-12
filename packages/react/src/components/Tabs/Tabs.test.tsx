import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TabBar, TabItem, TabPanel } from './index';

// jsdom doesn't implement ResizeObserver, and never computes real layout —
// `scrollWidth`/`clientWidth` are both always 0 — so `TabBar`'s scroll-state
// hook is exercised here by stubbing both directly on `HTMLElement.prototype`,
// the same technique `TextTruncate.test.tsx` already established for the
// same underlying gap.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let mockScrollWidth = 0;
let mockClientWidth = 0;

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get() {
      return mockScrollWidth;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return mockClientWidth;
    },
  });
});

beforeEach(() => {
  mockScrollWidth = 0;
  mockClientWidth = 0;
});

describe('Tabs', () => {
  it('renders a tablist with tabs', () => {
    render(
      <TabBar aria-label="Primary sections">
        <TabItem label="General" active panelId="general" />
        <TabItem label="Advanced" panelId="advanced" />
      </TabBar>,
    );

    expect(screen.getByRole('tablist', { name: 'Primary sections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Advanced' })).toHaveAttribute('aria-selected', 'false');
  });

  it('moves focus with arrow keys', () => {
    render(
      <TabBar>
        <TabItem label="General" active />
        <TabItem label="Advanced" />
        <TabItem label="Network" />
      </TabBar>,
    );

    const general = screen.getByRole('tab', { name: 'General' });
    const advanced = screen.getByRole('tab', { name: 'Advanced' });
    const network = screen.getByRole('tab', { name: 'Network' });

    general.focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(advanced).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
    expect(network).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
    expect(general).toHaveFocus();
  });

  it('skips disabled tabs during keyboard navigation', () => {
    render(
      <TabBar>
        <TabItem label="General" active />
        <TabItem label="Advanced" disabled />
        <TabItem label="Network" />
      </TabBar>,
    );

    const general = screen.getByRole('tab', { name: 'General' });
    const network = screen.getByRole('tab', { name: 'Network' });

    general.focus();
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });

    expect(network).toHaveFocus();
  });

  it('calls tab click and close handlers independently', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();

    render(
      <TabBar>
        <TabItem label="Document" active onClick={onClick} onClose={onClose} />
      </TabBar>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close tab' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders active and hidden panels', () => {
    render(
      <>
        <TabPanel id="general" active>
          General content
        </TabPanel>
        <TabPanel id="advanced">Advanced content</TabPanel>
      </>,
    );

    expect(screen.getByRole('tabpanel', { name: '' })).toHaveTextContent('General content');
    expect(screen.getByText('Advanced content', { selector: "[role='tabpanel']" })).toHaveAttribute(
      'hidden',
    );
  });

  describe('scroll buttons', () => {
    it('renders neither button when the tabs fit without overflowing', () => {
      mockScrollWidth = 300;
      mockClientWidth = 300;

      render(
        <TabBar>
          <TabItem label="General" active />
          <TabItem label="Advanced" />
        </TabBar>,
      );

      expect(
        screen.queryByRole('button', { name: 'Scroll to previous tabs' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Scroll to next tabs' })).not.toBeInTheDocument();
    });

    it('shows only the "next" button while scrolled to the start of an overflowing list', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      render(
        <TabBar>
          <TabItem label="General" active />
          <TabItem label="Advanced" />
        </TabBar>,
      );

      expect(
        screen.queryByRole('button', { name: 'Scroll to previous tabs' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Scroll to next tabs' })).toBeInTheDocument();
    });

    it('shows only the "previous" button once scrolled to the end', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      render(
        <TabBar>
          <TabItem label="General" active />
          <TabItem label="Advanced" />
        </TabBar>,
      );

      const list = screen.getByRole('tablist');
      list.scrollLeft = 300;
      fireEvent.scroll(list);

      expect(screen.getByRole('button', { name: 'Scroll to previous tabs' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Scroll to next tabs' })).not.toBeInTheDocument();
    });

    it('shows both buttons once scrolled somewhere in the middle', () => {
      mockScrollWidth = 900;
      mockClientWidth = 300;

      render(
        <TabBar>
          <TabItem label="General" active />
          <TabItem label="Advanced" />
        </TabBar>,
      );

      const list = screen.getByRole('tablist');
      list.scrollLeft = 300;
      fireEvent.scroll(list);

      expect(screen.getByRole('button', { name: 'Scroll to previous tabs' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Scroll to next tabs' })).toBeInTheDocument();
    });

    it('scrolls the list forward when the "next" button is pressed', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const scrollBy = vi.fn();

      render(
        <TabBar>
          <TabItem label="General" active />
          <TabItem label="Advanced" />
        </TabBar>,
      );

      const list = screen.getByRole('tablist');
      list.scrollBy = scrollBy;

      fireEvent.click(screen.getByRole('button', { name: 'Scroll to next tabs' }));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      const [[arg]] = scrollBy.mock.calls;
      expect(arg.left).toBeGreaterThan(0);
    });

    it('flips the scroll direction and icon for a right-to-left list', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const scrollBy = vi.fn();

      render(
        <div dir="rtl">
          <TabBar>
            <TabItem label="General" active />
            <TabItem label="Advanced" />
          </TabBar>
        </div>,
      );

      const list = screen.getByRole('tablist');
      list.scrollBy = scrollBy;

      // Still at the logical start, so only the "next" button (now visually
      // on the left, per `dir="rtl"`, but the same accessible name either way)
      // is present.
      fireEvent.click(screen.getByRole('button', { name: 'Scroll to next tabs' }));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      const [[arg]] = scrollBy.mock.calls;
      // Per the modern `scrollLeft` convention, RTL ranges `[-max, 0]`, so
      // moving toward later tabs (forward) means going *more negative* —
      // the opposite sign from the LTR case tested above.
      expect(arg.left).toBeLessThan(0);
    });
  });
});
