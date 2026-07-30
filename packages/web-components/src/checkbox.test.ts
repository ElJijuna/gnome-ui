import { describe, expect, it, vi } from 'vitest';

import { GnomeCheckboxElement } from './checkbox';

function renderCheckbox(
  controlMarkup = '<input type="checkbox" data-slot="checkbox-control" aria-label="Select item">',
) {
  const checkbox = document.createElement('gnome-checkbox');
  checkbox.innerHTML = controlMarkup;
  document.body.append(checkbox);

  return {
    checkbox,
    control: checkbox.querySelector<HTMLInputElement>('[data-slot="checkbox-control"]'),
  };
}

describe('GnomeCheckboxElement', () => {
  it('registers the custom element and exposes normalized defaults', () => {
    const { checkbox, control } = renderCheckbox();

    expect(customElements.get('gnome-checkbox')).toBe(GnomeCheckboxElement);
    expect(checkbox.control).toBe(control);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.indeterminate).toBe(false);
    expect(checkbox.dataset.state).toBe('ready');
  });

  it('proxies the checked property to the native control in both directions', () => {
    const { checkbox, control } = renderCheckbox();

    checkbox.checked = true;
    expect(control?.checked).toBe(true);

    control!.checked = false;
    expect(checkbox.checked).toBe(false);
  });

  it('applies the indeterminate property imperatively to the native control', () => {
    const { checkbox, control } = renderCheckbox();

    checkbox.indeterminate = true;
    expect(control?.indeterminate).toBe(true);

    checkbox.indeterminate = false;
    expect(control?.indeterminate).toBe(false);
  });

  it('fires a native change event when the control is toggled', () => {
    const { checkbox, control } = renderCheckbox();
    const changeListener = vi.fn();
    checkbox.addEventListener('change', changeListener);

    control?.click();

    expect(changeListener).toHaveBeenCalledOnce();
    expect(checkbox.checked).toBe(true);
  });

  it('maps disabled state to the native control', () => {
    const { checkbox, control } = renderCheckbox();

    checkbox.disabled = true;
    expect(checkbox.dataset.state).toBe('disabled');
    expect(checkbox.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);

    checkbox.disabled = false;
    expect(checkbox.dataset.state).toBe('ready');
    expect(control?.disabled).toBe(false);
  });

  it('preserves consumer-owned disabled state', async () => {
    const { checkbox, control } = renderCheckbox(
      '<input type="checkbox" data-slot="checkbox-control" aria-label="Select item" disabled>',
    );

    expect(control?.disabled).toBe(true);

    checkbox.disabled = true;
    checkbox.disabled = false;

    expect(control?.disabled).toBe(true);

    control?.removeAttribute('disabled');
    await Promise.resolve();
    checkbox.disabled = true;
    checkbox.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('proxies focus and click to the native control', () => {
    const { checkbox, control } = renderCheckbox();

    checkbox.focus();
    expect(document.activeElement).toBe(control);

    checkbox.click();
    expect(control?.checked).toBe(true);
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { checkbox, control: original } = renderCheckbox();
    checkbox.disabled = true;
    checkbox.indeterminate = true;

    const replacement = document.createElement('input');
    replacement.type = 'checkbox';
    replacement.dataset.slot = 'checkbox-control';
    replacement.setAttribute('aria-label', 'Select item');
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(checkbox.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(replacement.indeterminate).toBe(true);
  });
});
