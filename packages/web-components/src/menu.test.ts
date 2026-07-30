import { describe, expect, it, vi } from 'vitest';

import { type GnomeMenuCloseDetail, GnomeMenuElement, type GnomeMenuSelectDetail } from './menu';

function renderMenu() {
  const menu = document.createElement('gnome-menu');
  menu.innerHTML = `
    <button type="button" data-slot="menu-trigger">Project options</button>
    <section data-slot="menu-content">
      <span data-slot="menu-label">Project</span>
      <button type="button" data-menu-item data-value="rename">Rename</button>
      <button type="button" data-menu-item disabled>Duplicate</button>
      <button type="button" data-menu-item data-value="archive">Archive</button>
      <hr data-slot="menu-separator" />
    </section>
  `;
  document.body.append(menu);

  const trigger = menu.querySelector<HTMLElement>('[data-slot="menu-trigger"]');
  const content = menu.querySelector<HTMLElement>('[data-slot="menu-content"]');
  const items = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-item]'));

  return { content, items, menu, trigger };
}

describe('GnomeMenuElement', () => {
  it('registers the custom element', () => {
    expect(customElements.get('gnome-menu')).toBe(GnomeMenuElement);
  });

  it('opens from its trigger and wires the menu pattern', async () => {
    const { content, items, menu, trigger } = renderMenu();

    trigger?.click();
    await Promise.resolve();

    expect(menu.open).toBe(true);
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(trigger?.getAttribute('aria-controls')).toBe(content?.id);
    expect(content?.getAttribute('role')).toBe('menu');
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(content?.hidden).toBe(false);
    expect(content?.querySelector('[data-slot="menu-label"]')?.getAttribute('role')).toBe(
      'presentation',
    );
    expect(content?.querySelector('[data-slot="menu-separator"]')?.getAttribute('role')).toBe(
      'separator',
    );
    expect(items[0]?.getAttribute('role')).toBe('menuitem');
    expect(items.every((item) => item.tabIndex === -1)).toBe(true);
    expect(document.activeElement).toBe(items[0]);
  });

  it('supports trigger keys and skips disabled items while navigating', async () => {
    const { items, trigger } = renderMenu();

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
    await Promise.resolve();
    expect(document.activeElement).toBe(items[2]);

    items[2]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    expect(document.activeElement).toBe(items[0]);

    items[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
    expect(document.activeElement).toBe(items[2]);

    items[2]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'r' }));
    expect(document.activeElement).toBe(items[0]);
  });

  it('emits cancelable selections and reports the close reason', async () => {
    const { items, menu, trigger } = renderMenu();
    const selectListener = vi.fn<(event: CustomEvent<GnomeMenuSelectDetail>) => void>();
    const closeListener = vi.fn<(event: CustomEvent<GnomeMenuCloseDetail>) => void>();
    menu.addEventListener('gnome-select', selectListener);
    menu.addEventListener('gnome-close', closeListener);
    menu.addEventListener('gnome-select', (event) => event.preventDefault(), { once: true });

    trigger?.click();
    await Promise.resolve();
    items[0]?.click();

    expect(menu.open).toBe(true);
    expect(selectListener.mock.calls[0]?.[0].detail).toEqual({
      item: items[0],
      value: 'rename',
    });

    items[2]?.click();

    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(closeListener.mock.calls[0]?.[0].detail).toEqual({
      reason: 'select',
    });
  });

  it('closes on Escape and outside pointer with cancelable requests', async () => {
    const { items, menu, trigger } = renderMenu();
    trigger?.click();
    await Promise.resolve();

    items[0]?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(trigger);

    menu.show();
    menu.addEventListener('gnome-cancel', (event) => event.preventDefault(), {
      once: true,
    });
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(menu.open).toBe(true);
  });

  it('rewires ARIA and items after an htmx-style content swap', async () => {
    const { content, menu, trigger } = renderMenu();
    menu.show();
    await Promise.resolve();

    const replacement = document.createElement('section');
    replacement.dataset.slot = 'menu-content';
    replacement.innerHTML = `
      <button type="button" data-menu-item data-value="share">Share</button>
    `;
    content?.replaceWith(replacement);
    await Promise.resolve();
    await Promise.resolve();

    const replacementItem = replacement.querySelector<HTMLElement>('[data-menu-item]');

    expect(trigger?.getAttribute('aria-controls')).toBe(replacement.id);
    expect(replacement.getAttribute('role')).toBe('menu');
    expect(replacement.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(replacement.hidden).toBe(false);
    expect(replacementItem?.getAttribute('role')).toBe('menuitem');
    expect(document.activeElement).toBe(replacementItem);
  });
});
