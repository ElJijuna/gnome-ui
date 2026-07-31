import { describe, expect, it } from 'vitest';

import { GnomeBoxedListElement } from './boxed-list';

function renderList(markup: string, attrs: Record<string, string> = {}) {
  const list = document.createElement('gnome-boxed-list');

  for (const [name, value] of Object.entries(attrs)) {
    list.setAttribute(name, value);
  }

  list.innerHTML = markup;
  document.body.append(list);

  return list;
}

const ROWS =
  '<div>First row</div><div>Second row</div><div>Third row</div>';

describe('GnomeBoxedListElement', () => {
  it('registers the custom element and defaults role=list, variant=default', () => {
    const list = renderList(ROWS);

    expect(customElements.get('gnome-boxed-list')).toBe(GnomeBoxedListElement);
    expect(list.getAttribute('role')).toBe('list');
    expect(list.variant).toBe('default');
  });

  it('respects a consumer-authored role instead of overwriting it', () => {
    const list = document.createElement('gnome-boxed-list');
    list.setAttribute('role', 'group');
    document.body.append(list);

    expect(list.getAttribute('role')).toBe('group');
  });

  it('gives every direct child role=listitem', () => {
    const list = renderList(ROWS);

    for (const child of list.children) {
      expect(child.getAttribute('role')).toBe('listitem');
    }
  });

  it('respects a child that already has its own role', () => {
    const list = renderList('<div role="button">Not a row</div><div>Row</div>');

    expect(list.children[0].getAttribute('role')).toBe('button');
    expect(list.children[1].getAttribute('role')).toBe('listitem');
  });

  it('applies role=listitem to children added after connection (htmx-style append)', async () => {
    const list = renderList('<div>First row</div>');

    const appended = document.createElement('div');
    appended.textContent = 'Second row';
    list.append(appended);

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(appended.getAttribute('role')).toBe('listitem');
  });

  it('reflects the variant property to the attribute and normalizes invalid values', () => {
    const list = renderList(ROWS);

    list.variant = 'separate';
    expect(list.getAttribute('variant')).toBe('separate');

    list.setAttribute('variant', 'nonsense');
    expect(list.variant).toBe('default');
  });

  it('stops observing children after being disconnected', async () => {
    const list = renderList('<div>First row</div>');
    list.remove();

    const appended = document.createElement('div');
    appended.textContent = 'Second row';
    list.append(appended);

    await new Promise((resolve) => queueMicrotask(resolve));

    expect(appended.hasAttribute('role')).toBe(false);
  });
});
