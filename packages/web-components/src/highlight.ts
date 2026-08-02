import { defineCustomElement, HTMLElementBase } from './internal/dom';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps every occurrence of `query` within `text` in a `<mark>` element.
 *
 * Pairs with `gnome-dropdown`'s option list (or any filterable list) to
 * show users which part of a result matched what they typed. Purely
 * presentational — no light-DOM children for the consumer to author; the
 * whole structure (plain text interleaved with `<mark>` matches) is fully
 * rebuilt from `text`/`query`/`case-sensitive`, same rationale as
 * `gnome-divider`.
 *
 * `query` splits on whitespace into individual terms — mirrors
 * `@gnome-ui/react`'s `Highlight`, whose most common multi-term use case is
 * highlighting each word of a multi-word search query.
 */
export class GnomeHighlightElement extends HTMLElementBase {
  static readonly observedAttributes = ['case-sensitive', 'query', 'text'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;
    this.#syncContent();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncContent();
    }
  }

  get text() {
    return this.getAttribute('text') ?? '';
  }

  set text(value: string) {
    this.setAttribute('text', value);
  }

  get query() {
    return this.getAttribute('query') ?? '';
  }

  set query(value: string) {
    this.setAttribute('query', value);
  }

  get caseSensitive() {
    return this.hasAttribute('case-sensitive');
  }

  set caseSensitive(value: boolean) {
    this.toggleAttribute('case-sensitive', value);
  }

  #syncContent() {
    const { text } = this;
    const terms = this.query
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean);

    if (terms.length === 0) {
      this.textContent = text;
      return;
    }

    const pattern = new RegExp(
      `(${terms.map(escapeRegExp).join('|')})`,
      this.caseSensitive ? 'g' : 'gi',
    );
    const parts = text.split(pattern);

    this.textContent = '';

    for (const [index, part] of parts.entries()) {
      if (part === '') {
        continue;
      }

      if (index % 2 === 1) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        this.append(mark);
      } else {
        this.append(document.createTextNode(part));
      }
    }
  }
}

export function registerGnomeHighlight() {
  defineCustomElement('gnome-highlight', GnomeHighlightElement);
}

registerGnomeHighlight();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-highlight': GnomeHighlightElement;
  }
}
