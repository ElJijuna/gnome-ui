import { defineCustomElement, emit, ensureId, HTMLElementBase } from './internal/dom';

export interface GnomeExpanderRowOpenChangeDetail {
  open: boolean;
}

export interface GnomeExpanderRowEventMap extends HTMLElementEventMap {
  'gnome-open-change': CustomEvent<GnomeExpanderRowOpenChangeDetail>;
}

const TITLE_SELECTOR = '[data-slot="row-title"]';
const SUBTITLE_SELECTOR = '[data-slot="row-subtitle"]';
const PREFIX_SELECTOR = '[data-slot="row-prefix"]';
const SUFFIX_SELECTOR = '[data-slot="row-suffix"]';
const CONTENT_SELECTOR = '[data-slot="row-content"]';
const SURFACE_SELECTOR = '[data-slot="row-surface"]';
const CHEVRON_SELECTOR = '[data-slot="row-chevron"]';
const PANEL_SELECTOR = '[data-slot="row-panel"]';
const PANEL_INNER_SELECTOR = '[data-slot="row-panel-inner"]';

/**
 * Collapsible `gnome-action-row` that reveals nested rows on activation —
 * mirrors `AdwExpanderRow`.
 *
 * Same header slots as `gnome-action-row`
 * (`row-prefix`/`row-title`/`row-subtitle`/`row-suffix`, grouped into a
 * generated `row-content`) wrapped in a generated
 * `<button data-slot="row-surface">`, plus a host-generated, `aria-hidden`
 * `row-chevron` indicator — nothing for the consumer to author there, same
 * rationale as `gnome-switch-row`'s track/thumb. Any remaining light-DOM
 * children (nested rows, e.g. `<gnome-action-row>`) are moved into a
 * generated `<div data-slot="row-panel" role="region">`, height-animated
 * with a CSS grid `0fr`/`1fr` transition; dividers between child rows are
 * pure CSS (`border-top` on every child but the first), same technique as
 * `gnome-boxed-list` — no JS bookkeeping as rows are added or removed.
 *
 * Unlike `@gnome-ui/react`'s `ExpanderRow` — whose docs warn that an
 * interactive `trailing` widget needs manual `stopPropagation()` since
 * `trailing` renders inside the header `<button>` — that's not a concern
 * here in practice, since `row-suffix` in this row is typically a static
 * value/badge; if it does host its own interactive control, the same
 * caveat applies as react's version.
 *
 * The `expanded` attribute uses `AdwExpanderRow`'s own terminology, but
 * fires `gnome-open-change` (`{ open }`) — the same event name and detail
 * shape `gnome-dialog`/`gnome-dropdown`/`gnome-menu`/`gnome-popover` use
 * for their own open-state transitions.
 */
export class GnomeExpanderRowElement extends HTMLElementBase {
  static readonly observedAttributes = ['expanded'];

  addEventListener<K extends keyof GnomeExpanderRowEventMap>(
    type: K,
    listener: (this: GnomeExpanderRowElement, event: GnomeExpanderRowEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeExpanderRowEventMap>(
    type: K,
    listener: (this: GnomeExpanderRowElement, event: GnomeExpanderRowEventMap[K]) => void,
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
    this.expanded = !this.expanded;
    emit<GnomeExpanderRowOpenChangeDetail>(this, 'gnome-open-change', { open: this.expanded });
  };

  connectedCallback() {
    this.#connected = true;
    this.#syncContent();
    this.#wrapSurface();
    this.#wrapPanel();
    this.#syncState();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#detachSurface();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get expanded() {
    return this.hasAttribute('expanded');
  }

  set expanded(value: boolean) {
    this.toggleAttribute('expanded', value);
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

  #wrapSurface() {
    const existing = this.querySelector<HTMLElement>(SURFACE_SELECTOR);

    if (existing && existing.parentElement === this) {
      this.#ensureChevron(existing);
      this.#attachSurface(existing);
      return;
    }

    const surface = document.createElement('button');
    surface.type = 'button';
    surface.dataset.slot = 'row-surface';

    const prefix = this.querySelector<HTMLElement>(PREFIX_SELECTOR);
    const content = this.querySelector<HTMLElement>(CONTENT_SELECTOR);
    const suffix = this.querySelector<HTMLElement>(SUFFIX_SELECTOR);

    (prefix ?? content ?? suffix)?.before(surface);

    if (prefix) {
      surface.append(prefix);
    }

    if (content) {
      surface.append(content);
    }

    if (suffix) {
      surface.append(suffix);
    }

    this.#ensureChevron(surface);
    this.#attachSurface(surface);
  }

  #ensureChevron(surface: HTMLElement) {
    if (surface.querySelector(CHEVRON_SELECTOR)) {
      return;
    }

    const chevron = document.createElement('span');
    chevron.dataset.slot = 'row-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    surface.append(chevron);
  }

  #wrapPanel() {
    let panel = this.querySelector<HTMLElement>(PANEL_SELECTOR);
    const remaining = Array.from(this.children).filter(
      (child) => child !== this.#surface && child !== panel,
    );

    if (!panel && remaining.length === 0) {
      return;
    }

    let inner: HTMLElement | null;

    if (panel && panel.parentElement === this) {
      inner = panel.querySelector<HTMLElement>(PANEL_INNER_SELECTOR);

      if (!inner) {
        inner = this.#createPanelInner(panel);
      }
    } else {
      panel = document.createElement('div');
      panel.dataset.slot = 'row-panel';
      panel.setAttribute('role', 'region');
      inner = this.#createPanelInner(panel);
      this.append(panel);
    }

    for (const child of remaining) {
      inner.append(child);
    }
  }

  #createPanelInner(panel: HTMLElement) {
    const inner = document.createElement('div');
    inner.dataset.slot = 'row-panel-inner';
    panel.append(inner);

    return inner;
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

  #syncState() {
    if (!this.#surface) {
      return;
    }

    const panel = this.querySelector<HTMLElement>(PANEL_SELECTOR);
    const headerId = ensureId(this.#surface, 'gnome-expander-row-header');

    this.#surface.setAttribute('aria-expanded', String(this.expanded));

    if (panel) {
      this.#surface.setAttribute('aria-controls', ensureId(panel, 'gnome-expander-row-panel'));
      panel.setAttribute('aria-labelledby', headerId);
    }
  }
}

export function registerGnomeExpanderRow() {
  defineCustomElement('gnome-expander-row', GnomeExpanderRowElement);
}

registerGnomeExpanderRow();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-expander-row': GnomeExpanderRowElement;
  }
}
