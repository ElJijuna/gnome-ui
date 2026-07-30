import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeSpinnerSize = 'lg' | 'md' | 'sm';

/**
 * Indeterminate loading indicator.
 *
 * Purely presentational — no light-DOM children, no interaction. The host
 * itself is the spinning ring, styled entirely through CSS animation that
 * respects `prefers-reduced-motion`.
 */
export class GnomeSpinnerElement extends HTMLElementBase {
  static readonly observedAttributes = ['label', 'size'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'status');
    }

    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get size(): GnomeSpinnerSize {
    const value = this.getAttribute('size');

    return value === 'sm' || value === 'lg' ? value : 'md';
  }

  set size(value: GnomeSpinnerSize) {
    this.setAttribute('size', value);
  }

  get label() {
    return this.hasAttribute('label') ? (this.getAttribute('label') ?? '') : 'Loading…';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  #syncState() {
    this.dataset.size = this.size;

    if (this.label === '') {
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    } else {
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    }
  }
}

export function registerGnomeSpinner() {
  defineCustomElement('gnome-spinner', GnomeSpinnerElement);
}

registerGnomeSpinner();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-spinner': GnomeSpinnerElement;
  }
}
