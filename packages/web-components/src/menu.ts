import { defineCustomElement, emit, ensureId, HTMLElementBase } from './internal/dom';
import { computeFloatingPosition, type FloatingPlacement } from './internal/floating';

export type GnomeMenuPlacement = FloatingPlacement;
export type GnomeMenuFocus = 'first' | 'last';
export type GnomeMenuCloseReason =
  | 'attribute'
  | 'escape'
  | 'outside'
  | 'programmatic'
  | 'select'
  | 'tab'
  | 'trigger';

export interface GnomeMenuOpenChangeDetail {
  open: boolean;
}

export interface GnomeMenuCloseDetail {
  reason: GnomeMenuCloseReason;
}

export interface GnomeMenuSelectDetail {
  item: HTMLElement;
  value: string;
}

export interface GnomeMenuEventMap extends HTMLElementEventMap {
  'gnome-cancel': CustomEvent<GnomeMenuCloseDetail>;
  'gnome-close': CustomEvent<GnomeMenuCloseDetail>;
  'gnome-open-change': CustomEvent<GnomeMenuOpenChangeDetail>;
  'gnome-select': CustomEvent<GnomeMenuSelectDetail>;
}

const ITEM_SELECTOR = '[data-menu-item]';
const TYPEAHEAD_TIMEOUT = 500;

function isDisabled(item: HTMLElement) {
  return (
    item.hasAttribute('disabled') ||
    item.hasAttribute('data-disabled') ||
    item.getAttribute('aria-disabled') === 'true'
  );
}

function itemValue(item: HTMLElement) {
  return item.dataset.value ?? item.getAttribute('value') ?? item.textContent?.trim() ?? '';
}

/**
 * Anchored action menu with light-DOM trigger, content, and items.
 *
 * Requires descendants marked with `data-slot="menu-trigger"` and
 * `data-slot="menu-content"`. Menu items use `data-menu-item`; semantic
 * buttons and links are recommended.
 */
export class GnomeMenuElement extends HTMLElementBase {
  static readonly observedAttributes = ['open', 'placement'];

