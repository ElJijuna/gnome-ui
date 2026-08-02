import { describe, expect, it } from 'vitest';

import { GnomeViewSwitcherElement } from './view-switcher';

function pressKey(target: HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function renderViewSwitcher(
  itemsMarkup = `
    <button role="radio" aria-checked="true">List</button>
    <button role="radio" aria-checked="false">Grid</button>
    <button role="radio" aria-checked="false" disabled>Archive</button>
    <button role="radio" aria-checked="false">Timeline</button>
  `,
) {
  const viewSwitcher = document.createElement('gnome-view-switcher');
  viewSwitcher.innerHTML = itemsMarkup;
  document.body.append(viewSwitcher);

  return {
    items: Array.from(viewSwitcher.querySelectorAll<HTMLButtonElement>('[role="radio"]')),
    viewSwitcher,
  };
}

describe('GnomeViewSwitcherElement', () => {
  it('registers the custom element and defaults role to radiogroup', () => {
    const { viewSwitcher } = renderViewSwitcher();

    expect(customElements.get('gnome-view-switcher')).toBe(GnomeViewSwitcherElement);
    expect(viewSwitcher.getAttribute('role')).toBe('radiogroup');
  });

  it('makes the checked item the roving-tabindex stop, others -1, disabled included', () => {
    const { items } = renderViewSwitcher();

    expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('falls back to the first enabled item when none is checked', () => {
    const { items } = renderViewSwitcher(`
      <button role="radio" disabled>Disabled first</button>
      <button role="radio">List</button>
      <button role="radio">Grid</button>
    `);

    expect(items.map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
  });

  it('re-syncs tabindex when aria-checked changes on a descendant', async () => {
    const { items } = renderViewSwitcher();

    items[0].setAttribute('aria-checked', 'false');
    items[1].setAttribute('aria-checked', 'true');
    await Promise.resolve();

    expect(items.map((item) => item.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it('moves focus AND clicks with ArrowRight/ArrowDown, skipping disabled items, and wraps', () => {
    const { items } = renderViewSwitcher();
    const clicks: string[] = [];

    for (const item of items) {
      item.addEventListener('click', () => clicks.push(item.textContent ?? ''));
    }

    items[0].focus();
    pressKey(items[0], 'ArrowRight');
    expect(document.activeElement).toBe(items[1]);

    pressKey(items[1], 'ArrowDown');
    expect(document.activeElement).toBe(items[3]);

    pressKey(items[3], 'ArrowRight');
    expect(document.activeElement).toBe(items[0]);

    expect(clicks).toEqual(['Grid', 'Timeline', 'List']);
  });

  it('moves focus with ArrowLeft/ArrowUp, wrapping backward', () => {
    const { items } = renderViewSwitcher();

    items[0].focus();
    pressKey(items[0], 'ArrowLeft');
    expect(document.activeElement).toBe(items[3]);

    pressKey(items[3], 'ArrowUp');
    expect(document.activeElement).toBe(items[1]);
  });

  it('jumps to the first/last enabled item with Home/End', () => {
    const { items } = renderViewSwitcher();

    items[1].focus();
    pressKey(items[1], 'End');
    expect(document.activeElement).toBe(items[3]);

    pressKey(items[3], 'Home');
    expect(document.activeElement).toBe(items[0]);
  });

  it('ignores keydowns that do not originate from an item', () => {
    const { items, viewSwitcher } = renderViewSwitcher();

    viewSwitcher.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(document.activeElement).not.toBe(items[1]);
  });
});
