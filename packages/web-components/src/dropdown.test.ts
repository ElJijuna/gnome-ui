import { describe, expect, it, vi } from 'vitest';

import {
  type GnomeDropdownChangeDetail,
  type GnomeDropdownCloseDetail,
  GnomeDropdownElement,
} from './dropdown';

function renderDropdown() {
  const dropdown = document.createElement('gnome-dropdown');
  dropdown.innerHTML = `
    <button type="button" data-slot="dropdown-trigger"></button>
    <ul data-slot="dropdown-content">
      <li data-option data-value="light">Light</li>
      <li data-option data-value="dark">Dark</li>
      <li data-option data-value="hc" disabled>High contrast</li>
      <li data-option data-value="auto">Automatic</li>
    </ul>
  `;
  document.body.append(dropdown);

  const trigger = dropdown.querySelector<HTMLButtonElement>('[data-slot="dropdown-trigger"]');
  const content = dropdown.querySelector<HTMLElement>('[data-slot="dropdown-content"]');
  const options = Array.from(dropdown.querySelectorAll<HTMLElement>('[data-option]'));

  return { content, dropdown, options, trigger };
}

describe('GnomeDropdownElement', () => {
  it('registers the custom element and wires the combobox/listbox pattern', () => {
    const { content, dropdown, trigger } = renderDropdown();

    expect(customElements.get('gnome-dropdown')).toBe(GnomeDropdownElement);
    expect(trigger?.getAttribute('role')).toBe('combobox');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger?.getAttribute('aria-controls')).toBe(content?.id);
    expect(content?.getAttribute('role')).toBe('listbox');
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger?.id);
    expect(dropdown.open).toBe(false);
  });

  it('shows the placeholder when no value is selected, and the selected label otherwise', () => {
    const { dropdown, trigger } = renderDropdown();
    const valueSlot = () => trigger?.querySelector('[data-slot="dropdown-value"]');

    expect(valueSlot()?.textContent).toBe('Select an option');
    expect(valueSlot()?.hasAttribute('data-placeholder')).toBe(true);

    dropdown.value = 'dark';
    expect(valueSlot()?.textContent).toBe('Dark');
    expect(valueSlot()?.hasAttribute('data-placeholder')).toBe(false);

    dropdown.placeholder = 'Pick a theme';
    dropdown.value = '';
    expect(valueSlot()?.textContent).toBe('Pick a theme');
  });

  it('mirrors value onto aria-selected for every option', () => {
    const { dropdown, options } = renderDropdown();

    dropdown.value = 'dark';

    expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ]);
  });

  it('opens from a trigger click and activates the selected option', async () => {
    const { dropdown, options, trigger } = renderDropdown();
    dropdown.value = 'dark';

    trigger?.click();
    await Promise.resolve();

    expect(dropdown.open).toBe(true);
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(options[1].hasAttribute('data-active')).toBe(true);
    expect(trigger?.getAttribute('aria-activedescendant')).toBe(options[1].id);
  });

  it('opens with ArrowDown/ArrowUp on the trigger and activates first/last enabled option', async () => {
    const { dropdown, options, trigger } = renderDropdown();

    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' }),
    );
    await Promise.resolve();
    expect(dropdown.open).toBe(true);
    expect(options[0].hasAttribute('data-active')).toBe(true);

    dropdown.close();
    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowUp' }),
    );
    await Promise.resolve();
    expect(options[3].hasAttribute('data-active')).toBe(true);
  });

  it('navigates with ArrowDown/ArrowUp/Home/End, skipping the disabled option', async () => {
    const { dropdown, options, trigger } = renderDropdown();
    dropdown.show('first');
    await Promise.resolve();

    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' }),
    );
    expect(options[1].hasAttribute('data-active')).toBe(true);

    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' }),
    );
    expect(options[3].hasAttribute('data-active')).toBe(true);

    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'End' }),
    );
    expect(options[3].hasAttribute('data-active')).toBe(true);

    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Home' }),
    );
    expect(options[0].hasAttribute('data-active')).toBe(true);
  });

  it('selects the active option with Enter and emits gnome-change/gnome-close', async () => {
    const { dropdown, options, trigger } = renderDropdown();
    const changeListener = vi.fn<(event: CustomEvent<GnomeDropdownChangeDetail>) => void>();
    const closeListener = vi.fn<(event: CustomEvent<GnomeDropdownCloseDetail>) => void>();
    dropdown.addEventListener('gnome-change', changeListener);
    dropdown.addEventListener('gnome-close', closeListener);

    dropdown.show('first');
    await Promise.resolve();
    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }),
    );

    expect(dropdown.value).toBe('light');
    expect(dropdown.open).toBe(false);
    expect(changeListener.mock.calls[0]?.[0].detail).toEqual({ value: 'light' });
    expect(closeListener.mock.calls[0]?.[0].detail).toEqual({ reason: 'select' });
    expect(options[0].getAttribute('aria-selected')).toBe('true');
  });

  it('selects an option on click and ignores clicks on the disabled option', async () => {
    const { dropdown, options } = renderDropdown();

    dropdown.show();
    await Promise.resolve();
    options[2].click();
    expect(dropdown.value).toBe('');
    expect(dropdown.open).toBe(true);

    options[3].click();
    expect(dropdown.value).toBe('auto');
    expect(dropdown.open).toBe(false);
  });

  it('closes on Escape and outside pointerdown', async () => {
    const { dropdown, trigger } = renderDropdown();

    dropdown.show();
    await Promise.resolve();
    trigger?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }),
    );
    expect(dropdown.open).toBe(false);

    dropdown.show();
    await Promise.resolve();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dropdown.open).toBe(false);
  });

  it('does not open or accept keyboard activation while disabled', async () => {
    const { dropdown, trigger } = renderDropdown();
    dropdown.disabled = true;

    expect(trigger?.disabled).toBe(true);

    trigger?.click();
    await Promise.resolve();
    expect(dropdown.open).toBe(false);
  });
});