  addEventListener<K extends keyof GnomeMenuEventMap>(
    type: K,
    listener: (this: GnomeMenuElement, event: GnomeMenuEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeMenuEventMap>(
    type: K,
    listener: (this: GnomeMenuElement, event: GnomeMenuEventMap[K]) => void,
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
  #focusOnOpen: GnomeMenuFocus = 'first';
  #generatedLabelledBy = new WeakMap<HTMLElement, string>();
  #isOpen = false;
  #partsObserver: MutationObserver | null = null;
  #pendingCloseReason: GnomeMenuCloseReason = 'attribute';
  #previouslyFocused: HTMLElement | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #restoreFocusAfterClose = false;
  #trigger: HTMLElement | null = null;
  #typeahead = '';
  #typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.#clearTypeahead();
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

  get placement(): GnomeMenuPlacement {
    const value = this.getAttribute('placement');
    return value === 'top' || value === 'left' || value === 'right' ? value : 'bottom';
  }

  set placement(value: GnomeMenuPlacement) {
    this.setAttribute('placement', value);
  }

  show(focus: GnomeMenuFocus = 'first') {
    this.#focusOnOpen = focus;

    if (this.open) {
      queueMicrotask(() => this.#focusInitialItem());
      return;
    }

    this.open = true;
  }

  close(reason: GnomeMenuCloseReason = 'programmatic') {
    if (!this.open) {
      return;
    }

    this.#pendingCloseReason = reason;
    this.#restoreFocusAfterClose =
      reason === 'escape' ||
      reason === 'programmatic' ||
      reason === 'select' ||
      reason === 'trigger';
    this.open = false;
  }

  toggle() {
    if (this.open) {
      this.close('trigger');
    } else {
      this.show();
    }
  }

  requestClose(reason: Extract<GnomeMenuCloseReason, 'escape' | 'outside'>) {
    const shouldClose = emit<GnomeMenuCloseDetail>(
      this,
      'gnome-cancel',
      { reason },
      { cancelable: true },
    );

    if (shouldClose) {
      this.close(reason);
    }
  }

  #syncParts() {
    const previousTrigger = this.#trigger;
    const previousContent = this.#content;
    const trigger = this.querySelector<HTMLElement>('[data-slot="menu-trigger"]');
    const content = this.querySelector<HTMLElement>('[data-slot="menu-content"]');

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

    const triggerId = ensureId(this.#trigger, 'gnome-menu-trigger');
    const contentId = ensureId(this.#content, 'gnome-menu-content');

    this.#trigger.setAttribute('aria-haspopup', 'menu');
    this.#trigger.setAttribute('aria-expanded', String(this.open));
    this.#trigger.setAttribute('aria-controls', contentId);

    if (!this.#content.hasAttribute('role')) {
      this.#content.setAttribute('role', 'menu');
    }

    if (!this.#content.hasAttribute('tabindex')) {
      this.#content.tabIndex = -1;
    }

    this.#syncContentLabel(this.#content, triggerId);
    this.#syncItems();
  }

  #syncItems() {
    for (const item of this.#items()) {
      if (!item.hasAttribute('role')) {
        item.setAttribute('role', 'menuitem');
      }

      item.tabIndex = -1;
    }

    for (const label of this.#content?.querySelectorAll<HTMLElement>('[data-slot="menu-label"]') ??
      []) {
      if (!label.hasAttribute('role')) {
        label.setAttribute('role', 'presentation');
      }
    }

    for (const separator of this.#content?.querySelectorAll<HTMLElement>(
      '[data-slot="menu-separator"]',
    ) ?? []) {
      if (!separator.hasAttribute('role')) {
        separator.setAttribute('role', 'separator');
      }
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

  #items() {
    return this.#content
      ? Array.from(this.#content.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
      : [];
  }

  #enabledItems() {
    return this.#items().filter((item) => !isDisabled(item) && !item.hidden);
  }

  #observeParts() {
    this.#partsObserver?.disconnect();
    this.#partsObserver = new MutationObserver(() => this.#refreshParts());
    this.#partsObserver.observe(this, {
      attributes: true,
      attributeFilter: [
        'aria-disabled',
        'aria-label',
        'data-disabled',
        'data-menu-item',
        'data-slot',
        'disabled',
        'id',
      ],
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

    if (!this.open || !this.#trigger || !this.#content) {
      if (!this.#trigger || !this.#content) {
        this.#stopObservingGeometry();
      }
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

      const activeItem =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.closest<HTMLElement>(ITEM_SELECTOR)
          : null;

      if (
        previousContent !== this.#content ||
        !this.#content.contains(document.activeElement) ||
        (activeItem !== null && isDisabled(activeItem))
      ) {
        this.#focusInitialItem();
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
          this.#focusInitialItem();
        }
      });
    } else {
      this.#removeGlobalListeners();
      this.#stopObservingGeometry();
      this.#clearTypeahead();

      if (this.#restoreFocusAfterClose && this.#previouslyFocused?.isConnected) {
        this.#previouslyFocused.focus();
      }

      if (emitChange) {
        emit<GnomeMenuCloseDetail>(this, 'gnome-close', {
          reason: this.#pendingCloseReason,
        });
      }

      this.#pendingCloseReason = 'attribute';
      this.#restoreFocusAfterClose = false;
    }

    if (emitChange) {
      emit<GnomeMenuOpenChangeDetail>(this, 'gnome-open-change', { open });
    }
  }

  #focusInitialItem() {
    const items = this.#enabledItems();
    const item = this.#focusOnOpen === 'last' ? items[items.length - 1] : items[0];

    (item ?? this.#content)?.focus();
    this.#focusOnOpen = 'first';
  }

  #focusByOffset(offset: number) {
    const items = this.#enabledItems();

    if (items.length === 0) {
      this.#content?.focus();
      return;
    }

    const activeItem =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.closest<HTMLElement>(ITEM_SELECTOR)
        : null;
    const activeIndex = activeItem ? items.indexOf(activeItem) : -1;
    const nextIndex =
      activeIndex === -1
        ? offset > 0
          ? 0
          : items.length - 1
        : (activeIndex + offset + items.length) % items.length;

    items[nextIndex]?.focus();
  }

