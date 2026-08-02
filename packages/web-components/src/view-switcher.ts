import { defineCustomElement, HTMLElementBase } from './internal/dom';

const ITEM_SELECTOR = '[role="radio"]';

function isDisabled(item: HTMLElement) {
  return (
    (item instanceof HTMLButtonElement && item.disabled) ||
    item.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * Segmented control for switching between major views (`role="radiogroup"`).
 *
 * Same division of responsibility as `gnome-tab-bar` — requires descendants
 * marked `role="radio"` (real `<button>`s recommended); the host does not
 * create items or manage `aria-checked` itself, and mirrors `aria-checked`
 * onto roving `tabIndex` the same way `gnome-radio-group` mirrors native
 * `checked`. Two real differences from `gnome-tab-bar`: all four arrow keys
 * cycle (Left/Up move back, Right/Down move forward) — the
 * `AdwViewSwitcher`/segmented-control convention, not a tablist's
 * horizontal-only nav — and, since a radiogroup uses "automatic
 * activation," moving focus with an arrow key also clicks the target item,
 * mirroring `@gnome-ui/react`'s `ViewSwitcher`, whose keydown handler calls
 * `.click()` right after `.focus()`.
 */
export class GnomeViewSwitcherElement extends HTMLElementBase {
  #observer: MutationObserver | null = null;

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'radiogroup');
    }

    this.addEventListener('keydown', this.#handleKeyDown);
    this.#syncTabIndexes();
    this.#observeItems();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #items() {
    return Array.from(this.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
  }

  #enabledItems() {
    return this.#items().filter((item) => !isDisabled(item));
  }

  #observeItems() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => this.#syncTabIndexes());
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['aria-checked', 'aria-disabled', 'disabled', 'role'],
      childList: true,
      subtree: true,
    });
  }

  #syncTabIndexes() {
    const items = this.#items();
    const checked = items.find(
      (item) => item.getAttribute('aria-checked') === 'true' && !isDisabled(item),
    );
    const [firstEnabled] = this.#enabledItems();
    const rovingStop = checked ?? firstEnabled;

    for (const item of items) {
      const nextTabIndex = item === rovingStop ? 0 : -1;

      // tabIndex reflects the tabindex content attribute unconditionally,
      // even when assigning the value it already has — guard the write so
      // the MutationObserver above (triggered by any subtree mutation)
      // can't be fed a same-value attribute change and loop.
      if (item.tabIndex !== nextTabIndex) {
        item.tabIndex = nextTabIndex;
      }
    }
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const currentItem = event.target.closest<HTMLElement>(ITEM_SELECTOR);

    if (!currentItem) {
      return;
    }

    const items = this.#enabledItems();

    if (items.length === 0) {
      return;
    }

    const activeIndex = items.indexOf(currentItem);
    let nextIndex: number;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex =
        activeIndex === -1 ? items.length - 1 : (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextItem = items[nextIndex];

    nextItem?.focus();
    nextItem?.click();
  };
}

export function registerGnomeViewSwitcher() {
  defineCustomElement('gnome-view-switcher', GnomeViewSwitcherElement);
}

registerGnomeViewSwitcher();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-view-switcher': GnomeViewSwitcherElement;
  }
}
