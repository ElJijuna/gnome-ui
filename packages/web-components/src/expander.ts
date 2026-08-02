import { defineCustomElement, emit, ensureId, HTMLElementBase } from './internal/dom';

export interface GnomeExpanderOpenChangeDetail {
  open: boolean;
}

export interface GnomeExpanderEventMap extends HTMLElementEventMap {
  'gnome-open-change': CustomEvent<GnomeExpanderOpenChangeDetail>;
}

const HEADER_SELECTOR = '[data-slot="expander-header"]';
const LABEL_SELECTOR = '[data-slot="expander-label"]';
const PANEL_SELECTOR = '[data-slot="expander-panel"]';
const PANEL_INNER_SELECTOR = '[data-slot="expander-panel-inner"]';

/**
 * Standalone disclosure triangle + collapsible content — mirrors
 * `GtkExpander`.
 *
 * A bare, unstyled counterpart to `gnome-expander-row`, which is scoped to
 * `gnome-action-row`'s header-slot layout. Use `gnome-expander` outside a
 * settings-row context — e.g. "Show advanced options" in a form or dialog.
 *
 * Fully host-generated header — a real `<button data-slot="expander-header">`
 * built from the `label` attribute, plus a decorative
 * `[data-slot="expander-chevron"]` — nothing for the consumer to author
 * there, same rationale as `gnome-divider`. All original light-DOM children
 * are moved, once, into a generated
 * `<div data-slot="expander-panel" role="region">`, height-animated with a
 * CSS grid `0fr`/`1fr` transition — same technique as
 * `gnome-expander-row`'s panel.
 *
 * Fires `gnome-open-change` (`{ open }`) on toggle — the same event name
 * and detail shape `gnome-dialog`/`gnome-dropdown`/`gnome-menu`/
 * `gnome-popover`/`gnome-expander-row` use for their own open-state
 * transitions.
 */
export class GnomeExpanderElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'expanded', 'label'];

  addEventListener<K extends keyof GnomeExpanderEventMap>(
    type: K,
    listener: (this: GnomeExpanderElement, event: GnomeExpanderEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeExpanderEventMap>(
    type: K,
    listener: (this: GnomeExpanderElement, event: GnomeExpanderEventMap[K]) => void,
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
  #header: HTMLButtonElement | null = null;

  #handleHeaderClick = () => {
    if (this.disabled) {
      return;
    }

    this.expanded = !this.expanded;
    emit<GnomeExpanderOpenChangeDetail>(this, 'gnome-open-change', { open: this.expanded });
  };

  connectedCallback() {
    this.#connected = true;
    this.#wrapHeader();
    this.#wrapPanel();
    this.#syncState();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#header?.removeEventListener('click', this.#handleHeaderClick);
    this.#header = null;
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get label() {
    return this.getAttribute('label') ?? '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get expanded() {
    return this.hasAttribute('expanded');
  }

  set expanded(value: boolean) {
    this.toggleAttribute('expanded', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #wrapHeader() {
    let header = this.querySelector<HTMLButtonElement>(HEADER_SELECTOR);

    if (!header || header.parentElement !== this) {
      header = document.createElement('button');
      header.type = 'button';
      header.dataset.slot = 'expander-header';

      const chevron = document.createElement('span');
      chevron.dataset.slot = 'expander-chevron';
      chevron.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.dataset.slot = 'expander-label';

      header.append(chevron, label);
      this.prepend(header);
    }

    if (header !== this.#header) {
      this.#header?.removeEventListener('click', this.#handleHeaderClick);
      header.addEventListener('click', this.#handleHeaderClick);
      this.#header = header;
    }
  }

  #wrapPanel() {
    let panel = this.querySelector<HTMLElement>(PANEL_SELECTOR);
    const remaining = Array.from(this.children).filter(
      (child) => child !== this.#header && child !== panel,
    );

    if (!panel) {
      panel = document.createElement('div');
      panel.dataset.slot = 'expander-panel';
      panel.setAttribute('role', 'region');
      this.append(panel);
    }

    let inner = panel.querySelector<HTMLElement>(PANEL_INNER_SELECTOR);

    if (!inner) {
      inner = document.createElement('div');
      inner.dataset.slot = 'expander-panel-inner';
      panel.append(inner);
    }

    for (const child of remaining) {
      inner.append(child);
    }
  }

  #syncState() {
    const header = this.#header;

    if (!header) {
      return;
    }

    const labelEl = header.querySelector<HTMLElement>(LABEL_SELECTOR);

    if (labelEl && labelEl.textContent !== this.label) {
      labelEl.textContent = this.label;
    }

    const headerId = ensureId(header, 'gnome-expander-header');
    const panel = this.querySelector<HTMLElement>(PANEL_SELECTOR);

    if (panel) {
      const panelId = ensureId(panel, 'gnome-expander-panel');

      if (header.getAttribute('aria-controls') !== panelId) {
        header.setAttribute('aria-controls', panelId);
      }

      if (panel.getAttribute('aria-labelledby') !== headerId) {
        panel.setAttribute('aria-labelledby', headerId);
      }
    }

    const expandedValue = String(this.expanded);

    if (header.getAttribute('aria-expanded') !== expandedValue) {
      header.setAttribute('aria-expanded', expandedValue);
    }

    if (header.disabled !== this.disabled) {
      header.disabled = this.disabled;
    }

    this.toggleAttribute('data-expanded', this.expanded);
  }
}

export function registerGnomeExpander() {
  defineCustomElement('gnome-expander', GnomeExpanderElement);
}

registerGnomeExpander();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-expander': GnomeExpanderElement;
  }
}
