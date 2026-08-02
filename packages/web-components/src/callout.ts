import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeCalloutVariant = 'info' | 'tip' | 'warning';

export interface GnomeCalloutEventMap extends HTMLElementEventMap {
  'gnome-dismiss': CustomEvent<void>;
}

/**
 * Inline, dismissible admonition box for contextual help text within forms
 * and cards — distinct from `gnome-banner` (a persistent, edge-to-edge
 * strip at the top of a view) and `gnome-toast` (a temporary
 * notification).
 *
 * Purely presentational plus one click-delegated event: descendants
 * marked `data-dismiss` emit `gnome-dismiss` on click. Unlike
 * `gnome-banner`, the host never hides itself — there's no internal
 * open/closed state to manage, matching `@gnome-ui/react`'s `Callout`,
 * whose `onDismiss` is a plain notification callback that leaves
 * visibility entirely to the consumer.
 *
 * `variant` is a plain attribute read directly by CSS
 * (`gnome-callout[variant="…"]`), same as `gnome-banner`/`gnome-badge` —
 * no JS state to keep in sync. An optional icon goes in
 * `data-slot="callout-icon"`; there is no default/built-in icon, since no
 * `gnome-icon` element exists yet.
 */
export class GnomeCalloutElement extends HTMLElementBase {
  addEventListener<K extends keyof GnomeCalloutEventMap>(
    type: K,
    listener: (this: GnomeCalloutElement, event: GnomeCalloutEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: string, listener: unknown, options?: boolean | AddEventListenerOptions) {
    if (listener === null) {
      return;
    }

    super.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  removeEventListener<K extends keyof GnomeCalloutEventMap>(
    type: K,
    listener: (this: GnomeCalloutElement, event: GnomeCalloutEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(type: string, listener: unknown, options?: boolean | EventListenerOptions) {
    if (listener === null) {
      return;
    }

    super.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'note');
    }

    this.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
  }

  get variant(): GnomeCalloutVariant {
    const value = this.getAttribute('variant');

    return value === 'warning' || value === 'tip' ? value : 'info';
  }

  set variant(value: GnomeCalloutVariant) {
    this.setAttribute('variant', value);
  }

  #handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const control = event.target.closest<HTMLElement>('[data-dismiss]');

    if (!control || !this.contains(control)) {
      return;
    }

    emit<void>(this, 'gnome-dismiss', undefined);
  };
}

export function registerGnomeCallout() {
  defineCustomElement('gnome-callout', GnomeCalloutElement);
}

registerGnomeCallout();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-callout': GnomeCalloutElement;
  }
}
