import { defineCustomElement, emit, ensureId, HTMLElementBase } from './internal/dom';
import { computeFloatingPosition } from './internal/floating';

export type GnomeDropdownCloseReason =
  | 'attribute'
  | 'escape'
  | 'outside'
  | 'programmatic'
  | 'select'
  | 'tab'
  | 'trigger';

export interface GnomeDropdownOpenChangeDetail {
  open: boolean;
}

export interface GnomeDropdownCloseDetail {
  reason: GnomeDropdownCloseReason;
}

export interface GnomeDropdownChangeDetail {
  value: string;
}

export interface GnomeDropdownEventMap extends HTMLElementEventMap {
  'gnome-change': CustomEvent<GnomeDropdownChangeDetail>;
  'gnome-close': CustomEvent<GnomeDropdownCloseDetail>;
  'gnome-open-change': CustomEvent<GnomeDropdownOpenChangeDetail>;
}

const TRIGGER_SELECTOR = '[data-slot="dropdown-trigger"]';
const CONTENT_SELECTOR = '[data-slot="dropdown-content"]';
const VALUE_SELECTOR = '[data-slot="dropdown-value"]';
const OPTION_SELECTOR = '[data-option]';

function isDisabled(option: HTMLElement) {
  return option.hasAttribute('disabled') || option.getAttribute('aria-disabled') === 'true';
}

function optionValue(option: HTMLElement) {
  return option.dataset.value ?? option.textContent?.trim() ?? '';
}

function optionLabel(option: HTMLElement) {
  const labelSlot = option.querySelector<HTMLElement>('[data-slot="option-label"]');

  return (labelSlot ?? option).textContent?.trim() ?? '';
}

/**
 * Combo-box-style option list, following the Adwaita drop-down pattern.
 *
 * Combines `gnome-menu`'s internals — light-DOM trigger/content, floating
 * position with flip, outside-pointer/`Escape`/`Tab` dismissal, geometry
 * tracking — with a trigger styled as a `<select>`. Two real differences
 * from `gnome-menu`: focus never leaves the trigger (the standard
 * `role="combobox"` pattern highlights the active `role="option"` through
 * `aria-activedescendant` instead of moving DOM focus per item), and
 * selection is single-value, tracked via the `value` attribute and mirrored
 * onto each option's `aria-selected` the same way `gnome-radio-group`
 * mirrors native `checked`.
 *
 * Requires descendants marked `data-slot="dropdown-trigger"` (a `<button>`)
 * and `data-slot="dropdown-content"`, with `data-option data-value="…"`
 * children inside the content. The host manages the trigger's visible text
 * itself via a `[data-slot="dropdown-value"]` span it adopts or creates —
 * same rationale as `gnome-avatar`'s initials: nothing for a consumer to
 * author, since it's fully derived from `value`/`placeholder`.
 */
