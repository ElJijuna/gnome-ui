import { defineCustomElement, HTMLElementBase } from './internal/dom';

const TITLE_SELECTOR = '[data-slot="header-title"]';

/**
 * Title bar with a centered title and leading/trailing action slots.
 *
 * `data-slot="header-start"`/`"header-title"`/`"header-end"` are placed
 * into explicit CSS grid columns (not DOM-order auto-placement), so the
 * title stays centered even when a consumer omits `header-start` or
 * `header-end` entirely — no placeholder elements need to be generated.
 *
 * The host gives `[data-slot="header-title"]` `aria-live="polite"`
 * (guarded, and re-applied if the title element is swapped — e.g. an htmx
 * view transition — via a lightweight `childList` `MutationObserver`), so
 * assistive tech announces title changes. `flat` (no bottom border, for the
 * topmost bar of a full-window layout) is a plain attribute read directly
 * by CSS — no JS state to keep in sync.
 */
export class GnomeHeaderBarElement extends HTMLElementBase {
  #connected = false;
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#syncTitle();
    this.#observe();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
  }

  get flat() {
    return this.hasAttribute('flat');
  }

  set flat(value: boolean) {
    this.toggleAttribute('flat', value);
  }

  #observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => {
      if (this.#connected) {
        this.#syncTitle();
      }
    });
    this.#observer.observe(this, { childList: true });
  }

  #syncTitle() {
    const title = this.querySelector<HTMLElement>(TITLE_SELECTOR);

    if (title && !title.hasAttribute('aria-live')) {
      title.setAttribute('aria-live', 'polite');
    }
  }
}

export function registerGnomeHeaderBar() {
  defineCustomElement('gnome-header-bar', GnomeHeaderBarElement);
}

registerGnomeHeaderBar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-header-bar': GnomeHeaderBarElement;
  }
}
