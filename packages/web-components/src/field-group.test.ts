import { describe, expect, it } from 'vitest';

import { GnomeFieldGroupElement } from './field-group';

function renderFieldGroup(setup?: (el: GnomeFieldGroupElement) => void) {
  const group = document.createElement('gnome-field-group') as GnomeFieldGroupElement;
  setup?.(group);
  document.body.append(group);

  return group;
}

function fieldset(group: Element) {
  return group.querySelector<HTMLFieldSetElement>('[data-slot="field-group-fieldset"]');
}

describe('GnomeFieldGroupElement', () => {
  it('registers the custom element', () => {
    renderFieldGroup();
    expect(customElements.get('gnome-field-group')).toBe(GnomeFieldGroupElement);
  });

  it('wraps a real <fieldset>', () => {
    const group = renderFieldGroup();
    expect(fieldset(group)?.tagName).toBe('FIELDSET');
  });

  it('renders the label as a <legend>', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
    });

    const legend = fieldset(group)?.querySelector('[data-slot="field-group-legend"]');
    expect(legend?.tagName).toBe('LEGEND');
    expect(legend?.textContent).toBe('Notifications');
  });

  it('moves original light-DOM children into a generated content div', () => {
    const group = document.createElement('gnome-field-group') as GnomeFieldGroupElement;
    group.label = 'Notifications';
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Enable';
    group.append(button);
    document.body.append(group);

    const content = fieldset(group)?.querySelector('[data-slot="field-group-content"]');
    expect(content?.contains(button)).toBe(true);
  });

  it('renders helper text below the label', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.helperText = 'Choose how you want to be notified.';
    });

    const hint = fieldset(group)?.querySelector('[data-slot="field-group-hint"]');
    expect(hint?.textContent).toBe('Choose how you want to be notified.');
  });

  it('renders error message instead of helper text', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.helperText = 'Helper';
      el.error = 'Select at least one option.';
    });

    const hint = fieldset(group)?.querySelector('[data-slot="field-group-hint"]');
    expect(hint?.textContent).toBe('Select at least one option.');
  });

  it('does not render a hint element when neither helperText nor error is set', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
    });

    expect(fieldset(group)?.querySelector('[data-slot="field-group-hint"]')).toBeNull();
  });

  it('removes the hint when helperText/error are later cleared', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.helperText = 'Hint';
    });

    expect(fieldset(group)?.querySelector('[data-slot="field-group-hint"]')).not.toBeNull();

    group.helperText = '';
    expect(fieldset(group)?.querySelector('[data-slot="field-group-hint"]')).toBeNull();
  });

  it('sets aria-describedby on the fieldset when helperText is present', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.helperText = 'Hint';
    });

    expect(fieldset(group)?.hasAttribute('aria-describedby')).toBe(true);
  });

  it('does not set aria-describedby when neither helperText nor error is set', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
    });

    expect(fieldset(group)?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('gives the error message role="alert"', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.error = 'Select at least one option.';
    });

    expect(
      fieldset(group)?.querySelector('[data-slot="field-group-hint"]')?.getAttribute('role'),
    ).toBe('alert');
  });

  it('does not give helper text role="alert"', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.helperText = 'Hint';
    });

    expect(
      fieldset(group)?.querySelector('[data-slot="field-group-hint"]')?.hasAttribute('role'),
    ).toBe(false);
  });

  it('disables the fieldset', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
      el.disabled = true;
    });

    expect(fieldset(group)?.disabled).toBe(true);
  });

  // jsdom doesn't implement the browser's native fieldset->descendant
  // disabled cascade (a plain `<fieldset disabled><button>` leaves
  // button.disabled false in jsdom), so that part is only verifiable in a
  // real browser — see e2e/field-group.spec.ts. Here we only confirm the
  // descendant control actually ends up inside the disabled fieldset.
  it('moves descendant form controls inside the disabled fieldset', () => {
    const group = document.createElement('gnome-field-group') as GnomeFieldGroupElement;
    group.label = 'Notifications';
    group.disabled = true;
    const button = document.createElement('button');
    button.type = 'button';
    group.append(button);
    document.body.append(group);

    expect(fieldset(group)?.disabled).toBe(true);
    expect(fieldset(group)?.contains(button)).toBe(true);
  });

  it('does not rebuild the fieldset on repeated attribute changes', () => {
    const group = renderFieldGroup((el) => {
      el.label = 'Notifications';
    });

    const first = fieldset(group);
    group.label = 'Updated';
    expect(fieldset(group)).toBe(first);
  });
});
