import { defineCustomElement, emit, ensureId, focusFirst, HTMLElementBase } from './internal/dom';
import {
  computeFloatingPosition,
  type FloatingPlacement,
  type FloatingPosition,
} from './internal/floating';

export type GnomePopoverPlacement = FloatingPlacement;
export type GnomePopoverCloseReason =
  | 'attribute'
  | 'escape'
  | 'outside'
  | 'programmatic'
  | 'trigger';

export interface GnomePopoverOpenChangeDetail {
  open: boolean;
}

export interface GnomePopoverCloseDetail {
  reason: GnomePopoverCloseReason;
}

export interface GnomePopoverEventMap extends HTMLElementEventMap {
  'gnome-cancel': CustomEvent<GnomePopoverCloseDetail>;
  'gnome-close': CustomEvent<GnomePopoverCloseDetail>;
  'gnome-open-change': CustomEvent<GnomePopoverOpenChangeDetail>;
}

export type GnomePopoverPosition = FloatingPosition;

export function computePopoverPosition(
  trigger: DOMRect,
  content: DOMRect,
  preferred: GnomePopoverPlacement,
  viewport = { height: window.innerHeight, width: window.innerWidth },
): GnomePopoverPosition {
  return computeFloatingPosition(trigger, content, preferred, viewport);
}

/**
 * Anchored light-DOM popover.
 *
 * Requires descendants marked with `data-slot="popover-trigger"` and
 * `data-slot="popover-content"`. Content can be replaced by htmx because parts
 * are queried again whenever the popover opens.
 */
