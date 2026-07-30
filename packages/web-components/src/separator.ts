import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeSeparatorOrientation = 'horizontal' | 'vertical';

/**
 * Thin dividing line that separates groups of content.
 *
 * Unlike the React version — which renders a semantic `<hr>` for the
 * horizontal case and a `<div role="separator">` for the vertical one — a
 * custom element is always a single fixed tag, so the host itself manages
 * `role="separator"` and `aria-orientation` for both orientations. Color is
 * driven entirely by design tokens and adapts to dark mode automatically.
 */
export class GnomeSeparatorElement extends HTMLElementBase {
  static readonly observedAttributes = ['orientation'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }

    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get orientation(): GnomeSeparatorOrientation {
    return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
  }

  set orientation(value: GnomeSeparatorOrientation) {
    this.setAttribute('orientation', value);
  }

  #syncState() {
    const { orientation } = this;

    this.dataset.orientation = orientation;

    if (orientation === 'vertical') {
      this.setAttribute('aria-orientation', 'vertical');
    } else {
      this.removeAttribute('aria-orientation');
    }
  }
}

export function registerGnomeSeparator() {
  defineCustomElement('gnome-separator', GnomeSeparatorElement);
}

registerGnomeSeparator();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-separator': GnomeSeparatorElement;
  }
}
