import { defineCustomElement, ensureId, HTMLElementBase } from './internal/dom';
import { computeFloatingPosition, type FloatingPlacement } from './internal/floating';

export type GnomeTooltipPlacement = FloatingPlacement;

const TRIGGER_SELECTOR = '[data-slot="tooltip-trigger"]';
const CONTENT_SELECTOR = '[data-slot="tooltip-content"]';

/**
 * Informational tooltip shown on hover or keyboard focus.
 *
 * Requires descendants marked `data-slot="tooltip-trigger"` and
 * `data-slot="tooltip-content"`. Reuses `computeFloatingPosition` from
 * `internal/floating.ts` (the same module `gnome-popover` uses) for
 * placement and its flip/clamp/arrow-offset logic.
 *
 * Unlike `gnome-popover`, the content is never `hidden` (`display: none`)
 * — it stays laid out at all times with `opacity: 0`, only fading in via
 * `[data-state="open"]`. This is what lets the fade/scale transition
 * animate at all (a `display: none` element cannot transition), and as a
 * side effect keeps the description available to `aria-describedby`
 * readers even while the visual bubble is hidden, unlike the React
 * version's `visibility: hidden` fallback which removes it from the
 * accessibility tree between hovers.
 */
export class GnomeTooltipElement extends HTMLElementBase {
  static readonly observedAttributes = ['delay', 'placement'];

  #connected = false;
  #trigger: HTMLElement | null = null;
  #content: HTMLElement | null = null;
  #visible = false;
  #showTimer: ReturnType<typeof setTimeout> | null = null;
  #partsObserver: MutationObserver | null = null;
  #generatedDescribedBy = new WeakMap<HTMLElement, string>();

