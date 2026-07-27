import {
  defineCustomElement,
  emit,
  ensureId,
  focusFirst,
  HTMLElementBase,
  isolateModal,
  lockBodyScroll,
  trapFocus,
} from './internal/dom';

export type GnomeDialogCloseReason = 'backdrop' | 'escape' | 'programmatic' | 'attribute';

export interface GnomeDialogOpenChangeDetail {
  open: boolean;
}

export interface GnomeDialogCloseDetail {
  reason: GnomeDialogCloseReason;
}

export interface GnomeDialogEventMap extends HTMLElementEventMap {
  'gnome-cancel': CustomEvent<GnomeDialogCloseDetail>;
  'gnome-close': CustomEvent<GnomeDialogCloseDetail>;
  'gnome-open-change': CustomEvent<GnomeDialogOpenChangeDetail>;
}

/**
 * Accessible modal dialog with light-DOM composition.
 *
 * Use `data-slot="dialog-surface"` for the dialog panel. When omitted, the
 * element wraps its existing children in a generated surface without cloning
 * them, preserving event handlers and htmx-managed content.
 */
export class GnomeDialogElement extends HTMLElementBase {
  static readonly observedAttributes = ['alert', 'aria-label', 'open'];

  addEventListener<K extends keyof GnomeDialogEventMap>(
    type: K,
    listener: (this: GnomeDialogElement, event: GnomeDialogEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: unknown,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (listener === null) {
      return;
    }

    super.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  removeEventListener<K extends keyof GnomeDialogEventMap>(
    type: K,
    listener: (this: GnomeDialogElement, event: GnomeDialogEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: unknown,
    options?: boolean | EventListenerOptions,
  ) {
    if (listener === null) {
      return;
    }

    super.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  #connected = false;
  #isOpen = false;
  #pendingCloseReason: GnomeDialogCloseReason = 'attribute';
  #previouslyFocused: HTMLElement | null = null;
  #releaseModalIsolation: (() => void) | null = null;
  #releaseScrollLock: (() => void) | null = null;
  #surface: HTMLElement | null = null;
  #mutationObserver: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#refreshContent();
    this.#observeContent();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.#syncOpen(false);
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    this.#releaseModalIsolation?.();
    this.#releaseModalIsolation = null;
    this.#releaseScrollLock?.();
    this.#releaseScrollLock = null;
    this.#isOpen = false;
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'open') {
      this.#syncOpen(true);
    } else {
      this.#applyAccessibility();
    }
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  show() {
    this.open = true;
  }

  showModal() {
    this.show();
  }

  close(reason: GnomeDialogCloseReason = 'programmatic') {
    if (!this.open) {
      return;
    }

    this.#pendingCloseReason = reason;
    this.open = false;
  }

  requestClose(reason: Extract<GnomeDialogCloseReason, 'backdrop' | 'escape'>) {
    const shouldClose = emit<GnomeDialogCloseDetail>(
      this,
      'gnome-cancel',
      { reason },
      {
        cancelable: true,
      },
    );

    if (shouldClose) {
      this.close(reason);
    }
  }

  #findOrCreateSurface() {
    const existing = Array.from(this.children).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.dataset.slot === 'dialog-surface',
    );

    if (existing) {
      return existing;
    }

    const surface = document.createElement('div');
    surface.dataset.slot = 'dialog-surface';

    while (this.firstChild) {
      surface.append(this.firstChild);
    }

    this.append(surface);
    return surface;
  }

  #applyAccessibility() {
    const surface = this.#surface;

    if (!surface) {
      return;
    }

    surface.setAttribute('role', this.hasAttribute('alert') ? 'alertdialog' : 'dialog');
    surface.setAttribute('aria-modal', 'true');
    surface.removeAttribute('aria-labelledby');
    surface.removeAttribute('aria-label');
    surface.removeAttribute('aria-describedby');

    const title = this.querySelector<HTMLElement>('[data-slot="dialog-title"]');
    const description = this.querySelector<HTMLElement>('[data-slot="dialog-description"]');
    const label = this.getAttribute('aria-label');

    if (title) {
      surface.setAttribute('aria-labelledby', ensureId(title, 'gnome-dialog-title'));
    } else if (label) {
      surface.setAttribute('aria-label', label);
    }

    if (description) {
      surface.setAttribute('aria-describedby', ensureId(description, 'gnome-dialog-description'));
    }
  }

  #observeContent() {
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = new MutationObserver(() => this.#refreshContent());
    this.#mutationObserver.observe(this, {
      childList: true,
      subtree: true,
    });
  }

  #refreshContent() {
    const previousSurface = this.#surface;
    this.#surface = this.#findOrCreateSurface();
    this.#applyAccessibility();
    this.#surface.dataset.state = this.open ? 'open' : 'closed';
    this.#surface.hidden = !this.open;

    if (
      this.open &&
      previousSurface !== this.#surface &&
      !this.#surface.contains(document.activeElement)
    ) {
      queueMicrotask(() => {
        if (this.open && this.#surface) {
          focusFirst(this.#surface);
        }
      });
    }
  }

  #syncOpen(emitChange: boolean) {
    const { open } = this;
    const surface = this.#surface;

    this.dataset.state = open ? 'open' : 'closed';

    if (surface) {
      surface.dataset.state = this.dataset.state;
      surface.hidden = !open;
    }

    if (open === this.#isOpen) {
      return;
    }

    this.#isOpen = open;

    if (open) {
      this.#applyAccessibility();
      this.#previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.#releaseModalIsolation ??= isolateModal(this);
      this.#releaseScrollLock = lockBodyScroll();

      queueMicrotask(() => {
        if (this.open && this.#surface) {
          focusFirst(this.#surface);
        }
      });
    } else {
      this.#releaseModalIsolation?.();
      this.#releaseModalIsolation = null;
      this.#releaseScrollLock?.();
      this.#releaseScrollLock = null;

      if (this.#previouslyFocused?.isConnected) {
        this.#previouslyFocused.focus();
      }

      if (emitChange) {
        emit<GnomeDialogCloseDetail>(this, 'gnome-close', {
          reason: this.#pendingCloseReason,
        });
      }

      this.#pendingCloseReason = 'attribute';
    }

    if (emitChange) {
      emit<GnomeDialogOpenChangeDetail>(this, 'gnome-open-change', { open });
    }
  }

  #handleClick = (event: MouseEvent) => {
    if (event.target === this && this.open && this.hasAttribute('close-on-backdrop')) {
      this.requestClose('backdrop');
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!this.open || !this.#surface) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.requestClose('escape');
      return;
    }

    trapFocus(event, this.#surface);
  };
}

export function registerGnomeDialog() {
  defineCustomElement('gnome-dialog', GnomeDialogElement);
}

registerGnomeDialog();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-dialog': GnomeDialogElement;
  }
}
