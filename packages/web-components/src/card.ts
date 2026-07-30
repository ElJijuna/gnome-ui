import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeCardPadding = 'lg' | 'md' | 'none' | 'sm';

const SURFACE_SELECTOR = '[data-slot="card-surface"]';

/**
 * Elevated surface for grouping related content, following the Adwaita
 * `.card` style class.
 *
 * A custom element is always one fixed tag, so unlike the React version —
 * which renders `<button>` when `interactive` (or whatever tag `as`
 * specifies) — the host composes a real `<button type="button">` as
 * `data-slot="card-surface"` for native keyboard/click activation, moving
 * its existing children inside. Author your own `data-slot="card-surface"`
 * (e.g. an `<a>` for a card that navigates) to use a different element;
 * the host adopts it instead of generating one. Toggling `interactive`
 * off unwraps the surface, moving children back onto the host directly.
 */
export class GnomeCardElement extends HTMLElementBase {
  static readonly observedAttributes = ['interactive'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;
    this.#syncInteractive();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncInteractive();
    }
  }

  get interactive() {
    return this.hasAttribute('interactive');
  }

  set interactive(value: boolean) {
    this.toggleAttribute('interactive', value);
  }

  get padding(): GnomeCardPadding {
    const value = this.getAttribute('padding');

    return value === 'none' || value === 'sm' || value === 'lg' ? value : 'md';
  }

  set padding(value: GnomeCardPadding) {
    this.setAttribute('padding', value);
  }

  #syncInteractive() {
    if (this.interactive) {
      this.#wrapSurface();
    } else {
      this.#unwrapSurface();
    }
  }

  #wrapSurface() {
    const existing = this.querySelector<HTMLElement>(SURFACE_SELECTOR);

    if (existing && existing.parentElement === this) {
      return;
    }

    const surface = document.createElement('button');
    surface.type = 'button';
    surface.dataset.slot = 'card-surface';

    const ariaLabel = this.getAttribute('aria-label');

    if (ariaLabel) {
      surface.setAttribute('aria-label', ariaLabel);
    }

    while (this.firstChild) {
      surface.append(this.firstChild);
    }

    this.append(surface);
  }

  #unwrapSurface() {
    const surface = this.querySelector<HTMLElement>(SURFACE_SELECTOR);

    if (!surface || surface.parentElement !== this) {
      return;
    }

    while (surface.firstChild) {
      this.insertBefore(surface.firstChild, surface);
    }

    surface.remove();
  }
}

export function registerGnomeCard() {
  defineCustomElement('gnome-card', GnomeCardElement);
}

registerGnomeCard();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-card': GnomeCardElement;
  }
}
