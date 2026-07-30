import { describe, expect, it } from 'vitest';

import { GnomeSpinnerElement } from './spinner';

function renderSpinner(attrs: Record<string, string> = {}) {
  const spinner = document.createElement('gnome-spinner');

  for (const [name, value] of Object.entries(attrs)) {
    spinner.setAttribute(name, value);
  }

  document.body.append(spinner);

  return spinner;
}

describe('GnomeSpinnerElement', () => {
  it('registers the custom element and applies role=status with the default label', () => {
    const spinner = renderSpinner();

    expect(customElements.get('gnome-spinner')).toBe(GnomeSpinnerElement);
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.size).toBe('md');
    expect(spinner.dataset.size).toBe('md');
    expect(spinner.label).toBe('Loading…');
    expect(spinner.getAttribute('aria-label')).toBe('Loading…');
    expect(spinner.hasAttribute('aria-hidden')).toBe(false);
  });

  it('does not override a consumer-set role', () => {
    const spinner = renderSpinner({ role: 'presentation' });

    expect(spinner.getAttribute('role')).toBe('presentation');
  });

  it('reflects size to a dataset attribute for CSS', () => {
    const spinner = renderSpinner();

    spinner.size = 'lg';
    expect(spinner.dataset.size).toBe('lg');

    spinner.size = 'sm';
    expect(spinner.dataset.size).toBe('sm');
  });

  it('uses a custom label when provided', () => {
    const spinner = renderSpinner({ label: 'Fetching results…' });

    expect(spinner.getAttribute('aria-label')).toBe('Fetching results…');
    expect(spinner.hasAttribute('aria-hidden')).toBe(false);
  });

  it('silences the spinner from assistive tech when label is set to an empty string', () => {
    const spinner = renderSpinner({ label: '' });

    expect(spinner.label).toBe('');
    expect(spinner.hasAttribute('aria-label')).toBe(false);
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
  });

  it('updates aria state reactively when the label property changes', () => {
    const spinner = renderSpinner();

    spinner.label = '';
    expect(spinner.getAttribute('aria-hidden')).toBe('true');

    spinner.label = 'Loading dashboard…';
    expect(spinner.getAttribute('aria-label')).toBe('Loading dashboard…');
    expect(spinner.hasAttribute('aria-hidden')).toBe(false);
  });
});