  #focusEdge(edge: GnomeMenuFocus) {
    const items = this.#enabledItems();
    const item = edge === 'last' ? items[items.length - 1] : items[0];
    (item ?? this.#content)?.focus();
  }

  #focusTypeahead(character: string) {
    this.#typeahead += character.toLocaleLowerCase();

    if (this.#typeaheadTimer !== null) {
      clearTimeout(this.#typeaheadTimer);
    }

    this.#typeaheadTimer = setTimeout(() => this.#clearTypeahead(), TYPEAHEAD_TIMEOUT);

    const items = this.#enabledItems();
    const activeItem =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.closest<HTMLElement>(ITEM_SELECTOR)
        : null;
    const activeIndex = activeItem ? items.indexOf(activeItem) : -1;
    const orderedItems = [...items.slice(activeIndex + 1), ...items.slice(0, activeIndex + 1)];
    const match = orderedItems.find((item) =>
      (item.textContent?.trim().toLocaleLowerCase() ?? '').startsWith(this.#typeahead),
    );

    match?.focus();
  }

  #clearTypeahead() {
    this.#typeahead = '';

    if (this.#typeaheadTimer !== null) {
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = null;
    }
  }

  #applyPosition = () => {
    if (!this.open || !this.#trigger || !this.#content) {
      return;
    }

    const position = computeFloatingPosition(
      this.#trigger.getBoundingClientRect(),
      this.#content.getBoundingClientRect(),
      this.placement,
    );

    this.#content.dataset.placement = position.placement;
    this.#content.style.left = `${position.left}px`;
    this.#content.style.top = `${position.top}px`;
    this.#content.style.setProperty('--gnome-menu-arrow-offset', `${position.arrowOffset}px`);
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

    const trigger = event.target.closest<HTMLElement>('[data-slot="menu-trigger"]');

    if (trigger && trigger === this.#trigger) {
      if (isDisabled(trigger)) {
        event.preventDefault();
        return;
      }

      trigger.focus();
      this.toggle();
      return;
    }

    const item = event.target.closest<HTMLElement>(ITEM_SELECTOR);

    if (!item || !this.#content?.contains(item)) {
      return;
    }

    if (isDisabled(item)) {
      event.preventDefault();
      return;
    }

    const shouldSelect = emit<GnomeMenuSelectDetail>(
      this,
      'gnome-select',
      { item, value: itemValue(item) },
      { cancelable: true },
    );

    if (!shouldSelect) {
      event.preventDefault();
    } else if (!item.hasAttribute('data-keep-open')) {
      this.close('select');
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest<HTMLElement>('[data-slot="menu-trigger"]');

    if (trigger && trigger === this.#trigger) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.show('first');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.show('last');
      } else if (this.open && event.key === 'Escape') {
        event.preventDefault();
        this.requestClose('escape');
      }
      return;
    }

    if (!this.open || !this.#content?.contains(event.target)) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.requestClose('escape');
    } else if (event.key === 'Tab') {
      this.close('tab');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.#focusByOffset(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.#focusByOffset(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.#focusEdge('first');
    } else if (event.key === 'End') {
      event.preventDefault();
      this.#focusEdge('last');
    } else if (event.key === 'Enter' || event.key === ' ') {
      const item = event.target.closest<HTMLElement>(ITEM_SELECTOR);

      if (item && !isDisabled(item)) {
        event.preventDefault();
        item.click();
      }
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.#focusTypeahead(event.key);
    }
  };
}

export function registerGnomeMenu() {
  defineCustomElement('gnome-menu', GnomeMenuElement);
}

registerGnomeMenu();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-menu': GnomeMenuElement;
  }
}
