import { describe, expect, it } from 'vitest';

import { GnomeProgressBarElement } from './progress-bar';

function renderProgressBar(attrs: Record<string, string> = {}) {
  const bar = document.createElement('gnome-progress-bar');

  for (const [name, value] of Object.entries(attrs)) {
    bar.setAttribute(name, value);
  }

  document.body.append(bar);

  return bar;
}

describe('GnomeProgressBarElement', () => {
  it('registers the custom element and defaults to accent/indeterminate', () => {
    const bar = renderProgressBar();

    expect(customElements.get('gnome-progress-bar')).toBe(GnomeProgressBarElement);
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.variant).toBe('accent');
    expect(bar.value).toBeUndefined();
    expect(bar.hasAttribute('data-indeterminate')).toBe(true);
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('does not override a consumer-set role', () => {
    const bar = renderProgressBar({ role: 'presentation' });

    expect(bar.getAttribute('role')).toBe('presentation');
  });

  it('computes aria-value* and the fill custom property for a determinate value', () => {
    const bar = renderProgressBar({ value: '0.6' });

    expect(bar.hasAttribute('data-indeterminate')).toBe(false);
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.style.getPropertyValue('--gnome-progress-value')).toBe('60%');
  });

  it('clamps out-of-range values to 0..1', () => {
    const over = renderProgressBar({ value: '1.5' });
    expect(over.value).toBe(1);
    expect(over.getAttribute('aria-valuenow')).toBe('100');

    const under = renderProgressBar({ value: '-0.5' });
    expect(under.value).toBe(0);
    expect(under.getAttribute('aria-valuenow')).toBe('0');
  });

  it('switches to indeterminate when value is removed', () => {
    const bar = renderProgressBar({ value: '0.4' });

    bar.value = undefined;

    expect(bar.hasAttribute('data-indeterminate')).toBe(true);
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
    expect(bar.style.getPropertyValue('--gnome-progress-value')).toBe('');
  });

  it('reflects variant to a dataset attribute', () => {
    const bar = renderProgressBar({ value: '0.5' });

    bar.variant = 'success';
    expect(bar.dataset.variant).toBe('success');

    bar.variant = 'error';
    expect(bar.dataset.variant).toBe('error');
  });

  it('updates state reactively through the value/variant properties', () => {
    const bar = renderProgressBar();

    bar.value = 0.25;
    expect(bar.getAttribute('aria-valuenow')).toBe('25');
    expect(bar.style.getPropertyValue('--gnome-progress-value')).toBe('25%');
  });
});
