import { describe, expect, it } from 'vitest';

import { GnomeLinkedGroupElement } from './linked-group';

function renderGroup(attrs: Record<string, string> = {}) {
  const group = document.createElement('gnome-linked-group');

  for (const [name, value] of Object.entries(attrs)) {
    group.setAttribute(name, value);
  }

  document.body.append(group);

  return group;
}

describe('GnomeLinkedGroupElement', () => {
  it('registers the custom element and defaults to horizontal', () => {
    const group = renderGroup();

    expect(customElements.get('gnome-linked-group')).toBe(GnomeLinkedGroupElement);
    expect(group.vertical).toBe(false);
    expect(group.hasAttribute('vertical')).toBe(false);
  });

  it('reflects the vertical attribute to the property', () => {
    const group = renderGroup({ vertical: '' });

    expect(group.vertical).toBe(true);
  });

  it('reflects the vertical property back to the attribute', () => {
    const group = renderGroup();

    group.vertical = true;
    expect(group.hasAttribute('vertical')).toBe(true);

    group.vertical = false;
    expect(group.hasAttribute('vertical')).toBe(false);
  });

  it('keeps light-DOM children intact', () => {
    const group = renderGroup();
    group.innerHTML = '<button>Cut</button><button>Copy</button><button>Paste</button>';

    expect(group.children).toHaveLength(3);
    expect(group.children[1].textContent).toBe('Copy');
  });
});
