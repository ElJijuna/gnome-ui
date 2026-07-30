import { describe, expect, it, vi } from 'vitest';

import { GnomeRadioGroupElement } from './radio-group';

function renderRadioGroup(
  controlsMarkup = `
    <label><input type="radio" data-slot="radio-control" value="list" checked> List</label>
    <label><input type="radio" data-slot="radio-control" value="grid"> Grid</label>
    <label><input type="radio" data-slot="radio-control" value="compact"> Compact</label>
  `,
  attrs: Record<string, string> = {},
) {
  const group = document.createElement('gnome-radio-group');

  for (const [name, value] of Object.entries(attrs)) {
    group.setAttribute(name, value);
  }

  group.innerHTML = controlsMarkup;
  document.body.append(group);

  return {
    controls: group.querySelectorAll<HTMLInputElement>('[data-slot="radio-control"]'),
    group,
  };
}

describe('GnomeRadioGroupElement', () => {
  it('registers the custom element and assigns a shared auto-generated name', () => {
    const { group, controls } = renderRadioGroup();

    expect(customElements.get('gnome-radio-group')).toBe(GnomeRadioGroupElement);
    expect(group.controls).toHaveLength(3);
    expect(group.value).toBe('list');
    expect(group.dataset.state).toBe('ready');

    const names = new Set(Array.from(controls).map((control) => control.name));
    expect(names.size).toBe(1);
    expect([...names][0]).not.toBe('');
  });

  it('propagates an explicit name attribute to every control', () => {
    const { controls } = renderRadioGroup(undefined, { name: 'view-mode' });

    for (const control of controls) {
      expect(control.name).toBe('view-mode');
    }
  });

  it('reflects value in both directions with native mutual exclusivity', () => {
    const { group, controls } = renderRadioGroup();

    group.value = 'grid';
    expect(controls[1].checked).toBe(true);
    expect(controls[0].checked).toBe(false);
    expect(group.value).toBe('grid');

    controls[2].checked = true;
    expect(group.value).toBe('compact');
  });

  it('fires gnome-change with the selected value when a control changes', () => {
    const { group, controls } = renderRadioGroup();
    const changeListener = vi.fn();
    group.addEventListener('gnome-change', changeListener);

    controls[1].click();

    expect(changeListener).toHaveBeenCalledOnce();
    expect(changeListener.mock.calls[0][0].detail).toEqual({ value: 'grid' });
  });

  it('maps group disabled state to every control', () => {
    const { group, controls } = renderRadioGroup();

    group.disabled = true;
    expect(group.dataset.state).toBe('disabled');
    expect(group.hasAttribute('data-disabled')).toBe(true);

    for (const control of controls) {
      expect(control.disabled).toBe(true);
    }

    group.disabled = false;

    for (const control of controls) {
      expect(control.disabled).toBe(false);
    }
  });

  it('preserves a control disabled independently of the group', async () => {
    const { group, controls } = renderRadioGroup(`
      <input type="radio" data-slot="radio-control" value="list" checked>
      <input type="radio" data-slot="radio-control" value="grid" disabled>
    `);

    expect(controls[1].disabled).toBe(true);

    group.disabled = true;
    group.disabled = false;

    expect(controls[0].disabled).toBe(false);
    expect(controls[1].disabled).toBe(true);

    controls[1].removeAttribute('disabled');
    await Promise.resolve();
    group.disabled = true;
    group.disabled = false;

    expect(controls[1].disabled).toBe(false);
  });

  it('adopts new controls added after connection with the shared name and group state', async () => {
    const { group } = renderRadioGroup();
    group.disabled = true;

    const added = document.createElement('input');
    added.type = 'radio';
    added.dataset.slot = 'radio-control';
    added.value = 'timeline';
    group.append(added);
    await Promise.resolve();

    expect(group.controls).toHaveLength(4);
    expect(added.name).toBe(group.controls[0].name);
    expect(added.disabled).toBe(true);
  });

  it('restores a removed control disabled state after an htmx-style swap', async () => {
    const { group, controls } = renderRadioGroup();
    group.disabled = true;

    const original = controls[0];
    const replacement = document.createElement('input');
    replacement.type = 'radio';
    replacement.dataset.slot = 'radio-control';
    replacement.value = 'list';
    original.replaceWith(replacement);
    await Promise.resolve();

    expect(original.disabled).toBe(false);
    expect(replacement.disabled).toBe(true);
    expect(group.controls).toHaveLength(3);
  });
});
