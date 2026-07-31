import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeBannerVariant = 'error' | 'info' | 'success' | 'warning';

export type GnomeBannerDismissReason = 'dismiss' | 'programmatic';

export interface GnomeBannerDismissDetail {
  reason: GnomeBannerDismissReason;
}

export interface GnomeBannerActionDetail {
  action: string;
}

export interface GnomeBannerEventMap extends HTMLElementEventMap {
  'gnome-action': CustomEvent<GnomeBannerActionDetail>;
  'gnome-before-dismiss': CustomEvent<GnomeBannerDismissDetail>;
  'gnome-dismiss': CustomEvent<GnomeBannerDismissDetail>;
}

/**
 * Persistent message strip displayed at the top of a view.
 *
 * `variant` is a plain attribute read directly by CSS (`[variant="…"]`),
 * same as `gnome-badge`/`gnome-toast` — no JS state to keep in sync.
 * Descendants marked `data-action` emit `gnome-action`; unlike
 * `gnome-toast`, clicking one does *not* dismiss the banner — a banner
 * persists until its underlying condition is resolved, not just until the
 * next action. Descendants marked `data-dismiss` call `dismiss()`.
 */
export class GnomeBannerElement extends HTMLElementBase {
  addEventListener<K extends keyof GnomeBannerEventMap>(
    type: K,
    listener: (this: GnomeBannerElement, event: GnomeBannerEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeBannerEventMap>(
    type: K,
    listener: (this: GnomeBannerElement, event: GnomeBannerEventMap[K]) => void,
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
      this.setAttribute('role', 'status');
    }

    if (!this.hasAttribute('aria-live')) {
      this.setAttribute('aria-live', 'polite');
    }

    this.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
  }

  get variant(): GnomeBannerVariant {
    const value = this.getAttribute('variant');

    return value === 'warning' || value === 'error' || value === 'success' ? value : 'info';
  }

  set variant(value: GnomeBannerVariant) {
    this.setAttribute('variant', value);
  }

  dismiss(reason: GnomeBannerDismissReason = 'programmatic') {
    if (this.hidden) {
      return;
    }

    const shouldDismiss = emit<GnomeBannerDismissDetail>(
      this,
      'gnome-before-dismiss',
      { reason },
      { cancelable: true },
    );

    if (!shouldDismiss) {
      return;
    }

    this.hidden = true;
    this.dataset.state = 'dismissed';
    emit<GnomeBannerDismissDetail>(this, 'gnome-dismiss', { reason });
  }

  #handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const control = event.target.closest<HTMLElement>('[data-action], [data-dismiss]');

    if (!control || !this.contains(control)) {
      return;
    }

    if (control.hasAttribute('data-dismiss')) {
      this.dismiss('dismiss');
      return;
    }

    emit<GnomeBannerActionDetail>(this, 'gnome-action', {
      action: control.dataset.action || 'default',
    });
  };
}

export function registerGnomeBanner() {
  defineCustomElement('gnome-banner', GnomeBannerElement);
}

registerGnomeBanner();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-banner': GnomeBannerElement;
  }
}
