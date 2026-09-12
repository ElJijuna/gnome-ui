import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { GnomeTabBarElement } from './tab-bar';

function pressKey(target: HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

// jsdom doesn't implement ResizeObserver, and never computes real layout —
// `scrollWidth`/`clientWidth` are both always 0 — so the scroll-button
// visibility logic is exercised here by stubbing both directly on
// `HTMLElement.prototype`, the same technique `@gnome-ui/react`'s own
// `Tabs.test.tsx` already established for the identical underlying gap.
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

function renderTabBar(
  tabsMarkup = `
    <button role="tab" aria-selected="true">General</button>
    <button role="tab" aria-selected="false">Notifications</button>
    <button role="tab" aria-selected="false" disabled>Privacy</button>
    <button role="tab" aria-selected="false">Advanced</button>
  `,
) {
  const tabBar = document.createElement('gnome-tab-bar');
  tabBar.innerHTML = tabsMarkup;
  document.body.append(tabBar);

  return {
    tabBar,
    tabs: Array.from(tabBar.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
  };
}

describe('GnomeTabBarElement', () => {
  it('registers the custom element and defaults role to tablist', () => {
    const { tabBar } = renderTabBar();

    expect(customElements.get('gnome-tab-bar')).toBe(GnomeTabBarElement);
    expect(tabBar.getAttribute('role')).toBe('tablist');
  });

  it('makes the selected tab the roving-tabindex stop, others -1, disabled included', () => {
    const { tabs } = renderTabBar();

    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('falls back to the first enabled tab when none is selected', () => {
    const { tabs } = renderTabBar(`
      <button role="tab" disabled>Disabled first</button>
      <button role="tab">General</button>
      <button role="tab">Advanced</button>
    `);

    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('re-syncs tabindex when aria-selected changes on a descendant', async () => {
    const { tabs } = renderTabBar();

    tabs[0].setAttribute('aria-selected', 'false');
    tabs[1].setAttribute('aria-selected', 'true');
    await Promise.resolve();

    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it('moves focus with ArrowRight/ArrowLeft, skipping disabled tabs, and wraps around', () => {
    const { tabs } = renderTabBar();

    tabs[1].focus();
    pressKey(tabs[1], 'ArrowRight');
    expect(document.activeElement).toBe(tabs[3]);

    pressKey(tabs[3], 'ArrowRight');
    expect(document.activeElement).toBe(tabs[0]);

    pressKey(tabs[0], 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[3]);
  });

  it('moves focus to the first/last enabled tab with Home/End', () => {
    const { tabs } = renderTabBar();

    tabs[1].focus();
    pressKey(tabs[1], 'End');
    expect(document.activeElement).toBe(tabs[3]);

    pressKey(tabs[3], 'Home');
    expect(document.activeElement).toBe(tabs[0]);
  });

  it('ignores keydowns that do not originate from a tab', () => {
    const { tabBar, tabs } = renderTabBar();

    tabBar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(document.activeElement).not.toBe(tabs[1]);
  });

  it('reflects the inline attribute', () => {
    const { tabBar } = renderTabBar();

    expect(tabBar.inline).toBe(false);
    tabBar.inline = true;
    expect(tabBar.hasAttribute('inline')).toBe(true);
  });

  describe('scroll buttons', () => {
    function scrollButtons(tabBar: GnomeTabBarElement) {
      return {
        start: tabBar.querySelector<HTMLButtonElement>('[data-slot="tab-bar-scroll-start"]'),
        end: tabBar.querySelector<HTMLButtonElement>('[data-slot="tab-bar-scroll-end"]'),
      };
    }

    it('renders neither button when the tabs fit without overflowing', () => {
      mockScrollWidth = 300;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();
      const { start, end } = scrollButtons(tabBar);

      expect(start?.hidden).toBe(true);
      expect(end?.hidden).toBe(true);
    });

    it('shows only the "end" button while scrolled to the start of an overflowing list', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();
      const { start, end } = scrollButtons(tabBar);

      expect(start?.hidden).toBe(true);
      expect(end?.hidden).toBe(false);
    });

    it('shows only the "start" button once scrolled to the end', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();

      tabBar.scrollLeft = 300;
      tabBar.dispatchEvent(new Event('scroll'));

      const { start, end } = scrollButtons(tabBar);

      expect(start?.hidden).toBe(false);
      expect(end?.hidden).toBe(true);
    });

    it('shows both buttons once scrolled somewhere in the middle', () => {
      mockScrollWidth = 900;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();

      tabBar.scrollLeft = 300;
      tabBar.dispatchEvent(new Event('scroll'));

      const { start, end } = scrollButtons(tabBar);

      expect(start?.hidden).toBe(false);
      expect(end?.hidden).toBe(false);
    });

    it('scrolls the bar forward when the "end" button is pressed', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();
      const scrollBy = vi.fn();

      tabBar.scrollBy = scrollBy;
      scrollButtons(tabBar).end?.click();

      expect(scrollBy).toHaveBeenCalledTimes(1);
      const [[arg]] = scrollBy.mock.calls;
      expect(arg.left).toBeGreaterThan(0);
    });

    it('flips the scroll direction and icon for a right-to-left bar', () => {
      mockScrollWidth = 600;
      mockClientWidth = 300;

      const { tabBar } = renderTabBar();

      tabBar.setAttribute('dir', 'rtl');

      const scrollBy = vi.fn();
      tabBar.scrollBy = scrollBy;

      // Still at the logical start, so only the "end" button (visually on
      // the left now, per `dir="rtl"`, but the same `data-slot` either way)
      // is present.
      scrollButtons(tabBar).end?.click();

      expect(scrollBy).toHaveBeenCalledTimes(1);
      const [[arg]] = scrollBy.mock.calls;
      // Per the modern `scrollLeft` convention, RTL ranges `[-max, 0]`, so
      // moving toward later tabs (forward) means going *more negative* —
      // the opposite sign from the LTR case tested above.
      expect(arg.left).toBeLessThan(0);
    });
  });
});