  connectedCallback() {
    this.#connected = true;
    this.dataset.state = 'closed';
    this.#syncParts();
    this.#observeParts();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#partsObserver?.disconnect();
    this.#partsObserver = null;
    this.#clearShowTimer();
    this.#removeGlobalListeners();

    if (this.#trigger) {
      this.#detachTrigger(this.#trigger);
    }

    this.#trigger = null;
    this.#content = null;
    this.#visible = false;
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'placement' && this.#visible) {
      this.#applyPosition();
    }
  }

  get placement(): GnomeTooltipPlacement {
    const value = this.getAttribute('placement');

    return value === 'bottom' || value === 'left' || value === 'right' ? value : 'top';
  }

  set placement(value: GnomeTooltipPlacement) {
    this.setAttribute('placement', value);
  }

  get delay() {
    const value = Number(this.getAttribute('delay') ?? 500);

    return Number.isFinite(value) && value >= 0 ? value : 500;
  }

  set delay(value: number) {
    this.setAttribute('delay', String(Math.max(0, value)));
  }

  show() {
    this.#clearShowTimer();
    this.#reveal();
  }

  hide() {
    this.#clearShowTimer();
    this.#conceal();
  }

  #syncParts() {
    const trigger = this.querySelector<HTMLElement>(TRIGGER_SELECTOR);
    const content = this.querySelector<HTMLElement>(CONTENT_SELECTOR);

    if (this.#trigger !== trigger) {
      if (this.#trigger) {
        this.#detachTrigger(this.#trigger);
      }

      this.#trigger = trigger;

      if (this.#trigger) {
        this.#attachTrigger(this.#trigger);
      }
    }

    this.#content = content;

    if (this.#content && !this.#content.hasAttribute('role')) {
      this.#content.setAttribute('role', 'tooltip');
    }

    this.#syncDescribedBy();
  }

  #syncDescribedBy() {
    if (!this.#trigger || !this.#content) {
      return;
    }

    const contentId = ensureId(this.#content, 'gnome-tooltip-content');
    const generated = this.#generatedDescribedBy.get(this.#trigger);
    const describedBy = this.#trigger.getAttribute('aria-describedby');

    if (describedBy && describedBy !== generated) {
      this.#generatedDescribedBy.delete(this.#trigger);
      return;
    }

    if (describedBy !== contentId) {
      this.#trigger.setAttribute('aria-describedby', contentId);
    }

    this.#generatedDescribedBy.set(this.#trigger, contentId);
  }

  #clearDescribedBy(trigger: HTMLElement) {
    const generated = this.#generatedDescribedBy.get(trigger);

    if (generated && trigger.getAttribute('aria-describedby') === generated) {
      trigger.removeAttribute('aria-describedby');
    }

    this.#generatedDescribedBy.delete(trigger);
  }

  #attachTrigger(trigger: HTMLElement) {
    trigger.addEventListener('mouseenter', this.#handleTriggerEnter);
    trigger.addEventListener('mouseleave', this.#handleTriggerLeave);
    trigger.addEventListener('focus', this.#handleTriggerEnter);
    trigger.addEventListener('blur', this.#handleTriggerLeave);
  }

  #detachTrigger(trigger: HTMLElement) {
    trigger.removeEventListener('mouseenter', this.#handleTriggerEnter);
    trigger.removeEventListener('mouseleave', this.#handleTriggerLeave);
    trigger.removeEventListener('focus', this.#handleTriggerEnter);
    trigger.removeEventListener('blur', this.#handleTriggerLeave);
    this.#clearDescribedBy(trigger);
  }

  #observeParts() {
    this.#partsObserver?.disconnect();
    this.#partsObserver = new MutationObserver(() => this.#refreshParts());
    this.#partsObserver.observe(this, {
      attributes: true,
      attributeFilter: ['aria-describedby', 'data-slot', 'id'],
      childList: true,
      subtree: true,
    });
  }

  #refreshParts() {
    this.#syncParts();

    if (!this.#visible) {
      return;
    }

    if (!this.#trigger || !this.#content) {
      this.#conceal();
      return;
    }

    this.#applyPosition();
  }

  #reveal() {
    if (this.#visible || !this.#trigger || !this.#content) {
      return;
    }

    this.#visible = true;
    this.#applyPosition();
    this.dataset.state = 'open';
    this.#content.dataset.state = 'open';
    this.#addGlobalListeners();
  }

  #conceal() {
    if (!this.#visible) {
      return;
    }

    this.#visible = false;
    this.dataset.state = 'closed';

    if (this.#content) {
      this.#content.dataset.state = 'closed';
    }

    this.#removeGlobalListeners();
  }

  #applyPosition = () => {
    if (!this.#visible || !this.#trigger || !this.#content) {
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
    this.#content.style.setProperty('--gnome-tooltip-arrow-offset', `${position.arrowOffset}px`);
  };

  #addGlobalListeners() {
    document.addEventListener('keydown', this.#handleKeyDown);
    window.addEventListener('resize', this.#applyPosition);
    window.addEventListener('scroll', this.#applyPosition, true);
  }

  #removeGlobalListeners() {
    document.removeEventListener('keydown', this.#handleKeyDown);
    window.removeEventListener('resize', this.#applyPosition);
    window.removeEventListener('scroll', this.#applyPosition, true);
  }

  #handleTriggerEnter = () => {
    this.#clearShowTimer();

    if (this.delay === 0) {
      this.#reveal();
      return;
    }

    this.#showTimer = setTimeout(() => this.#reveal(), this.delay);
  };

  #handleTriggerLeave = () => {
    this.#clearShowTimer();
    this.#conceal();
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hide();
    }
  };

  #clearShowTimer() {
    if (this.#showTimer) {
      clearTimeout(this.#showTimer);
      this.#showTimer = null;
    }
  }
}

export function registerGnomeTooltip() {
  defineCustomElement('gnome-tooltip', GnomeTooltipElement);
}

registerGnomeTooltip();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-tooltip': GnomeTooltipElement;
  }
}
