import { describe, expect, it } from 'vitest';

import { GnomeBadgeElement } from './badge';

function renderBadge(attrs: Record<string, string> = {}, content = '3') {
  const badge = document.createElement('gnome-badge');

  for (const [name, value] of Object.entries(attrs)) {
    badge.setAttribute(name, value);
  }

  badge.textContent = content;
  document.body.append(badge);

  return badge;
}

describe('GnomeBadgeElement', () => {
  it('registers the custom element and defaults to the accent variant', () => {
    const badge = renderBadge();

    expect(customElements.get('gnome-badge')).toBe(GnomeBadgeElement);
    expect(badge.variant).toBe('accent');
    expect(badge.dot).toBe(false);
    expect(badge.anchored).toBe(false);
  });

  it('falls back to accent for an unrecognized variant attribute', () => {
    const badge = renderBadge({ variant: 'not-a-real-variant' });

    expect(badge.variant).toBe('accent');
  });

  it('reflects a valid variant attribute', () => {
    const badge = renderBadge({ variant: 'success' });

    expect(badge.variant).toBe('success');
  });

  it('reflects variant, dot, and anchored properties back to attributes', () => {
    const badge = renderBadge();

    badge.variant = 'error';
    expect(badge.getAttribute('variant')).toBe('error');

    badge.dot = true;
    expect(badge.hasAttribute('dot')).toBe(true);

    badge.anchored = true;
    expect(badge.hasAttribute('anchored')).toBe(true);

    badge.dot = false;
    expect(badge.hasAttribute('dot')).toBe(false);
  });

  it('keeps light-DOM text content intact regardless of dot/anchored state', () => {
    const badge = renderBadge({ dot: '' }, '3');

    expect(badge.textContent).toBe('3');
  });
});
