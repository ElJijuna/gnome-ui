import { describe, expect, it } from 'vitest';

import { GnomeTabBarElement } from './tab-bar';

function pressKey(target: HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

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
});
