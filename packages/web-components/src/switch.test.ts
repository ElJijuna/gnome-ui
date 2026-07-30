import { describe, expect, it, vi } from 'vitest';

import { GnomeSwitchElement } from './switch';

function renderSwitch(
  controlMarkup = '<input type="checkbox" role="switch" data-slot="switch-control" aria-label="Wi-Fi">',
) {
  const gnomeSwitch = document.createElement('gnome-switch');
  gnomeSwitch.innerHTML = controlMarkup;
  document.body.append(gnomeSwitch);

  return {
    control: gnomeSwitch.querySelector<HTMLInputElement>('[data-slot="switch-control"]'),
    switch: gnomeSwitch,
  };
}

describe('GnomeSwitchElement', () => {
  it('registers the custom element and exposes normalized defaults', () => {
    const { switch: gnomeSwitch, control } = renderSwitch();

    expect(customElements.get('gnome-switch')).toBe(GnomeSwitchElement);
    expect(gnomeSwitch.control).toBe(control);
    expect(gnomeSwitch.checked).toBe(false);
    expect(gnomeSwitch.dataset.state).toBe('ready');
  });

  it('proxies the checked property to the native control in both directions', () => {
    const { switch: gnomeSwitch, control } = renderSwitch();

    gnomeSwitch.checked = true;
    expect(control?.checked).toBe(true);

    control!.checked = false;
    expect(gnomeSwitch.checked).toBe(false);
  });

  it('fires a native change event when the control is toggled', () => {
    const { switch: gnomeSwitch, control } = renderSwitch();
    const changeListener = vi.fn();
    gnomeSwitch.addEventListener('change', changeListener);

    control?.click();

    expect(changeListener).toHaveBeenCalledOnce();
    expect(gnomeSwitch.checked).toBe(true);
  });

  it('maps disabled state to the native control', () => {
    const { switch: gnomeSwitch, control } = renderSwitch();

    gnomeSwitch.disabled = true;
    expect(gnomeSwitch.dataset.state).toBe('disabled');
    expect(gnomeSwitch.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);

    gnomeSwitch.disabled = false;
    expect(gnomeSwitch.dataset.state).toBe('ready');
    expect(control?.disabled).toBe(false);
  });

  it('preserves consumer-owned disabled state', async () => {
    const { switch: gnomeSwitch, control } = renderSwitch(
      '<input type="checkbox" role="switch" data-slot="switch-control" aria-label="Wi-Fi" disabled>',
    );

    expect(control?.disabled).toBe(true);

    gnomeSwitch.disabled = true;
    gnomeSwitch.disabled = false;

    expect(control?.disabled).toBe(true);

    control?.removeAttribute('disabled');
    await Promise.resolve();
    gnomeSwitch.disabled = true;
    gnomeSwitch.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus and click to the native control', () => {
    const { switch: gnomeSwitch, control } = renderSwitch();

    gnomeSwitch.focus();
    expect(document.activeElement).toBe(control);

    gnomeSwitch.click();
    expect(control?.checked).toBe(true);
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { switch: gnomeSwitch, control: original } = renderSwitch();
    gnomeSwitch.disabled = true;

    const replacement = document.createElement('input');
    replacement.type = 'checkbox';
    replacement.setAttribute('role', 'switch');
    replacement.dataset.slot = 'switch-control';
    replacement.setAttribute('aria-label', 'Wi-Fi');
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(gnomeSwitch.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
  });
});
