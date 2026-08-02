import { describe, expect, it } from 'vitest';

import { GnomeComboRowElement } from './combo-row';
import './dropdown';

function renderComboRow(
  markup = `
    <span data-slot="row-prefix">P</span>
    <span data-slot="row-title">Theme</span>
    <span data-slot="row-subtitle">Choose your preferred color scheme</span>
    <gnome-dropdown data-slot="row-suffix" value="dark" placeholder="Select a theme">
      <button type="button" data-slot="dropdown-trigger"></button>
      <ul data-slot="dropdown-content">
        <li data-option data-value="light">Light</li>
        <li data-option data-value="dark">Dark</li>
      </ul>
    </gnome-dropdown>
  `,
) {
  const comboRow = document.createElement('gnome-combo-row');
  comboRow.innerHTML = markup;
  document.body.append(comboRow);

  return {
    comboRow,
    dropdown: comboRow.querySelector('gnome-dropdown'),
  };
}

describe('GnomeComboRowElement', () => {
  it('registers the custom element', () => {
    renderComboRow();
    expect(customElements.get('gnome-combo-row')).toBe(GnomeComboRowElement);
  });

  it('lets the nested gnome-dropdown register and behave on its own', () => {
    const { dropdown } = renderComboRow();

    expect(dropdown?.querySelector('[data-slot="dropdown-trigger"]')?.getAttribute('role')).toBe(
      'combobox',
    );
    expect(dropdown?.querySelector('[data-slot="dropdown-value"]')?.textContent).toBe('Dark');
  });

  it('forwards disabled to the first suffix element that exposes it', () => {
    const { comboRow, dropdown } = renderComboRow();

    comboRow.disabled = true;

    expect(comboRow.hasAttribute('data-disabled')).toBe(true);
    expect((dropdown as HTMLElement & { disabled: boolean }).disabled).toBe(true);

    comboRow.disabled = false;
    expect((dropdown as HTMLElement & { disabled: boolean }).disabled).toBe(false);
  });

  it('does nothing when the suffix has no disabled-capable element', () => {
    const { comboRow } = renderComboRow(`
      <span data-slot="row-title">Plain row</span>
      <span data-slot="row-suffix">Just text</span>
    `);

    expect(() => {
      comboRow.disabled = true;
    }).not.toThrow();
    expect(comboRow.hasAttribute('data-disabled')).toBe(true);
  });

  it('re-syncs disabled after the suffix content is swapped (htmx-style)', async () => {
    const { comboRow, dropdown } = renderComboRow();
    comboRow.disabled = true;
    expect((dropdown as HTMLElement & { disabled: boolean }).disabled).toBe(true);

    const suffix = comboRow.querySelector('[data-slot="row-suffix"]') as HTMLElement;
    const replacement = document.createElement('gnome-dropdown');
    replacement.dataset.slot = 'row-suffix';
    replacement.innerHTML = `
      <button type="button" data-slot="dropdown-trigger"></button>
      <ul data-slot="dropdown-content">
        <li data-option data-value="a">A</li>
      </ul>
    `;
    suffix.replaceWith(replacement);
    await Promise.resolve();

    expect((replacement as HTMLElement & { disabled: boolean }).disabled).toBe(true);
  });
});
