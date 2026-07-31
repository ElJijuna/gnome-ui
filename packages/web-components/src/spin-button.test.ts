import { describe, expect, it, vi } from 'vitest';

import { GnomeSpinButtonElement } from './spin-button';

function renderSpinButton(controlAttrs = 'value="5" min="0" max="10" step="1"', markup?: string) {
  const spin = document.createElement('gnome-spin-button');
  spin.innerHTML =
    markup ??
    `
    <button type="button" data-slot="spin-button-decrement" aria-hidden="true" tabindex="-1">−</button>
    <input type="number" data-slot="spin-button-control" aria-label="Volume" ${controlAttrs} />
    <button type="button" data-slot="spin-button-increment" aria-hidden="true" tabindex="-1">+</button>
  `;
  document.body.append(spin);

  return {
    control: spin.querySelector<HTMLInputElement>('[data-slot="spin-button-control"]'),
    decrement: spin.querySelector<HTMLButtonElement>('[data-slot="spin-button-decrement"]'),
    increment: spin.querySelector<HTMLButtonElement>('[data-slot="spin-button-increment"]'),
    spin,
  };
}

describe('GnomeSpinButtonElement', () => {
  it('registers the custom element and exposes the current numeric value', () => {
    const { spin, control } = renderSpinButton();

    expect(customElements.get('gnome-spin-button')).toBe(GnomeSpinButtonElement);
    expect(spin.control).toBe(control);
    expect(spin.value).toBe(5);
  });

  it('increments and decrements via the native control, dispatching change', () => {
    const { spin, control, increment, decrement } = renderSpinButton();
    const changeListener = vi.fn();
    spin.addEventListener('change', changeListener);

    increment?.click();
    expect(control?.value).toBe('6');
    expect(changeListener).toHaveBeenCalledOnce();

    decrement?.click();
    decrement?.click();
    expect(control?.value).toBe('4');
    expect(changeListener).toHaveBeenCalledTimes(3);
  });

  it('disables the decrement button at min and the increment button at max', () => {
    const { control, increment, decrement } = renderSpinButton(
      'value="9" min="0" max="10" step="1"',
    );

    expect(decrement?.disabled).toBe(false);
    expect(increment?.disabled).toBe(false);

    increment?.click();
    expect(control?.value).toBe('10');
    expect(increment?.disabled).toBe(true);
    expect(decrement?.disabled).toBe(false);
  });

  it('re-syncs button bounds when the control value changes via native input event', () => {
    const { control, increment } = renderSpinButton('value="10" min="0" max="10" step="1"');

    expect(increment?.disabled).toBe(true);

    control!.value = '5';
    control?.dispatchEvent(new Event('input', { bubbles: true }));

    expect(increment?.disabled).toBe(false);
  });

  it('setting value through the host property updates the control and button bounds', () => {
    const { spin, control, increment } = renderSpinButton();

    spin.value = 10;
    expect(control?.value).toBe('10');
    expect(increment?.disabled).toBe(true);
  });

  it('maps disabled state to the control and both buttons', () => {
    const { spin, control, increment, decrement } = renderSpinButton();

    spin.disabled = true;
    expect(spin.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);
    expect(increment?.disabled).toBe(true);
    expect(decrement?.disabled).toBe(true);

    spin.disabled = false;
    expect(control?.disabled).toBe(false);
    expect(increment?.disabled).toBe(false);
    expect(decrement?.disabled).toBe(false);
  });

  it('ignores clicks while disabled', () => {
    const { spin, control, increment } = renderSpinButton();
    spin.disabled = true;

    increment?.click();
    expect(control?.value).toBe('5');
  });

  it('preserves consumer-owned disabled state', async () => {
    const { spin, control } = renderSpinButton('value="5" min="0" max="10" step="1" disabled');

    expect(control?.disabled).toBe(true);

    spin.disabled = true;
    spin.disabled = false;
    expect(control?.disabled).toBe(true);

    control?.removeAttribute('disabled');
    await Promise.resolve();
    spin.disabled = true;
    spin.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus to the native control', () => {
    const { spin, control } = renderSpinButton();

    spin.focus();
    expect(document.activeElement).toBe(control);
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { spin, control: original, increment } = renderSpinButton();
    spin.disabled = true;

    const replacement = document.createElement('input');
    replacement.type = 'number';
    replacement.dataset.slot = 'spin-button-control';
    replacement.value = '5';
    replacement.min = '0';
    replacement.max = '10';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(spin.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(increment?.disabled).toBe(true);
  });
});
