import { defineCustomElement, HTMLElementBase } from './internal/dom';

interface ManagedSliderState {
  disabled: boolean;
}

const CONTROL_SELECTOR = 'input[type="range"][data-slot="slider-control"]';

/**
 * Styled light-DOM wrapper around a native `<input type="range">`.
 *
 * Unlike the React `Slider` (a synthetic `role="slider"` widget built on
 * pointer-event handlers), this host composes a real `<input type="range">`
 * — native pointer/touch dragging, ArrowLeft/Right/Up/Down and Home/End/
 * PageUp/PageDown keyboard support, and form participation all keep
 * working. The host only recomputes a `--gnome-slider-fill` custom property
 * on every value change so the CSS can paint the accent-colored fill up to
 * the thumb (Firefox does this natively via `::-moz-range-progress`; the
 * custom property drives the equivalent WebKit/Blink track gradient).
 */
export class GnomeSliderElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled'];

  #connected = false;
  #control: HTMLInputElement | null = null;
  #managedStates = new WeakMap<HTMLInputElement, ManagedSliderState>();
  #observer: MutationObserver | null = null;

  #handleControlInput = () => {
    this.#syncFill();
  };

  connectedCallback() {
    this.#connected = true;
    this.#syncControl();
    this.#observe();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#control?.removeEventListener('input', this.#handleControlInput);
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get control() {
    return this.#control;
  }

  get value() {
    return this.#control?.valueAsNumber ?? Number.NaN;
  }

  set value(value: number) {
    if (this.#control) {
      this.#control.value = String(value);
      this.#syncFill();
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  override focus(options?: FocusOptions) {
    if (this.#control) {
      this.#control.focus(options);
    } else {
      super.focus(options);
    }
  }

  #observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver((mutations) => {
      const structureChanged = mutations.some(
        (mutation) =>
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' && mutation.attributeName === 'data-slot'),
      );

      if (structureChanged) {
        this.#syncControl();
        return;
      }

      const controlChanged = mutations.some(
        (mutation) =>
          mutation.target === this.#control &&
          ['disabled', 'max', 'min', 'value'].includes(mutation.attributeName ?? ''),
      );

      if (!controlChanged || !this.#control) {
        return;
      }

      const state = this.#managedStates.get(this.#control);

      if (state && !this.disabled) {
        state.disabled = this.#control.disabled;
      }

      this.#syncState();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['data-slot', 'disabled', 'max', 'min', 'value'],
      childList: true,
      subtree: true,
    });
  }

  #syncControl() {
    const control = this.querySelector<HTMLInputElement>(CONTROL_SELECTOR);

    if (control !== this.#control) {
      this.#control?.removeEventListener('input', this.#handleControlInput);

      if (this.#control) {
        this.#restoreControl(this.#control);
      }

      this.#control = control;
      control?.addEventListener('input', this.#handleControlInput);

      if (control) {
        this.#managedStates.set(control, { disabled: control.disabled });
      }
    }

    this.#syncState();
  }

  #syncState() {
    const state = this.#control ? this.#managedStates.get(this.#control) : undefined;
    const effectivelyDisabled = this.disabled || Boolean(state?.disabled);

    this.toggleAttribute('data-disabled', effectivelyDisabled);

    if (this.#control && state && this.#control.disabled !== effectivelyDisabled) {
      this.#control.disabled = effectivelyDisabled;
    }

    this.#syncFill();
  }

  #syncFill() {
    if (!this.#control) {
      return;
    }

    const { valueAsNumber, min, max } = this.#control;
    const minValue = min === '' ? 0 : Number(min);
    const maxValue = max === '' ? 100 : Number(max);
    const range = maxValue - minValue;
    const percent = range > 0 ? ((valueAsNumber - minValue) / range) * 100 : 0;

    this.style.setProperty('--gnome-slider-fill', `${Math.min(100, Math.max(0, percent))}%`);
  }

  #restoreControl(control: HTMLInputElement) {
    const state = this.#managedStates.get(control);

    if (!state) {
      return;
    }

    control.disabled = state.disabled;
    this.#managedStates.delete(control);
  }
}

export function registerGnomeSlider() {
  defineCustomElement('gnome-slider', GnomeSliderElement);
}

registerGnomeSlider();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-slider': GnomeSliderElement;
  }
}
