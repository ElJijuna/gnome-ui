import { describe, expect, it, vi } from 'vitest';

import { GnomeCalloutElement } from './callout';

function renderCallout(
  markup = `
    <svg data-slot="callout-icon"></svg>
    <span>This setting can't be changed later.</span>
    <button type="button" data-dismiss aria-label="Dismiss">×</button>
  `,
) {
  const callout = document.createElement('gnome-callout');
  callout.innerHTML = markup;
  document.body.append(callout);

  return {
    callout,
    dismissButton: callout.querySelector<HTMLButtonElement>('[data-dismiss]'),
  };
}

describe('GnomeCalloutElement', () => {
  it('registers the custom element and defaults to role note and variant info', () => {
    const { callout } = renderCallout();

    expect(customElements.get('gnome-callout')).toBe(GnomeCalloutElement);
    expect(callout.getAttribute('role')).toBe('note');
    expect(callout.variant).toBe('info');
  });

  it('reflects the variant attribute', () => {
    const { callout } = renderCallout();

    callout.variant = 'warning';
    expect(callout.getAttribute('variant')).toBe('warning');

    callout.variant = 'tip';
    expect(callout.getAttribute('variant')).toBe('tip');
  });

  it('emits gnome-dismiss when a data-dismiss descendant is clicked, without hiding itself', () => {
    const { callout, dismissButton } = renderCallout();
    const listener = vi.fn();
    callout.addEventListener('gnome-dismiss', listener);

    dismissButton?.click();

    expect(listener).toHaveBeenCalledOnce();
    expect(callout.hidden).toBe(false);
    expect(callout.isConnected).toBe(true);
  });

  it('does not emit gnome-dismiss for clicks outside a data-dismiss descendant', () => {
    const { callout } = renderCallout();
    const listener = vi.fn();
    callout.addEventListener('gnome-dismiss', listener);

    callout.querySelector('span')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(listener).not.toHaveBeenCalled();
  });

  it('works without a dismiss button or icon', () => {
    const { callout } = renderCallout('<span>Just a message.</span>');

    expect(() => callout.querySelector('span')?.click()).not.toThrow();
  });
});
