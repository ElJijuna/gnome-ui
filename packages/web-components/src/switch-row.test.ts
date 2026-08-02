import { describe, expect, it, vi } from 'vitest';

import { type GnomeSwitchRowChangeDetail, GnomeSwitchRowElement } from './switch-row';

function renderSwitchRow(
  markup = `
    <span data-slot="row-prefix">🔔</span>
    <span data-slot="row-title">Notifications</span>
    <span data-slot="row-subtitle">Get notified about updates</span>
  `,
) {
  const switchRow = document.createElement('gnome-switch-row');
  switchRow.innerHTML = markup;
  document.body.append(switchRow);

  return {
    surface: switchRow.querySelector<HTMLButtonElement>('[data-slot="row-surface"]'),
    switchRow,
  };
}

describe('GnomeSwitchRowElement', () => {
  it('registers the custom element and wraps a real button surface', () => {
    const { surface } = renderSwitchRow();

    expect(customElements.get('gnome-switch-row')).toBe(GnomeSwitchRowElement);
    expect(surface).toBeInstanceOf(HTMLButtonElement);
    expect(surface?.type).toBe('button');
    expect(surface?.getAttribute('role')).toBe('switch');
    expect(surface?.getAttribute('aria-checked')).toBe('false');
  });

  it('groups title and subtitle into a generated row-content, and labels the surface from it', () => {
    const { surface, switchRow } = renderSwitchRow();
    const content = switchRow.querySelector('[data-slot="row-content"]');

    expect(content?.contains(switchRow.querySelector('[data-slot="row-title"]'))).toBe(true);
    expect(content?.contains(switchRow.querySelector('[data-slot="row-subtitle"]'))).toBe(true);
    expect(surface?.getAttribute('aria-labelledby')).toBe(content?.id);
  });

  it('wraps prefix and content inside the surface, keeping the switch visual inside it too', () => {
    const { surface } = renderSwitchRow();

    expect(surface?.querySelector('[data-slot="row-prefix"]')).not.toBeNull();
    expect(surface?.querySelector('[data-slot="row-content"]')).not.toBeNull();
    expect(surface?.querySelector('[data-slot="row-switch-track"]')).not.toBeNull();
    expect(
      surface?.querySelector('[data-slot="row-switch-track"] [data-slot="row-switch-thumb"]'),
    ).not.toBeNull();
    expect(
      surface?.querySelector('[data-slot="row-switch-track"]')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('toggles checked/aria-checked on click and emits gnome-change', () => {
    const { surface, switchRow } = renderSwitchRow();
    const changeListener = vi.fn<(event: CustomEvent<GnomeSwitchRowChangeDetail>) => void>();
    switchRow.addEventListener('gnome-change', changeListener);

    surface?.click();

    expect(switchRow.checked).toBe(true);
    expect(surface?.getAttribute('aria-checked')).toBe('true');
    expect(changeListener.mock.calls[0]?.[0].detail).toEqual({ checked: true });

    surface?.click();

    expect(switchRow.checked).toBe(false);
    expect(surface?.getAttribute('aria-checked')).toBe('false');
    expect(changeListener.mock.calls[1]?.[0].detail).toEqual({ checked: false });
  });

  it('reflects the checked attribute programmatically without a click', () => {
    const { surface, switchRow } = renderSwitchRow();

    switchRow.checked = true;

    expect(surface?.getAttribute('aria-checked')).toBe('true');
  });

  it('disables the native surface and skips native clicks', () => {
    const { surface, switchRow } = renderSwitchRow();

    switchRow.disabled = true;
    expect(surface?.disabled).toBe(true);

    surface?.click();
    expect(switchRow.checked).toBe(false);
  });

  it('adopts an author-supplied row-surface instead of generating one', () => {
    const { surface, switchRow } = renderSwitchRow(`
      <a data-slot="row-surface" href="#settings">
        <span data-slot="row-title">Wi-Fi</span>
      </a>
    `);

    expect(surface?.tagName).toBe('A');
    expect(surface?.getAttribute('role')).toBe('switch');
    expect(switchRow.querySelectorAll('[data-slot="row-surface"]')).toHaveLength(1);
  });
});
