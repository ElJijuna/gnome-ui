import { defineCustomElement, HTMLElementBase } from './internal/dom';

const TAB_SELECTOR = '[role="tab"]';

function isDisabled(tab: HTMLElement) {
  return (
    (tab instanceof HTMLButtonElement && tab.disabled) ||
    tab.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * Horizontal tab list (`role="tablist"`).
 *
 * Requires descendants marked `role="tab"` — real `<button>`s recommended.
 * Same division of responsibility as `@gnome-ui/react`'s `TabBar`: the host
 * only manages roving-tabindex keyboard navigation (Left/Right/Home/End
 * moves focus, mirroring the offset/edge navigation shape in
 * `gnome-menu`'s keydown handler); it does not create tabs, change
 * `aria-selected`, or manage panel visibility — that stays with the
 * consumer, same as React.
 *
 * The host mirrors `aria-selected` onto `tabIndex` the same way
 * `gnome-radio-group` mirrors native `checked`: whichever tab has
 * `aria-selected="true"` becomes the roving-tabindex stop; if none does,
 * the first enabled tab is.
 */
export class GnomeTabBarElement extends HTMLElementBase {
  #observer: MutationObserver | null = null;

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist');
    }

    this.addEventListener('keydown', this.#handleKeyDown);
    this.#syncTabIndexes();
    this.#observeTabs();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  get inline() {
    return this.hasAttribute('inline');
  }

  set inline(value: boolean) {
    this.toggleAttribute('inline', value);
  }

  #tabs() {
    return Array.from(this.querySelectorAll<HTMLElement>(TAB_SELECTOR));
  }

  #enabledTabs() {
    return this.#tabs().filter((tab) => !isDisabled(tab));
  }

  #observeTabs() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => this.#syncTabIndexes());
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['aria-disabled', 'aria-selected', 'disabled', 'role'],
      childList: true,
      subtree: true,
    });
  }

  #syncTabIndexes() {
    const tabs = this.#tabs();
    const selected = tabs.find(
      (tab) => tab.getAttribute('aria-selected') === 'true' && !isDisabled(tab),
    );
    const [firstEnabled] = this.#enabledTabs();
    const rovingStop = selected ?? firstEnabled;

    for (const tab of tabs) {
      tab.tabIndex = tab === rovingStop ? 0 : -1;
    }
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const currentTab = event.target.closest<HTMLElement>(TAB_SELECTOR);

    if (!currentTab) {
      return;
    }

    const tabs = this.#enabledTabs();

    if (tabs.length === 0) {
      return;
    }

    const activeIndex = tabs.indexOf(currentTab);
    let nextIndex: number;

    if (event.key === 'ArrowRight') {
      nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex =
        activeIndex === -1 ? tabs.length - 1 : (activeIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex]?.focus();
  };
}

export function registerGnomeTabBar() {
  defineCustomElement('gnome-tab-bar', GnomeTabBarElement);
}

registerGnomeTabBar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-tab-bar': GnomeTabBarElement;
  }
}
