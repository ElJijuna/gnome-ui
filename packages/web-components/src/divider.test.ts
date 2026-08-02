import { describe, expect, it } from 'vitest';

import { GnomeDividerElement } from './divider';

function renderDivider() {
  const divider = document.createElement('gnome-divider');
  document.body.append(divider);

  return divider;
}

describe('GnomeDividerElement', () => {
  it('registers the custom element and defaults to a bare horizontal separator', () => {
    const divider = renderDivider();

    expect(customElements.get('gnome-divider')).toBe(GnomeDividerElement);
    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    expect(divider.querySelectorAll('[data-slot="divider-line"]')).toHaveLength(1);
    expect(divider.querySelector('[data-slot="divider-label"]')).toBeNull();
    expect(divider.hasAttribute('aria-label')).toBe(false);
  });

  it('adds a centered label between two lines when label is set', () => {
    const divider = renderDivider();

    divider.label = 'OR';

    expect(divider.getAttribute('aria-label')).toBe('OR');
    expect(divider.querySelectorAll('[data-slot="divider-line"]')).toHaveLength(2);
    expect(divider.querySelector('[data-slot="divider-label"]')?.textContent).toBe('OR');
  });

  it('updates the label text in place without rebuilding the lines', () => {
    const divider = renderDivider();
    divider.label = 'OR';

    const lineBefore = divider.querySelector('[data-slot="divider-line"]');
    divider.label = 'Continue with Google';

    expect(divider.querySelector('[data-slot="divider-line"]')).toBe(lineBefore);
    expect(divider.querySelector('[data-slot="divider-label"]')?.textContent).toBe(
      'Continue with Google',
    );
  });

  it('reverts to a single bare line and removes aria-label when the label is cleared', () => {
    const divider = renderDivider();
    divider.label = 'OR';

    divider.label = '';

    expect(divider.hasAttribute('aria-label')).toBe(false);
    expect(divider.querySelectorAll('[data-slot="divider-line"]')).toHaveLength(1);
    expect(divider.querySelector('[data-slot="divider-label"]')).toBeNull();
  });
});