export class GnomeDropdownElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'open', 'placeholder', 'value'];

  addEventListener<K extends keyof GnomeDropdownEventMap>(
    type: K,
    listener: (this: GnomeDropdownElement, event: GnomeDropdownEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeDropdownEventMap>(
    type: K,
    listener: (this: GnomeDropdownElement, event: GnomeDropdownEventMap[K]) => void,
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

  #activeOption: HTMLElement | null = null;
  #connected = false;
  #content: HTMLElement | null = null;
  #focusOnOpen: 'first' | 'last' = 'first';
  #isOpen = false;
  #partsObserver: MutationObserver | null = null;
  #pendingCloseReason: GnomeDropdownCloseReason = 'attribute';
  #resizeObserver: ResizeObserver | null = null;
  #trigger: HTMLElement | null = null;

  connectedCallback() {
    this.#connected = true;
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.addEventListener('mouseover', this.#handleMouseOver);
    this.#syncParts();
    this.#observeParts();
    this.#syncOpen(false);
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('mouseover', this.#handleMouseOver);
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
    } else if (name === 'value' || name === 'placeholder') {
      this.#syncTriggerValue();
      this.#syncOptionsSelected();
    } else if (name === 'disabled') {
      this.#syncDisabled();
    }
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  get value() {
    return this.getAttribute('value') ?? '';
  }

  set value(value: string) {
    if (value) {
      this.setAttribute('value', value);
    } else {
      this.removeAttribute('value');
    }
  }

  get placeholder() {
    return this.getAttribute('placeholder') ?? 'Select an option';
  }

  set placeholder(value: string) {
    this.setAttribute('placeholder', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  show(focus: 'first' | 'last' = 'first') {
    this.#focusOnOpen = focus;

    if (this.open) {
      this.#focusInitialOption();
      return;
    }

    this.open = true;
  }

  close(reason: GnomeDropdownCloseReason = 'programmatic') {
    if (!this.open) {
      return;
    }

    this.#pendingCloseReason = reason;
    this.open = false;
  }

  toggle() {
    if (this.open) {
      this.close('trigger');
    } else {
      this.show();
    }
  }

  #syncParts() {
    const trigger = this.querySelector<HTMLElement>(TRIGGER_SELECTOR);
    const content = this.querySelector<HTMLElement>(CONTENT_SELECTOR);

    this.#trigger = trigger;
    this.#content = content;

    if (!trigger || !content) {
      return;
    }

    const triggerId = ensureId(trigger, 'gnome-dropdown-trigger');
    const contentId = ensureId(content, 'gnome-dropdown-content');

    if (!trigger.hasAttribute('role')) {
      trigger.setAttribute('role', 'combobox');
    }

    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', String(this.open));
    trigger.setAttribute('aria-controls', contentId);

    if (!content.hasAttribute('role')) {
      content.setAttribute('role', 'listbox');
    }

    content.setAttribute('aria-labelledby', triggerId);

    for (const option of this.#options()) {
      if (!option.hasAttribute('role')) {
        option.setAttribute('role', 'option');
      }

      ensureId(option, 'gnome-dropdown-option');
    }

    this.#syncDisabled();
    this.#syncTriggerValue();
    this.#syncOptionsSelected();
  }

  #options() {
    return this.#content
      ? Array.from(this.#content.querySelectorAll<HTMLElement>(OPTION_SELECTOR))
      : [];
  }

  #enabledOptions() {
    return this.#options().filter((option) => !isDisabled(option));
  }

  #syncDisabled() {
    // Reflected boolean properties call setAttribute()/removeAttribute()
    // unconditionally, even when assigning the value the control already
    // has — and setAttribute() always queues a MutationRecord regardless of
    // whether the value actually changed. Since #syncParts() (called by the
    // observer) calls this on every pass, an unguarded assignment loops the
    // same way the dropdown-value textContent assignment above did.
    if (this.#trigger instanceof HTMLButtonElement && this.#trigger.disabled !== this.disabled) {
      this.#trigger.disabled = this.disabled;
    }
  }

  #syncTriggerValue() {
    if (!this.#trigger) {
      return;
    }

    const selected = this.#options().find((option) => optionValue(option) === this.value);
    const valueSlot =
      this.#trigger.querySelector<HTMLElement>(VALUE_SELECTOR) ?? this.#createValueSlot();
    const nextText = selected ? optionLabel(selected) : this.placeholder;

    // Assigning textContent unconditionally would replace the text node on
    // every #syncParts() call — including the one triggered by this very
    // mutation, since childList changes are observed on the whole subtree —
    // producing an infinite MutationObserver loop. Only touch the DOM when
    // the text actually changes.
    if (valueSlot.textContent !== nextText) {
      valueSlot.textContent = nextText;
    }

    valueSlot.toggleAttribute('data-placeholder', !selected);
  }

  #createValueSlot() {
    const valueSlot = document.createElement('span');

    valueSlot.dataset.slot = 'dropdown-value';
    this.#trigger?.prepend(valueSlot);

    return valueSlot;
  }

  #syncOptionsSelected() {
    for (const option of this.#options()) {
      option.setAttribute('aria-selected', String(optionValue(option) === this.value));
    }
  }

  #observeParts() {
    this.#partsObserver?.disconnect();
    this.#partsObserver = new MutationObserver(() => this.#syncParts());
    this.#partsObserver.observe(this, {
      attributes: true,
      attributeFilter: ['aria-disabled', 'data-option', 'data-slot', 'data-value', 'disabled'],
      childList: true,
      subtree: true,
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
      this.#addGlobalListeners();
      this.#observeGeometry();

      queueMicrotask(() => {
        if (this.open) {
          this.#applyPosition();
          this.#focusInitialOption();
        }
      });
    } else {
      this.#removeGlobalListeners();
      this.#stopObservingGeometry();
      this.#setActive(null);

      if (emitChange) {
        emit<GnomeDropdownCloseDetail>(this, 'gnome-close', { reason: this.#pendingCloseReason });
      }

      this.#pendingCloseReason = 'attribute';
    }

    if (emitChange) {
      emit<GnomeDropdownOpenChangeDetail>(this, 'gnome-open-change', { open });
    }
  }

  #focusInitialOption() {
    const options = this.#enabledOptions();
    const selected = options.find((option) => optionValue(option) === this.value);
    const fallback = this.#focusOnOpen === 'last' ? options[options.length - 1] : options[0];

    this.#setActive(selected ?? fallback ?? null);
    this.#focusOnOpen = 'first';
  }

  #setActive(option: HTMLElement | null) {
    if (this.#activeOption) {
      this.#activeOption.removeAttribute('data-active');
    }

    this.#activeOption = option;

    if (option) {
      option.setAttribute('data-active', '');
      option.scrollIntoView?.({ block: 'nearest' });
      this.#trigger?.setAttribute('aria-activedescendant', option.id);
    } else {
      this.#trigger?.removeAttribute('aria-activedescendant');
    }
  }

  #moveActive(offset: number) {
    const options = this.#enabledOptions();

    if (options.length === 0) {
      return;
    }

    const activeIndex = this.#activeOption ? options.indexOf(this.#activeOption) : -1;
    const nextIndex =
      activeIndex === -1
        ? offset > 0
          ? 0
          : options.length - 1
        : (activeIndex + offset + options.length) % options.length;

    this.#setActive(options[nextIndex] ?? null);
  }

  #selectOption(option: HTMLElement) {
    const value = optionValue(option);

    this.value = value;
    emit<GnomeDropdownChangeDetail>(this, 'gnome-change', { value });
    this.close('select');
  }

  #applyPosition = () => {
    if (!this.open || !this.#trigger || !this.#content) {
      return;
    }

    const triggerRect = this.#trigger.getBoundingClientRect();

    this.#content.style.width = `${triggerRect.width}px`;

    const contentRect = this.#content.getBoundingClientRect();
    const position = computeFloatingPosition(triggerRect, contentRect, 'bottom');

    this.#content.dataset.placement = position.placement;
    this.#content.style.left = `${position.left}px`;
    this.#content.style.top = `${position.top}px`;
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
      this.close('outside');
    }
  };

  #handleMouseOver = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const option = event.target.closest<HTMLElement>(OPTION_SELECTOR);

    if (option && this.#content?.contains(option) && !isDisabled(option)) {
      this.#setActive(option);
    }
  };

  #handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(TRIGGER_SELECTOR) === this.#trigger) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }

      this.toggle();
      return;
    }

    const option = event.target.closest<HTMLElement>(OPTION_SELECTOR);

    if (!option || !this.#content?.contains(option) || isDisabled(option)) {
      return;
    }

    this.#selectOption(option);
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (
      !(event.target instanceof Element) ||
      event.target.closest(TRIGGER_SELECTOR) !== this.#trigger
    ) {
      return;
    }

    if (!this.open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.show('first');
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.show('last');
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close('escape');
    } else if (event.key === 'Tab') {
      this.close('tab');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.#moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.#moveActive(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.#setActive(this.#enabledOptions()[0] ?? null);
    } else if (event.key === 'End') {
      const options = this.#enabledOptions();

      event.preventDefault();
      this.#setActive(options[options.length - 1] ?? null);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (this.#activeOption) {
        this.#selectOption(this.#activeOption);
      }
    }
  };
}

export function registerGnomeDropdown() {
  defineCustomElement('gnome-dropdown', GnomeDropdownElement);
}

registerGnomeDropdown();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-dropdown': GnomeDropdownElement;
  }
}
