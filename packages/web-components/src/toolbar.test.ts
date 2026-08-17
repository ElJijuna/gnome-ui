import { describe, expect, it } from 'vitest';

import { GnomeToolbarElement } from './toolbar';

function renderToolbar() {
  const toolbar = document.createElement('gnome-toolbar');
  document.body.append(toolbar);

  return toolbar;
}

describe('GnomeToolbarElement', () => {
  it('registers the custom element', () => {
    const toolbar = renderToolbar();

    expect(customElements.get('gnome-toolbar')).toBe(GnomeToolbarElement);
    expect(toolbar).toBeInstanceOf(GnomeToolbarElement);
  });

  it('sets no attributes or role of its own', () => {
    const toolbar = renderToolbar();

    expect(toolbar.attributes).toHaveLength(0);
  });

  it('keeps consumer-authored light-DOM children in place, in order', () => {
    const toolbar = renderToolbar();
    toolbar.innerHTML = '<gnome-button>Back</gnome-button><gnome-divider></gnome-divider>';

    expect(toolbar.children).toHaveLength(2);
    expect(toolbar.children[0].tagName.toLowerCase()).toBe('gnome-button');
    expect(toolbar.children[1].tagName.toLowerCase()).toBe('gnome-divider');
  });
});
