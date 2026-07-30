import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeSkeletonVariant = 'circle' | 'rect' | 'text';

const LINE_SELECTOR = '[data-slot="skeleton-line"]';
const SIZE_ATTRIBUTE = /^\d+(\.\d+)?$/;

function toCssSize(value: string): string {
  return SIZE_ATTRIBUTE.test(value) ? `${value}px` : value;
}

/**
 * Loading placeholder for content-shaped skeleton screens.
 *
 * Purely presentational — no consumer-authored light-DOM children. The
 * `text` variant's row elements are entirely host-derived from `lines`
 * (there is nothing for a consumer to author, same rationale as
 * `gnome-avatar`'s initials), so — unlike `gnome-avatar` — no
 * `MutationObserver` is needed: nothing external ever swaps this content.
 */
export class GnomeSkeletonElement extends HTMLElementBase {
  static readonly observedAttributes = ['animated', 'height', 'lines', 'size', 'variant', 'width'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;
    this.setAttribute('aria-hidden', 'true');
    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get variant(): GnomeSkeletonVariant {
    const value = this.getAttribute('variant');

    return value === 'circle' || value === 'text' ? value : 'rect';
  }

  set variant(value: GnomeSkeletonVariant) {
    this.setAttribute('variant', value);
  }

  get width() {
    return this.getAttribute('width') ?? '100%';
  }

  set width(value: string) {
    this.setAttribute('width', value);
  }

  get height() {
    return this.getAttribute('height') ?? '16';
  }

  set height(value: string) {
    this.setAttribute('height', value);
  }

  get size() {
    return this.getAttribute('size') ?? '40';
  }

  set size(value: string) {
    this.setAttribute('size', value);
  }

  get lines() {
    if (!this.hasAttribute('lines')) {
      return 3;
    }

    const parsed = Number(this.getAttribute('lines'));

    return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 3;
  }

  set lines(value: number) {
    this.setAttribute('lines', String(value));
  }

  get animated() {
    return this.getAttribute('animated') !== 'false';
  }

  set animated(value: boolean) {
    if (value) {
      this.removeAttribute('animated');
    } else {
      this.setAttribute('animated', 'false');
    }
  }

  #syncState() {
    const { variant } = this;

    this.dataset.variant = variant;
    this.toggleAttribute('data-animated', this.animated);

    if (variant === 'text') {
      this.style.removeProperty('width');
      this.style.removeProperty('height');
      this.#syncLines();
      return;
    }

    this.#clearLines();

    if (variant === 'circle') {
      const size = toCssSize(this.size);

      this.style.width = size;
      this.style.height = size;
      return;
    }

    this.style.width = toCssSize(this.width);
    this.style.height = toCssSize(this.height);
  }

  #syncLines() {
    const lineCount = this.lines;
    const existing = Array.from(this.querySelectorAll<HTMLSpanElement>(LINE_SELECTOR));

    for (let index = lineCount; index < existing.length; index += 1) {
      existing[index].remove();
    }

    for (let index = 0; index < lineCount; index += 1) {
      const line = existing[index] ?? this.#createLine();
      const isLastLine = index === lineCount - 1;

      if (isLastLine) {
        line.style.setProperty('--gnome-skeleton-line-width', '60%');
      } else {
        line.style.removeProperty('--gnome-skeleton-line-width');
      }
    }
  }

  #createLine() {
    const line = document.createElement('span');

    line.dataset.slot = 'skeleton-line';
    this.append(line);

    return line;
  }

  #clearLines() {
    for (const line of this.querySelectorAll(LINE_SELECTOR)) {
      line.remove();
    }
  }
}

export function registerGnomeSkeleton() {
  defineCustomElement('gnome-skeleton', GnomeSkeletonElement);
}

registerGnomeSkeleton();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-skeleton': GnomeSkeletonElement;
  }
}