export class GnomePopoverElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'placement'];

  addEventListener<K extends keyof GnomePopoverEventMap>(
    type: K,
    listener: (this: GnomePopoverElement, event: GnomePopoverEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomePopoverEventMap>(
    type: K,
    listener: (this: GnomePopoverElement, event: GnomePopoverEventMap[K]) => void,
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
  #content: HTMLElement | null = null;
  #isOpen = false;
  #pendingCloseReason: GnomePopoverCloseReason = 'attribute';
  #previouslyFocused: HTMLElement | null = null;
  #restoreFocusAfterClose = false;
  #partsObserver: MutationObserver | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #generatedLabelledBy = new WeakMap<HTMLElement, string>();
  #trigger: HTMLElement | null = null;

  connectedCallback() {
    this.#connected = true;
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.#syncParts();
    this.#observeParts();
    this.#syncOpen(false);
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#partsObserver?.disconnect();
    this.#partsObserver = null;
    this.#removeGlobalListeners();
    this.#stopObservingGeometry();
    this.#isOpen = false;
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'open') {
      this.#syncOpen(true);
    } else if (this.open) {
      this.#applyPosition();
    }
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  get placement(): GnomePopoverPlacement {
    const value = this.getAttribute('placement');
    return value === 'top' || value === 'left' || value === 'right' ? value : 'bottom';
  }

  set placement(value: GnomePopoverPlacement) {
    this.setAttribute('placement', value);
  }

  show() {
    this.open = true;
  }

  close(reason: GnomePopoverCloseReason = 'programmatic') {
    if (!this.open) {
      return;
    }

    this.#pendingCloseReason = reason;
    this.#restoreFocusAfterClose =
      reason === 'escape' || reason === 'programmatic' || reason === 'trigger';
    this.open = false;
  }

  toggle() {
    if (this.open) {
      this.close('trigger');
    } else {
      this.show();
    }
  }

  requestClose(reason: Extract<GnomePopoverCloseReason, 'escape' | 'outside'>) {
    const shouldClose = emit<GnomePopoverCloseDetail>(
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

  #syncParts() {
    const previousTrigger = this.#trigger;
    const previousContent = this.#content;
    const trigger = this.querySelector<HTMLElement>('[data-slot="popover-trigger"]');
    const content = this.querySelector<HTMLElement>('[data-slot="popover-content"]');

    if (previousTrigger && previousTrigger !== trigger) {
      this.#clearTriggerAccessibility(previousTrigger);
    }

    if (previousContent && previousContent !== content) {
      this.#clearGeneratedLabel(previousContent);
    }

    this.#trigger = trigger;
    this.#content = content;

    if (!this.#trigger || !this.#content) {
      if (this.#trigger) {
        this.#clearTriggerAccessibility(this.#trigger);
      }

      if (this.#content) {
        this.#clearGeneratedLabel(this.#content);
      }

      return;
    }

    const triggerId = ensureId(this.#trigger, 'gnome-popover-trigger');
    const contentId = ensureId(this.#content, 'gnome-popover-content');

    this.#trigger.setAttribute('aria-haspopup', 'dialog');
    this.#trigger.setAttribute('aria-expanded', String(this.open));
    this.#trigger.setAttribute('aria-controls', contentId);

    if (!this.#content.hasAttribute('role')) {
      this.#content.setAttribute('role', 'dialog');
    }

    this.#syncContentLabel(this.#content, triggerId);

    if (!this.#content.hasAttribute('tabindex')) {
      this.#content.tabIndex = -1;
    }
  }

  #clearTriggerAccessibility(trigger: HTMLElement) {
    trigger.removeAttribute('aria-haspopup');
    trigger.removeAttribute('aria-expanded');
    trigger.removeAttribute('aria-controls');
  }

  #clearGeneratedLabel(content: HTMLElement) {
    const generatedLabel = this.#generatedLabelledBy.get(content);

    if (generatedLabel && content.getAttribute('aria-labelledby') === generatedLabel) {
      content.removeAttribute('aria-labelledby');
    }

    this.#generatedLabelledBy.delete(content);
  }

  #syncContentLabel(content: HTMLElement, triggerId: string) {
    const generatedLabel = this.#generatedLabelledBy.get(content);
    const labelledBy = content.getAttribute('aria-labelledby');

    if (content.hasAttribute('aria-label')) {
      this.#clearGeneratedLabel(content);
      return;
    }

    if (!labelledBy || labelledBy === generatedLabel) {
      content.setAttribute('aria-labelledby', triggerId);
      this.#generatedLabelledBy.set(content, triggerId);
    } else {
      this.#generatedLabelledBy.delete(content);
    }
  }

  #observeParts() {
    this.#partsObserver?.disconnect();
    this.#partsObserver = new MutationObserver(() => this.#refreshParts());
    this.#partsObserver.observe(this, {
      attributes: true,
      attributeFilter: ['aria-label', 'data-slot', 'id'],
      childList: true,
      subtree: true,
    });
  }

  #refreshParts() {
    const previousTrigger = this.#trigger;
    const previousContent = this.#content;
    this.#syncParts();

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-expanded', String(this.open));
    }

    if (this.#content) {
      this.#content.dataset.state = this.open ? 'open' : 'closed';
      this.#content.hidden = !this.open;
    }

    if (!this.open) {
      return;
    }

    if (!this.#trigger || !this.#content) {
      this.#stopObservingGeometry();
      return;
    }

    if (previousTrigger !== this.#trigger || previousContent !== this.#content) {
      this.#observeGeometry();
    }

    queueMicrotask(() => {
      if (!this.open || !this.#content) {
        return;
      }

      this.#applyPosition();

      if (previousContent !== this.#content) {
        focusFirst(this.#content);
      }
    });
  }

  #syncOpen(emitChange: boolean) {
    const { open } = this;

    this.#syncParts();
    this.dataset.state = open ? 'open' : 'closed';

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-expanded', String(open));
    }

    if (this.#content) {
      this.#content.dataset.state = this.dataset.state;
      this.#content.hidden = !open;
    }

    if (open === this.#isOpen) {
      return;
    }

    this.#isOpen = open;

    if (open) {
      this.#previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.#addGlobalListeners();
      this.#observeGeometry();

      queueMicrotask(() => {
        if (this.open && this.#content) {
          this.#applyPosition();
          focusFirst(this.#content);
        }
      });
    } else {
      this.#removeGlobalListeners();
      this.#stopObservingGeometry();

      if (this.#restoreFocusAfterClose && this.#previouslyFocused?.isConnected) {
        this.#previouslyFocused.focus();
      }

      if (emitChange) {
        emit<GnomePopoverCloseDetail>(this, 'gnome-close', {
          reason: this.#pendingCloseReason,
        });
      }

      this.#pendingCloseReason = 'attribute';
      this.#restoreFocusAfterClose = false;
    }

    if (emitChange) {
      emit<GnomePopoverOpenChangeDetail>(this, 'gnome-open-change', { open });
    }
  }

  #applyPosition = () => {
    if (!this.open || !this.#trigger || !this.#content) {
      return;
    }

    const position = computePopoverPosition(
      this.#trigger.getBoundingClientRect(),
      this.#content.getBoundingClientRect(),
      this.placement,
    );

    this.#content.dataset.placement = position.placement;
    this.#content.style.left = `${position.left}px`;
    this.#content.style.top = `${position.top}px`;
    this.#content.style.setProperty('--gnome-popover-arrow-offset', `${position.arrowOffset}px`);
  };

  #addGlobalListeners() {
    document.addEventListener('pointerdown', this.#handleOutsidePointer);
    window.addEventListener('resize', this.#applyPosition);
    window.addEventListener('scroll', this.#applyPosition, true);
  }

  #removeGlobalListeners() {
    if (typeof document === 'undefined') {
      return;
    }

    document.removeEventListener('pointerdown', this.#handleOutsidePointer);
    window.removeEventListener('resize', this.#applyPosition);
    window.removeEventListener('scroll', this.#applyPosition, true);
  }

  #observeGeometry() {
    this.#stopObservingGeometry();

    if (typeof ResizeObserver === 'undefined' || !this.#trigger || !this.#content) {
      return;
    }

    this.#resizeObserver = new ResizeObserver(() => this.#applyPosition());
    this.#resizeObserver.observe(this.#trigger);
    this.#resizeObserver.observe(this.#content);
  }

  #stopObservingGeometry() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  #handleOutsidePointer = (event: PointerEvent) => {
    if (event.target instanceof Node && !this.contains(event.target)) {
      this.requestClose('outside');
    }
  };

  #handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest<HTMLElement>('[data-slot="popover-trigger"]');

    if (trigger && trigger === this.#trigger) {
      trigger.focus();
      this.toggle();
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (this.open && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.requestClose('escape');
    }
  };
}

export function registerGnomePopover() {
  defineCustomElement('gnome-popover', GnomePopoverElement);
}

registerGnomePopover();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-popover': GnomePopoverElement;
  }
}
