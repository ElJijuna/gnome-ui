import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeActionRowVariant = 'default' | 'property';

export interface GnomeActionRowEventMap extends HTMLElementEventMap {
  'gnome-activate': CustomEvent<void>;
}

const TITLE_SELECTOR = '[data-slot="row-title"]';
const SUBTITLE_SELECTOR = '[data-slot="row-subtitle"]';
const PREFIX_SELECTOR = '[data-slot="row-prefix"]';
const CONTENT_SELECTOR = '[data-slot="row-content"]';
const SURFACE_SELECTOR = '[data-slot="row-surface"]';

/**
 * Standard settings row with title, optional subtitle, prefix, and suffix.
 *
 * A custom element is always one fixed tag, so unlike the React version —
 * which renders `<button>` around everything (including `trailing`) when
 * `interactive` — the host only composes a real `<button data-slot="row-surface">`
 * around `data-slot="row-prefix"` and the generated title/subtitle
 * `data-slot="row-content"` wrapper. `data-slot="row-suffix"` deliberately
 * stays outside it: the React version documents that a `trailing` Switch or
 * Button needs manual `stopPropagation()` to avoid double-nesting inside
 * the row's own `<button>` (invalid, inaccessible HTML) — here that
 * constraint doesn't exist, since suffix is never inside the surface. The
 * hover/active tint is applied to the host itself (not row-surface), since
 * :hover/:active already match an ancestor while the pointer/press is on
 * any descendant — so it still spans the full row, suffix included.
 * Keyboard focus-visible stays scoped to row-surface, since it must point
 * at the exact element that has focus.
 *
 * Clicking (or keyboard-activating) the surface emits `gnome-activate` —
 * pre-filtered to real row activation, since clicks on row-suffix's own
 * controls never reach it.
 */
export class GnomeActionRowElement extends HTMLElementBase {
  static readonly observedAttributes = ['interactive'];

  addEventListener<K extends keyof GnomeActionRowEventMap>(
    type: K,
    listener: (this: GnomeActionRowElement, event: GnomeActionRowEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeActionRowEventMap>(
    type: K,
    listener: (this: GnomeActionRowElement, event: GnomeActionRowEventMap[K]) => void,
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

  #connected = false;
  #surface: HTMLElement | null = null;

  #handleSurfaceClick = () => {
    emit<void>(this, 'gnome-activate', undefined);
  };

  connectedCallback() {
    this.#connected = true;
    this.#syncContent();
    this.#syncInteractive();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#detachSurface();
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

  get variant(): GnomeActionRowVariant {
    return this.getAttribute('variant') === 'property' ? 'property' : 'default';
  }

  set variant(value: GnomeActionRowVariant) {
    this.setAttribute('variant', value);
  }

  #syncContent() {
    const existing = this.querySelector<HTMLElement>(CONTENT_SELECTOR);

    if (existing && existing.parentElement === this) {
      return;
    }

    const title = this.querySelector<HTMLElement>(TITLE_SELECTOR);
    const subtitle = this.querySelector<HTMLElement>(SUBTITLE_SELECTOR);

    if (!title && !subtitle) {
      return;
    }

    const content = document.createElement('span');
    content.dataset.slot = 'row-content';

    (title ?? subtitle)?.before(content);

    if (title) {
      content.append(title);
    }

    if (subtitle) {
      content.append(subtitle);
    }
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
      this.#attachSurface(existing);
      return;
    }

    const surface = document.createElement('button');
    surface.type = 'button';
    surface.dataset.slot = 'row-surface';

    const ariaLabel = this.getAttribute('aria-label');

    if (ariaLabel) {
      surface.setAttribute('aria-label', ariaLabel);
    }

    const prefix = this.querySelector<HTMLElement>(PREFIX_SELECTOR);
    const content = this.querySelector<HTMLElement>(CONTENT_SELECTOR);

    (prefix ?? content)?.before(surface);

    if (prefix) {
      surface.append(prefix);
    }

    if (content) {
      surface.append(content);
    }

    this.#attachSurface(surface);
  }

  #unwrapSurface() {
    const surface = this.querySelector<HTMLElement>(SURFACE_SELECTOR);

    if (!surface || surface.parentElement !== this) {
      return;
    }

    this.#detachSurface();

    while (surface.firstChild) {
      this.insertBefore(surface.firstChild, surface);
    }

    surface.remove();
  }

  #attachSurface(surface: HTMLElement) {
    if (this.#surface === surface) {
      return;
    }

    this.#detachSurface();
    this.#surface = surface;
    surface.addEventListener('click', this.#handleSurfaceClick);
  }

  #detachSurface() {
    this.#surface?.removeEventListener('click', this.#handleSurfaceClick);
    this.#surface = null;
  }
}

export function registerGnomeActionRow() {
  defineCustomElement('gnome-action-row', GnomeActionRowElement);
}

registerGnomeActionRow();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-action-row': GnomeActionRowElement;
  }
}
