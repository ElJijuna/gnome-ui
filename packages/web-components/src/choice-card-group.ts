import { defineCustomElement, ensureId, HTMLElementBase } from './internal/dom';

const FIELDSET_SELECTOR = '[data-slot="choice-card-group-fieldset"]';
const LEGEND_SELECTOR = '[data-slot="choice-card-group-legend"]';
const HINT_SELECTOR = '[data-slot="choice-card-group-hint"]';
const GRID_SELECTOR = '[data-slot="choice-card-group-grid"]';
const CARD_SELECTOR = '[role="radio"]';
const DOT_SELECTOR = '[data-slot="choice-card-dot"]';

function isDisabled(card: HTMLElement) {
  return (
    (card instanceof HTMLButtonElement && card.disabled) ||
    card.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * Card-based single-choice selector (`role="radiogroup"`) — large
 * selectable cards instead of radio buttons, for account-type/template
 * pickers in welcome/setup flows.
 *
 * Combines two behaviors this package already has separately: wraps a
 * real `<fieldset>`/`<legend>` plus a label/helper-text/error hint, same
 * technique and rationale as `gnome-field-group` (original light-DOM
 * children — the card `<button>`s — are moved, once, into a generated
 * `<div role="radiogroup" data-slot="choice-card-group-grid">` inside the
 * fieldset); and roving-tabindex keyboard navigation with automatic
 * activation, same algorithm as `gnome-view-switcher` (all four arrow
 * keys cycle, Home/End jump to the ends, moving focus also clicks the
 * target card).
 *
 * Same division of responsibility as `gnome-tab-bar`/`gnome-view-switcher`:
 * requires descendants marked `role="radio"` (real `<button>`s
 * recommended) — the host does not create cards or manage `aria-checked`
 * itself, only wires up the surrounding fieldset chrome and keyboard
 * navigation. A decorative `[data-slot="choice-card-dot"]` is injected
 * into each card if missing, same pattern as `gnome-expander-row`'s
 * auto-injected chevron.
 */
export class GnomeChoiceCardGroupElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'error', 'helper-text', 'label'];

  #connected = false;
  #fieldset: HTMLFieldSetElement | null = null;
  #grid: HTMLElement | null = null;
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#wrapFieldset();
    this.#syncState();
    this.addEventListener('keydown', this.#handleKeyDown);
    this.#syncTabIndexes();
    this.#observeCards();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#observer?.disconnect();
    this.#observer = null;
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
    if (value) {
      this.setAttribute('label', value);
    } else {
      this.removeAttribute('label');
    }
  }

  get helperText() {
    return this.getAttribute('helper-text') ?? '';
  }

  set helperText(value: string) {
    if (value) {
      this.setAttribute('helper-text', value);
    } else {
      this.removeAttribute('helper-text');
    }
  }

  get error() {
    return this.getAttribute('error') ?? '';
  }

  set error(value: string) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #wrapFieldset() {
    const existing = this.querySelector<HTMLFieldSetElement>(FIELDSET_SELECTOR);

    if (existing && existing.parentElement === this) {
      this.#fieldset = existing;
      this.#grid = existing.querySelector<HTMLElement>(GRID_SELECTOR);
      this.#ensureDots();
      return;
    }

    const remaining = Array.from(this.children);

    const fieldset = document.createElement('fieldset');
    fieldset.dataset.slot = 'choice-card-group-fieldset';

    const legend = document.createElement('legend');
    legend.dataset.slot = 'choice-card-group-legend';
    fieldset.append(legend);

    const grid = document.createElement('div');
    grid.dataset.slot = 'choice-card-group-grid';
    grid.setAttribute('role', 'radiogroup');

    for (const child of remaining) {
      grid.append(child);
    }

    fieldset.append(grid);
    this.append(fieldset);

    this.#fieldset = fieldset;
    this.#grid = grid;
    this.#ensureDots();
  }

  #ensureDots() {
    for (const card of this.#cards()) {
      if (!card.querySelector(DOT_SELECTOR)) {
        const dot = document.createElement('span');
        dot.dataset.slot = 'choice-card-dot';
        dot.setAttribute('aria-hidden', 'true');
        card.prepend(dot);
      }
    }
  }

  #syncState() {
    const fieldset = this.#fieldset;

    if (!fieldset) {
      return;
    }

    const legend = fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR);

    if (legend && legend.textContent !== this.label) {
      legend.textContent = this.label;
    }

    if (fieldset.disabled !== this.disabled) {
      fieldset.disabled = this.disabled;
    }

    if (this.#grid && this.#grid.getAttribute('aria-label') !== this.label) {
      this.#grid.setAttribute('aria-label', this.label);
    }

    this.#syncHint(fieldset);
  }

  #syncHint(fieldset: HTMLFieldSetElement) {
    const { error, helperText } = this;
    const text = error || helperText;
    let hint = fieldset.querySelector<HTMLElement>(HINT_SELECTOR);

    if (!text) {
      hint?.remove();

      if (fieldset.hasAttribute('aria-describedby')) {
        fieldset.removeAttribute('aria-describedby');
      }

      return;
    }

    if (!hint) {
      hint = document.createElement('span');
      hint.dataset.slot = 'choice-card-group-hint';
      fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR)?.after(hint);
    }

    if (hint.textContent !== text) {
      hint.textContent = text;
    }

    hint.toggleAttribute('data-error', Boolean(error));

    if (error) {
      hint.setAttribute('role', 'alert');
    } else if (hint.hasAttribute('role')) {
      hint.removeAttribute('role');
    }

    const hintId = ensureId(hint, 'gnome-choice-card-group-hint');

    if (fieldset.getAttribute('aria-describedby') !== hintId) {
      fieldset.setAttribute('aria-describedby', hintId);
    }
  }

  #cards() {
    return this.#grid ? Array.from(this.#grid.querySelectorAll<HTMLElement>(CARD_SELECTOR)) : [];
  }

  #enabledCards() {
    return this.#cards().filter((card) => !isDisabled(card));
  }

  #observeCards() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => {
      this.#ensureDots();
      this.#syncTabIndexes();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['aria-checked', 'aria-disabled', 'disabled', 'role'],
      childList: true,
      subtree: true,
    });
  }

  #syncTabIndexes() {
    const cards = this.#cards();
    const checked = cards.find(
      (card) => card.getAttribute('aria-checked') === 'true' && !isDisabled(card),
    );
    const [firstEnabled] = this.#enabledCards();
    const rovingStop = checked ?? firstEnabled;

    for (const card of cards) {
      const nextTabIndex = card === rovingStop ? 0 : -1;

      // Same equality guard as gnome-view-switcher's #syncTabIndexes: tabIndex
      // reflects the tabindex content attribute unconditionally, even when
      // assigning the value it already has, which would feed the
      // MutationObserver above a same-value mutation and loop.
      if (card.tabIndex !== nextTabIndex) {
        card.tabIndex = nextTabIndex;
      }
    }
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const currentCard = event.target.closest<HTMLElement>(CARD_SELECTOR);

    if (!currentCard) {
      return;
    }

    const cards = this.#enabledCards();

    if (cards.length === 0) {
      return;
    }

    const activeIndex = cards.indexOf(currentCard);
    let nextIndex: number;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % cards.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex =
        activeIndex === -1 ? cards.length - 1 : (activeIndex - 1 + cards.length) % cards.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = cards.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextCard = cards[nextIndex];

    nextCard?.focus();
    nextCard?.click();
  };
}

export function registerGnomeChoiceCardGroup() {
  defineCustomElement('gnome-choice-card-group', GnomeChoiceCardGroupElement);
}

registerGnomeChoiceCardGroup();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-choice-card-group': GnomeChoiceCardGroupElement;
  }
}
