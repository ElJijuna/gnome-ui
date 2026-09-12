import { defineCustomElement, HTMLElementBase } from './internal/dom';

const TAB_SELECTOR = '[role="tab"]';
const SCROLL_START_SELECTOR = '[data-slot="tab-bar-scroll-start"]';
const SCROLL_END_SELECTOR = '[data-slot="tab-bar-scroll-end"]';

function isDisabled(tab: HTMLElement) {
  return (
    (tab instanceof HTMLButtonElement && tab.disabled) ||
    tab.getAttribute('aria-disabled') === 'true'
  );
}

function createScrollButton(
  slot: 'tab-bar-scroll-start' | 'tab-bar-scroll-end',
  label: string,
): HTMLButtonElement {
  const button = document.createElement('button');

  button.type = 'button';
  button.dataset.slot = slot;
  button.setAttribute('aria-label', label);
  button.hidden = true;

  const icon = document.createElement('span');

  icon.dataset.slot = 'tab-bar-scroll-icon';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);

  return button;
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
 *
 * The host itself is the scrollable element (`overflow-x: auto`, its
 * scrollbar hidden via CSS), so touch users can already swipe to reach
 * overflowing tabs — but nothing told a mouse/trackpad user, or anyone who
 * hasn't tried swiping, that there was more to see. Two host-generated
 * buttons (`[data-slot="tab-bar-scroll-start"]`/`-end`, `position: sticky`
 * to the host's own edges so they never scroll away with the content they
 * control) fade in only while there's genuinely more in that direction —
 * mirrors `@gnome-ui/react`'s `TabBar`, same `scrollLeft`/`scrollWidth`
 * math and the same RTL handling (`scrollLeft` ranges `[-max, 0]` in RTL
 * per the modern cross-browser convention, `[0, max]` in LTR — "forward"
 * flips sign, not meaning). Unlike `expander`'s host-generated header,
 * these don't move or wrap the consumer's own `[role="tab"]` children at
 * all — sticky positioning alone keeps them pinned without needing a
 * generated scroll wrapper around content the consumer still owns.
 */
export class GnomeTabBarElement extends HTMLElementBase {
  #observer: MutationObserver | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #scrollStart: HTMLButtonElement | null = null;
  #scrollEnd: HTMLButtonElement | null = null;

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist');
    }

    this.addEventListener('keydown', this.#handleKeyDown);
    this.#wrapScrollButtons();
    this.#syncTabIndexes();
    this.#observeTabs();

    this.addEventListener('scroll', this.#updateScrollButtons, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(this.#updateScrollButtons);
      this.#resizeObserver.observe(this);
    }

    this.#updateScrollButtons();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('scroll', this.#updateScrollButtons);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
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

  #wrapScrollButtons() {
    let start = this.querySelector<HTMLButtonElement>(SCROLL_START_SELECTOR);

    if (!start || start.parentElement !== this) {
      start = createScrollButton('tab-bar-scroll-start', 'Scroll to previous tabs');
      this.prepend(start);
    }

    start.addEventListener('click', this.#handleScrollStartClick);
    this.#scrollStart = start;

    let end = this.querySelector<HTMLButtonElement>(SCROLL_END_SELECTOR);

    if (!end || end.parentElement !== this) {
      end = createScrollButton('tab-bar-scroll-end', 'Scroll to next tabs');
      this.append(end);
    }

    end.addEventListener('click', this.#handleScrollEndClick);
    this.#scrollEnd = end;
  }

  #handleScrollStartClick = () => this.#scrollByPage(false);
  #handleScrollEndClick = () => this.#scrollByPage(true);

  /** `forward` moves toward later tabs, `backward` toward earlier ones — independent of LTR/RTL sign conventions. */
  #scrollByPage(forward: boolean) {
    const rtl = getComputedStyle(this).direction === 'rtl';
    const step = this.clientWidth * 0.8;
    const towardPositive = forward !== rtl;
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.scrollBy({
      left: towardPositive ? step : -step,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  }

  #updateScrollButtons = () => {
    // Modern engines agree `scrollLeft` ranges `[0, max]` in LTR and
    // `[-max, 0]` in RTL — its absolute distance from zero is the actual
    // scroll offset regardless of which one applies.
    const maxScroll = Math.max(0, this.scrollWidth - this.clientWidth);
    const scrolled = Math.min(maxScroll, Math.abs(this.scrollLeft));

    if (this.#scrollStart) {
      this.#scrollStart.hidden = scrolled <= 1;
    }

    if (this.#scrollEnd) {
      this.#scrollEnd.hidden = maxScroll - scrolled <= 1;
    }
  };

  #observeTabs() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => {
      this.#syncTabIndexes();
      this.#updateScrollButtons();
    });
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
