import type { IconDefinition } from '@gnome-ui/icons';
import { Star, StarOutline } from '@gnome-ui/icons';
import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeRatingStarsSize = 'sm' | 'md' | 'lg';

export interface GnomeRatingStarsChangeDetail {
  value: number;
}

export interface GnomeRatingStarsEventMap extends HTMLElementEventMap {
  'gnome-change': CustomEvent<GnomeRatingStarsChangeDetail>;
}

const SIZE_PX: Record<GnomeRatingStarsSize, number> = { sm: 12, md: 16, lg: 20 };
const STAR_CONTROL_SELECTOR = '[data-slot="rating-star-control"]';

function parseNumber(raw: string | null, fallback: number) {
  if (raw === null) {
    return fallback;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// document.createElement('svg') would create an HTML-namespace element, not
// a real SVGSVGElement, breaking innerHTML parsing of self-closing children
// — same bug found in gnome-copy-button/gnome-file-type-icon. DOMParser
// with the XML content type avoids it.
function buildStarSvg(icon: IconDefinition, size: number): SVGElement {
  const pathsMarkup = (icon.paths ?? [])
    .map((path) => {
      const attrs = [`d="${path.d}"`];

      if (path.fillRule) {
        attrs.push(`fill-rule="${path.fillRule}"`);
      }

      if (path.clipRule) {
        attrs.push(`clip-rule="${path.clipRule}"`);
      }

      if (path.transform) {
        attrs.push(`transform="${path.transform}"`);
      }

      return `<path ${attrs.join(' ')}></path>`;
    })
    .join('');

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" data-slot="rating-star" viewBox="${icon.viewBox}" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false">${pathsMarkup}</svg>`;
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  return document.importNode(parsed.documentElement, true) as unknown as SVGElement;
}

/**
 * Star rating display and input — mirrors `@gnome-ui/react`'s `RatingStars`.
 *
 * Fully host-generated from attributes — like `gnome-otp-input`, there is
 * nothing for the consumer to author; every star is built from `max`.
 * The React source switches between an interactive `role="radiogroup"` and
 * a static `role="img"` based on whether an `onChange` callback was passed
 * — there is no such introspection for event listeners on a custom
 * element, so this port uses an explicit `readonly` boolean attribute
 * instead, absent by default, matching how native `<input readonly>`
 * works: interactive unless told otherwise. `disabled` forces the same
 * read-only display rather than merely greying out interactive controls,
 * matching the React source. Arrow keys/Home/End move focus and select in
 * one step — clamped at the ends, not wrapping — the same algorithm the
 * React version's `onKeyDown` uses.
 *
 * `value` is a numeric attribute (unlike `gnome-otp-input`'s JS-only
 * `value`) since picking a star is a discrete action, not a per-keystroke
 * one. Clicking, or moving focus via the keyboard, sets `value` and fires
 * `gnome-change`. Hovering/focusing a star previews its fill without
 * changing `value` or firing an event, reverting once the pointer leaves
 * or focus moves on.
 *
 * `aria-label` defaults to `"Rating"` (interactive) or a generated
 * `"N out of M stars"` (read-only) but is never clobbered once the
 * consumer sets their own explicit value, the same generated-vs-explicit
 * tracking `gnome-tooltip` uses for `aria-describedby`.
 */
export class GnomeRatingStarsElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'aria-label',
    'disabled',
    'max',
    'readonly',
    'size',
    'value',
  ];

  addEventListener<K extends keyof GnomeRatingStarsEventMap>(
    type: K,
    listener: (this: GnomeRatingStarsElement, event: GnomeRatingStarsEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeRatingStarsEventMap>(
    type: K,
    listener: (this: GnomeRatingStarsElement, event: GnomeRatingStarsEventMap[K]) => void,
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
  #modePrevious: boolean | null = null;
  #autoAriaLabel: string | null = null;
  #hovered: number | null = null;

  #handleKeyDown = (event: KeyboardEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const currentButton = event.target.closest<HTMLButtonElement>(STAR_CONTROL_SELECTOR);

    if (!currentButton) {
      return;
    }

    const buttons = this.#starButtons();
    const idx = buttons.indexOf(currentButton);

    if (idx === -1) {
      return;
    }

    let next = -1;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      next = Math.min(buttons.length - 1, idx + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      next = Math.max(0, idx - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      next = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      next = buttons.length - 1;
    } else {
      return;
    }

    if (next >= 0 && next !== idx) {
      buttons[next].focus();
      this.#select(next + 1);
    }
  };

  #handleClick = (event: MouseEvent) => {
    const index = this.#starIndex(event.currentTarget as HTMLElement);

    if (index !== -1) {
      this.#select(index + 1);
    }
  };

  #handlePreview = (event: Event) => {
    const index = this.#starIndex(event.currentTarget as HTMLElement);

    if (index === -1 || this.#hovered === index + 1) {
      return;
    }

    this.#hovered = index + 1;
    this.#renderInteractiveStars();
  };

  #handleClearPreview = () => {
    if (this.#hovered === null) {
      return;
    }

    this.#hovered = null;
    this.#renderInteractiveStars();
  };

  connectedCallback() {
    this.#connected = true;
    this.addEventListener('keydown', this.#handleKeyDown);
    this.#render();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('keydown', this.#handleKeyDown);
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#render();
    }
  }

  get value() {
    return clamp(parseNumber(this.getAttribute('value'), 0), 0, this.max);
  }

  set value(value: number) {
    this.setAttribute('value', String(value));
  }

  get max() {
    const parsed = parseNumber(this.getAttribute('max'), 5);

    return parsed >= 1 ? parsed : 5;
  }

  set max(value: number) {
    this.setAttribute('max', String(value));
  }

  get size(): GnomeRatingStarsSize {
    const value = this.getAttribute('size');

    return value === 'sm' || value === 'lg' ? value : 'md';
  }

  set size(value: GnomeRatingStarsSize) {
    this.setAttribute('size', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get readonly() {
    return this.hasAttribute('readonly');
  }

  set readonly(value: boolean) {
    this.toggleAttribute('readonly', value);
  }

  /** Whether the widget accepts input right now. Read-only. */
  get interactive() {
    return !this.readonly && !this.disabled;
  }

  #select(starNumber: number) {
    this.value = starNumber;
    emit<GnomeRatingStarsChangeDetail>(this, 'gnome-change', { value: starNumber });
  }

  #starButtons() {
    return Array.from(this.querySelectorAll<HTMLButtonElement>(STAR_CONTROL_SELECTOR));
  }

  #starIndex(element: HTMLElement) {
    return this.#starButtons().indexOf(element as HTMLButtonElement);
  }

  #render() {
    const { interactive } = this;
    const role = interactive ? 'radiogroup' : 'img';

    if (this.getAttribute('role') !== role) {
      this.setAttribute('role', role);
    }

    if (this.#modePrevious !== interactive) {
      this.textContent = '';
      this.#hovered = null;
      this.#modePrevious = interactive;
    }

    this.dataset.state = interactive ? 'interactive' : 'static';
    this.#syncAriaLabel(interactive);

    if (interactive) {
      this.#renderInteractiveStars();
    } else {
      this.#renderStaticStars();
    }
  }

  #syncAriaLabel(interactive: boolean) {
    const current = this.getAttribute('aria-label');
    const isOwn = current === null || current === this.#autoAriaLabel;

    if (!isOwn) {
      return;
    }

    const generated = interactive ? 'Rating' : `${this.value} out of ${this.max} stars`;

    if (current !== generated) {
      this.setAttribute('aria-label', generated);
    }

    this.#autoAriaLabel = generated;
  }

  #createStarButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.slot = 'rating-star-control';
    button.setAttribute('role', 'radio');
    button.addEventListener('click', this.#handleClick);
    button.addEventListener('mouseenter', this.#handlePreview);
    button.addEventListener('mouseleave', this.#handleClearPreview);
    button.addEventListener('focus', this.#handlePreview);
    button.addEventListener('blur', this.#handleClearPreview);

    return button;
  }

  #renderInteractiveStars() {
    const { value, max, size } = this;
    const displayValue = this.#hovered ?? value;
    const px = SIZE_PX[size];
    const rovingStop = value || 1;
    const buttons = this.#starButtons();

    for (let i = buttons.length; i < max; i++) {
      const button = this.#createStarButton();
      this.append(button);
      buttons.push(button);
    }

    for (let i = buttons.length - 1; i >= max; i--) {
      buttons[i].remove();
      buttons.pop();
    }

    for (const [i, button] of buttons.entries()) {
      const starNumber = i + 1;
      const checked = starNumber === value;
      const filled = starNumber <= displayValue;

      const ariaChecked = String(checked);

      if (button.getAttribute('aria-checked') !== ariaChecked) {
        button.setAttribute('aria-checked', ariaChecked);
      }

      const label = `${starNumber} ${starNumber === 1 ? 'star' : 'stars'}`;

      if (button.getAttribute('aria-label') !== label) {
        button.setAttribute('aria-label', label);
      }

      const nextTabIndex = starNumber === rovingStop ? 0 : -1;

      if (button.tabIndex !== nextTabIndex) {
        button.tabIndex = nextTabIndex;
      }

      // Guard against replacing the icon when nothing actually changed: an
      // unconditional replaceChildren here — even to identical-looking
      // content — mutates the DOM directly under the pointer on every
      // hover-triggered render, which makes the browser recompute hit-test
      // state and re-fire mouseenter on the very button whose handler just
      // ran, looping synchronously. Same root cause as the MutationObserver
      // feedback-loop bug class, just via hover instead of an observer.
      const iconKey = `${filled}:${px}`;

      if (button.dataset.icon !== iconKey) {
        button.dataset.icon = iconKey;
        const icon = buildStarSvg(filled ? Star : StarOutline, px);
        icon.dataset.filled = String(filled);
        button.replaceChildren(icon);
      }
    }
  }

  #renderStaticStars() {
    const { value, max, size } = this;
    const px = SIZE_PX[size];

    this.replaceChildren(
      ...Array.from({ length: max }, (_, i) => {
        const starNumber = i + 1;
        const filled = starNumber <= value;
        const svg = buildStarSvg(filled ? Star : StarOutline, px);
        svg.dataset.filled = String(filled);

        return svg;
      }),
    );
  }
}

export function registerGnomeRatingStars() {
  defineCustomElement('gnome-rating-stars', GnomeRatingStarsElement);
}

registerGnomeRatingStars();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-rating-stars': GnomeRatingStarsElement;
  }
}
