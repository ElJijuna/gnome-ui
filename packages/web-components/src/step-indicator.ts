import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeStepIndicatorOrientation = 'horizontal' | 'vertical';

export interface GnomeStepIndicatorSelectDetail {
  step: number;
}

export interface GnomeStepIndicatorEventMap extends HTMLElementEventMap {
  'gnome-select': CustomEvent<GnomeStepIndicatorSelectDetail>;
}

const CAPTION_SELECTOR = '[data-slot="step-indicator-caption"]';
const LIST_SELECTOR = '[data-slot="step-indicator-list"]';
const CIRCLE_SELECTOR = '[data-slot="step-circle"]';

/**
 * Numbered "Step X of Y" progress indicator for onboarding/wizard flows —
 * steps are numbered circles connected by a progress line, with the
 * completed portion tinted in the accent color.
 *
 * Purely attribute-driven and fully host-derived — nothing for the
 * consumer to author, same rationale as `gnome-divider`/`gnome-highlight`.
 * `steps` accepts either a plain count (`steps="4"`, unlabeled — only the
 * "Step X of Y" caption shown, mirroring `@gnome-ui/react`'s
 * `StepIndicator` accepting a plain `number`) or a comma-separated label
 * list (`steps="Account,Profile,Confirm"`, mirroring its `string[]` case —
 * each step's label is shown beneath its circle instead of the caption).
 *
 * Completed steps are only clickable when `clickable` is set (mirrors
 * react's `onStepClick` being optional to make steps non-interactive) — a
 * click on a completed step's circle emits `gnome-select` with
 * `{ step }`; the current and upcoming steps are never clickable.
 */
export class GnomeStepIndicatorElement extends HTMLElementBase {
  static readonly observedAttributes = ['clickable', 'current', 'label', 'orientation', 'steps'];

  addEventListener<K extends keyof GnomeStepIndicatorEventMap>(
    type: K,
    listener: (this: GnomeStepIndicatorElement, event: GnomeStepIndicatorEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeStepIndicatorEventMap>(
    type: K,
    listener: (this: GnomeStepIndicatorElement, event: GnomeStepIndicatorEventMap[K]) => void,
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

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'navigation');
    }

    this.addEventListener('click', this.#handleClick);
    this.#syncContent();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'label') {
      this.#syncLabel();
      return;
    }

    this.#syncContent();
  }

  get stepLabels(): string[] | null {
    const raw = this.getAttribute('steps') ?? '';

    return raw.includes(',') ? raw.split(',').map((label) => label.trim()) : null;
  }

  get stepCount() {
    const labels = this.stepLabels;

    if (labels) {
      return labels.length;
    }

    const parsed = Number(this.getAttribute('steps'));

    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }

  get current() {
    const parsed = Number(this.getAttribute('current'));
    const clamped = Number.isFinite(parsed) ? parsed : 0;

    return Math.max(0, Math.min(clamped, this.stepCount - 1));
  }

  set current(value: number) {
    this.setAttribute('current', String(value));
  }

  get orientation(): GnomeStepIndicatorOrientation {
    return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
  }

  set orientation(value: GnomeStepIndicatorOrientation) {
    this.setAttribute('orientation', value);
  }

  get clickable() {
    return this.hasAttribute('clickable');
  }

  set clickable(value: boolean) {
    this.toggleAttribute('clickable', value);
  }

  get label() {
    return this.getAttribute('label') ?? 'Progress';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  #syncLabel() {
    this.setAttribute('aria-label', this.label);
  }

  #syncContent() {
    this.#syncLabel();
    this.dataset.orientation = this.orientation;

    const { stepCount, current, stepLabels, clickable } = this;

    let caption = this.querySelector<HTMLElement>(CAPTION_SELECTOR);

    if (stepLabels) {
      caption?.remove();
    } else {
      if (!caption) {
        caption = document.createElement('span');
        caption.dataset.slot = 'step-indicator-caption';
        this.prepend(caption);
      }

      caption.textContent = `Step ${current + 1} of ${stepCount}`;
    }

    let list = this.querySelector<HTMLElement>(LIST_SELECTOR);

    if (!list) {
      list = document.createElement('ol');
      list.dataset.slot = 'step-indicator-list';
      this.append(list);
    }

    list.textContent = '';

    for (let index = 0; index < stepCount; index += 1) {
      const isCompleted = index < current;
      const isCurrent = index === current;
      const stepLabel = stepLabels?.[index];

      const item = document.createElement('li');
      item.dataset.slot = 'step-item';
      item.toggleAttribute('data-completed', isCompleted);
      item.toggleAttribute('data-current', isCurrent);

      const isClickable = clickable && isCompleted;
      const circle = document.createElement(isClickable ? 'button' : 'span');
      circle.dataset.slot = 'step-circle';

      if (isClickable) {
        (circle as HTMLButtonElement).type = 'button';
      }

      if (isCurrent) {
        circle.setAttribute('aria-current', 'step');
      }

      if (!stepLabel) {
        circle.setAttribute('aria-label', `Step ${index + 1}`);
      }

      if (!isCompleted) {
        circle.textContent = String(index + 1);
      }

      item.append(circle);

      if (stepLabel) {
        const labelEl = document.createElement('span');
        labelEl.dataset.slot = 'step-label';
        labelEl.textContent = stepLabel;
        item.append(labelEl);
      }

      list.append(item);
    }
  }

  #handleClick = (event: MouseEvent) => {
    if (!this.clickable || !(event.target instanceof Element)) {
      return;
    }

    const circle = event.target.closest<HTMLElement>(CIRCLE_SELECTOR);

    if (!circle || circle.tagName !== 'BUTTON' || !this.contains(circle)) {
      return;
    }

    const list = this.querySelector<HTMLElement>(LIST_SELECTOR);
    const items = list ? Array.from(list.children) : [];
    const item = circle.closest('li');
    const index = item ? items.indexOf(item) : -1;

    if (index === -1) {
      return;
    }

    emit<GnomeStepIndicatorSelectDetail>(this, 'gnome-select', { step: index });
  };
}

export function registerGnomeStepIndicator() {
  defineCustomElement('gnome-step-indicator', GnomeStepIndicatorElement);
}

registerGnomeStepIndicator();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-step-indicator': GnomeStepIndicatorElement;
  }
}
