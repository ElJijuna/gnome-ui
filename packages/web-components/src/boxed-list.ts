import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeBoxedListVariant = 'default' | 'separate';

/**
 * Rounded bordered list — the most common container pattern in GNOME apps.
 * Groups row-shaped children (e.g. `gnome-action-row`) with merged borders
 * and a single rounded outline.
 *
 * The host sets `role="list"` and gives each direct child `role="listitem"`
 * (guarded, and re-applied to new children via a lightweight `childList`
 * `MutationObserver`, since ARIA roles can't be expressed in CSS). Unlike
 * the React version — which inserts an actual `<Separator>` element between
 * rows — dividers here are a pure CSS `border-top` on every child but the
 * first, so htmx can add/remove/reorder rows freely with no re-sync needed
 * beyond the `listitem` role.
 *
 * `variant="separate"` (default `"default"`) renders each child as its own
 * standalone rounded card instead of a single joined list; it's a plain
 * attribute read directly by CSS, no JS state to keep in sync.
 */
export class GnomeBoxedListElement extends HTMLElementBase {
  #connected = false;
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'list');
    }

    this.#syncItems();
    this.#observe();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
  }

  get variant(): GnomeBoxedListVariant {
    return this.getAttribute('variant') === 'separate' ? 'separate' : 'default';
  }

  set variant(value: GnomeBoxedListVariant) {
    this.setAttribute('variant', value);
  }

  #observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => {
      if (this.#connected) {
        this.#syncItems();
      }
    });
    this.#observer.observe(this, { childList: true });
  }

  #syncItems() {
    for (const child of this.children) {
      if (!child.hasAttribute('role')) {
        child.setAttribute('role', 'listitem');
      }
    }
  }
}

export function registerGnomeBoxedList() {
  defineCustomElement('gnome-boxed-list', GnomeBoxedListElement);
}

registerGnomeBoxedList();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-boxed-list': GnomeBoxedListElement;
  }
}
