import { defineCustomElement, HTMLElementBase } from './internal/dom';

const SYMBOL_MAP: Record<string, string> = {
  ctrl: '⌃',
  control: '⌃',
  shift: '⇧',
  alt: '⌥',
  option: '⌥',
  super: '⊞',
  win: '⊞',
  cmd: '⌘',
  command: '⌘',
  meta: '⌘',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: '⎋',
  esc: '⎋',
  tab: '⇥',
  space: '␣',
  pageup: '⇞',
  pagedown: '⇟',
  home: '⇱',
  end: '⇲',
};

const KEY_SELECTOR = '[data-slot="kbd-key"]';

/**
 * Standalone single key-cap for inline instructional text (e.g. `Press
 * <gnome-kbd>Enter</gnome-kbd> to continue`).
 *
 * The key name is authored as plain light-DOM text — same as the native
 * `<kbd>` element — captured once on first connect into an internal
 * `#rawKey` so later re-renders (e.g. toggling `raw`) work from the
 * original name rather than from a symbol this component already
 * substituted in. Set the `key` property instead of `.textContent` for
 * programmatic updates after the initial render.
 *
 * Wraps a real `<kbd data-slot="kbd-key">` — same rationale as
 * `gnome-highlight` wrapping real `<mark>` elements — so the visible key
 * cap keeps genuine `<kbd>` semantics rather than relying on a custom
 * element tag alone.
 *
 * Common key names are normalised to their Unicode symbol unless `raw` is
 * set — mirrors `@gnome-ui/react`'s `Kbd`, which defaults `symbols` to
 * `true`. When a symbol is substituted, the original name moves to
 * `aria-label` (on the inner `<kbd>`) so assistive tech still announces
 * "Enter" rather than "↵".
 */
export class GnomeKbdElement extends HTMLElementBase {
  static readonly observedAttributes = ['raw'];

  #connected = false;
  #captured = false;
  #rawKey = '';

  connectedCallback() {
    if (!this.#captured) {
      this.#rawKey = (this.textContent ?? '').trim();
      this.#captured = true;
    }

    this.#connected = true;
    this.#syncContent();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncContent();
    }
  }

  get key() {
    return this.#rawKey;
  }

  set key(value: string) {
    this.#rawKey = value;
    this.#captured = true;

    if (this.#connected) {
      this.#syncContent();
    }
  }

  get symbols() {
    return !this.hasAttribute('raw');
  }

  set symbols(value: boolean) {
    this.toggleAttribute('raw', !value);
  }

  #syncContent() {
    const { key, symbols } = this;
    const display = symbols ? (SYMBOL_MAP[key.toLowerCase()] ?? key) : key;
    const label = display !== key ? key : null;

    let keyEl = this.querySelector<HTMLElement>(KEY_SELECTOR);

    if (!keyEl) {
      this.textContent = '';
      keyEl = document.createElement('kbd');
      keyEl.dataset.slot = 'kbd-key';
      this.append(keyEl);
    }

    if (keyEl.textContent !== display) {
      keyEl.textContent = display;
    }

    if (label) {
      if (keyEl.getAttribute('aria-label') !== label) {
        keyEl.setAttribute('aria-label', label);
      }
    } else if (keyEl.hasAttribute('aria-label')) {
      keyEl.removeAttribute('aria-label');
    }
  }
}

export function registerGnomeKbd() {
  defineCustomElement('gnome-kbd', GnomeKbdElement);
}

registerGnomeKbd();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-kbd': GnomeKbdElement;
  }
}
