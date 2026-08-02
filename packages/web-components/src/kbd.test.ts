import { describe, expect, it } from 'vitest';

import { GnomeKbdElement } from './kbd';

function renderKbd(text: string) {
  const kbd = document.createElement('gnome-kbd');
  kbd.textContent = text;
  document.body.append(kbd);

  return kbd;
}

function keyEl(kbd: Element) {
  const el = kbd.querySelector<HTMLElement>('[data-slot="kbd-key"]');
  expect(el).not.toBeNull();
  return el as HTMLElement;
}

describe('GnomeKbdElement', () => {
  it('registers the custom element', () => {
    renderKbd('A');
    expect(customElements.get('gnome-kbd')).toBe(GnomeKbdElement);
  });

  it('wraps the display text in a real <kbd> element', () => {
    const kbd = renderKbd('A');
    const el = keyEl(kbd);
    expect(el.tagName).toBe('KBD');
    expect(el.textContent).toBe('A');
  });

  it('leaves unknown key names unchanged', () => {
    const kbd = renderKbd('F5');
    expect(keyEl(kbd).textContent).toBe('F5');
  });

  it.each([
    ['Ctrl', '⌃'],
    ['Control', '⌃'],
    ['Shift', '⇧'],
    ['Alt', '⌥'],
    ['Option', '⌥'],
    ['Super', '⊞'],
    ['Win', '⊞'],
    ['Cmd', '⌘'],
    ['Command', '⌘'],
    ['Meta', '⌘'],
    ['Up', '↑'],
    ['Down', '↓'],
    ['Left', '←'],
    ['Right', '→'],
    ['Enter', '↵'],
    ['Return', '↵'],
    ['Backspace', '⌫'],
    ['Delete', '⌦'],
    ['Escape', '⎋'],
    ['Esc', '⎋'],
    ['Tab', '⇥'],
    ['Space', '␣'],
  ])('normalises %s to %s by default', (token, symbol) => {
    const kbd = renderKbd(token);
    expect(keyEl(kbd).textContent).toBe(symbol);
  });

  it('shows the raw key name instead of the symbol when raw is set', () => {
    const kbd = renderKbd('Enter');
    kbd.setAttribute('raw', '');
    expect(keyEl(kbd).textContent).toBe('Enter');
  });

  it('sets aria-label to the semantic key name when a symbol is substituted', () => {
    const kbd = renderKbd('Enter');
    expect(keyEl(kbd).getAttribute('aria-label')).toBe('Enter');
  });

  it('omits aria-label when no symbol substitution occurs', () => {
    const kbd = renderKbd('A');
    expect(keyEl(kbd).hasAttribute('aria-label')).toBe(false);
  });

  it('omits aria-label when raw is set', () => {
    const kbd = renderKbd('Enter');
    kbd.setAttribute('raw', '');
    expect(keyEl(kbd).hasAttribute('aria-label')).toBe(false);
  });

  it('trims surrounding whitespace from the authored text', () => {
    const kbd = renderKbd('  Enter  ');
    expect(keyEl(kbd).getAttribute('aria-label')).toBe('Enter');
    expect(keyEl(kbd).textContent).toBe('↵');
  });

  it('exposes symbols as the inverse of the raw attribute', () => {
    const kbd = renderKbd('Enter') as GnomeKbdElement;
    expect(kbd.symbols).toBe(true);

    kbd.symbols = false;
    expect(kbd.hasAttribute('raw')).toBe(true);
    expect(keyEl(kbd).textContent).toBe('Enter');

    kbd.symbols = true;
    expect(kbd.hasAttribute('raw')).toBe(false);
    expect(keyEl(kbd).textContent).toBe('↵');
  });

  it('re-renders from the captured key when the key property is set programmatically', () => {
    const kbd = renderKbd('A') as GnomeKbdElement;
    expect(kbd.key).toBe('A');

    kbd.key = 'Escape';
    expect(keyEl(kbd).textContent).toBe('⎋');
    expect(keyEl(kbd).getAttribute('aria-label')).toBe('Escape');
  });

  it('captures the key property set before the element connects', () => {
    const kbd = document.createElement('gnome-kbd') as GnomeKbdElement;
    kbd.key = 'Tab';
    document.body.append(kbd);

    expect(keyEl(kbd).textContent).toBe('⇥');
    expect(keyEl(kbd).getAttribute('aria-label')).toBe('Tab');
  });

  it('reuses the same <kbd> element across re-renders instead of recreating it', () => {
    const kbd = renderKbd('A') as GnomeKbdElement;
    const first = keyEl(kbd);

    kbd.key = 'B';
    expect(keyEl(kbd)).toBe(first);
  });
});
