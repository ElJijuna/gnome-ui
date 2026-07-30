import { describe, expect, it } from 'vitest';

import { GnomeSeparatorElement } from './separator';

function renderSeparator(attrs: Record<string, string> = {}) {
  const separator = document.createElement('gnome-separator');

  for (const [name, value] of Object.entries(attrs)) {
    separator.setAttribute(name, value);
  }

  document.body.append(separator);

  return separator;
}

describe('GnomeSeparatorElement', () => {
  it('registers the custom element and defaults to horizontal with role=separator', () => {
    const separator = renderSeparator();

    expect(customElements.get('gnome-separator')).toBe(GnomeSeparatorElement);
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.dataset.orientation).toBe('horizontal');
    expect(separator.hasAttribute('aria-orientation')).toBe(false);
  });

  it('sets aria-orientation and the data-orientation attribute for vertical', () => {
    const separator = renderSeparator({ orientation: 'vertical' });

    expect(separator.dataset.orientation).toBe('vertical');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('removes aria-orientation when switching back to horizontal', () => {
    const separator = renderSeparator({ orientation: 'vertical' });
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');

    separator.setAttribute('orientation', 'horizontal');
    expect(separator.hasAttribute('aria-orientation')).toBe(false);
    expect(separator.dataset.orientation).toBe('horizontal');
  });

  it('treats an invalid orientation value as horizontal', () => {
    const separator = renderSeparator({ orientation: 'diagonal' });

    expect(separator.orientation).toBe('horizontal');
    expect(separator.dataset.orientation).toBe('horizontal');
  });

  it('respects a consumer-authored role instead of overwriting it', () => {
    const separator = document.createElement('gnome-separator');
    separator.setAttribute('role', 'none');
    document.body.append(separator);

    expect(separator.getAttribute('role')).toBe('none');
  });

  it('reflects the orientation property to the attribute', () => {
    const separator = renderSeparator();

    separator.orientation = 'vertical';
    expect(separator.getAttribute('orientation')).toBe('vertical');
  });
});
