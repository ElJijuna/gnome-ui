import { describe, expect, it } from 'vitest';

import { GnomeTextFieldElement } from './text-field';

function renderTextField(
  markup = `
    <label data-slot="text-field-label">Username</label>
    <input type="text" data-slot="text-field-control" />
    <span data-slot="text-field-hint">Choose a unique handle.</span>
  `,
) {
  const field = document.createElement('gnome-text-field');
  field.innerHTML = markup;
  document.body.append(field);

  return {
    control: field.querySelector<HTMLInputElement>('[data-slot="text-field-control"]'),
    field,
    hint: field.querySelector<HTMLElement>('[data-slot="text-field-hint"]'),
  };
}

describe('GnomeTextFieldElement', () => {
  it('registers the custom element and links the label and hint to the control', () => {
    const { field, control, hint } = renderTextField();
    const label = field.querySelector<HTMLLabelElement>('[data-slot="text-field-label"]');

    expect(customElements.get('gnome-text-field')).toBe(GnomeTextFieldElement);
    expect(field.control).toBe(control);
    expect(hint?.id).toBeTruthy();
    expect(control?.getAttribute('aria-describedby')).toBe(hint?.id);
    expect(control?.id).toBeTruthy();
    expect(label?.htmlFor).toBe(control?.id);
  });

  it('removes aria-describedby when the hint is absent', () => {
    const { control } = renderTextField(
      '<input type="text" data-slot="text-field-control" />',
    );

    expect(control?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('proxies the value property to the native control in both directions', () => {
    const { field, control } = renderTextField();

    field.value = 'octocat';
    expect(control?.value).toBe('octocat');

    control!.value = 'changed';
    expect(field.value).toBe('changed');
  });

  it('maps disabled state to the native control, dimming the whole wrapper', () => {
    const { field, control } = renderTextField();

    field.disabled = true;
    expect(field.hasAttribute('data-disabled')).toBe(true);
    expect(control?.disabled).toBe(true);

    field.disabled = false;
    expect(field.hasAttribute('data-disabled')).toBe(false);
    expect(control?.disabled).toBe(false);
  });

  it('maps invalid state to aria-invalid on the native control', () => {
    const { field, control } = renderTextField();

    field.invalid = true;
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    field.invalid = false;
    expect(control?.hasAttribute('aria-invalid')).toBe(false);
  });

  it('preserves consumer-owned disabled and aria-invalid state', async () => {
    const { field, control } = renderTextField(`
      <input type="text" data-slot="text-field-control" disabled aria-invalid="false" />
    `);

    field.invalid = true;
    expect(control?.getAttribute('aria-invalid')).toBe('true');

    field.invalid = false;
    expect(control?.disabled).toBe(true);
    expect(control?.getAttribute('aria-invalid')).toBe('false');

    control?.removeAttribute('disabled');
    await Promise.resolve();
    field.disabled = true;
    field.disabled = false;

    expect(control?.disabled).toBe(false);
  });

  it('delegates validity, checkValidity, and setCustomValidity to the native control', () => {
    const { field, control } = renderTextField(
      '<input type="text" required data-slot="text-field-control" />',
    );

    expect(field.checkValidity()).toBe(false);
    expect(field.validity?.valueMissing).toBe(true);

    field.setCustomValidity('Custom message');
    expect(control?.validationMessage).toBe('Custom message');

    field.setCustomValidity('');
    control!.value = 'octocat';
    expect(field.checkValidity()).toBe(true);
  });

  it('proxies focus to the native control', () => {
    const { field, control } = renderTextField();

    field.focus();
    expect(document.activeElement).toBe(control);
  });

  it('restores and reconnects native state after an htmx-style control swap', async () => {
    const { field, control: original } = renderTextField();
    field.disabled = true;
    field.invalid = true;

    const replacement = document.createElement('input');
    replacement.type = 'text';
    replacement.dataset.slot = 'text-field-control';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(original?.disabled).toBe(false);
    expect(original?.hasAttribute('aria-invalid')).toBe(false);
    expect(field.control).toBe(replacement);
    expect(replacement.disabled).toBe(true);
    expect(replacement.getAttribute('aria-invalid')).toBe('true');
    expect(replacement.getAttribute('aria-describedby')).toBeTruthy();
  });
});
