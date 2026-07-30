import { defineCustomElement, HTMLElementBase } from './internal/dom';

interface ManagedSpinButtonState {
  disabled: boolean;
}

const CONTROL_SELECTOR = 'input[type="number"][data-slot="spin-button-control"]';
const DECREMENT_SELECTOR = '[data-slot="spin-button-decrement"]';
const INCREMENT_SELECTOR = '[data-slot="spin-button-increment"]';

/**
 * Styled light-DOM wrapper around a native `<input type="number">` with
 * decrement/increment buttons.
 *
 * Unlike the React `SpinButton` (a synthetic `role="spinbutton"` widget),
 * this host composes a real `<input type="number">` — native `min`/`max`/
 * `step` constraint validation, ArrowUp/ArrowDown stepping, typing, and form
 * participation all keep working. The host only wires the decrement/
 * increment buttons to `stepDown()`/`stepUp()` and keeps their `disabled`
 * state in sync with the control's bounds.
 */
export class GnomeSpinButtonElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled'];

  #connected = false;
  #control: HTMLInputElement | null = null;
  #decrementButton: HTMLButtonElement | null = null;
  #incrementButton: HTMLButtonElement | null = null;
  #managedStates = new WeakMap<HTMLInputElement, ManagedSpinButtonState>();
  #observer: MutationObserver | null = null;

  #handleControlInput = () => {
    this.#syncButtons();
  };

  #handleDecrement = () => {
    if (!this.#control || this.#control.disabled) {
      return;
    }

    this.#control.stepDown();
    this.#commit();
  };

  #handleIncrement = () => {
    if (!this.#control || this.#control.disabled) {
      return;
    }

    this.#control.stepUp();
    this.#commit();
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
    this.#decrementButton?.removeEventListener('click', this.#handleDecrement);
    this.#incrementButton?.removeEventListener('click', this.#handleIncrement);
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
      this.#syncButtons();
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

  #commit() {
    this.#control?.dispatchEvent(new Event('input', { bubbles: true }));
    this.#control?.dispatchEvent(new Event('change', { bubbles: true }));
    this.#syncButtons();
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

    const decrementButton = this.querySelector<HTMLButtonElement>(DECREMENT_SELECTOR);
    const incrementButton = this.querySelector<HTMLButtonElement>(INCREMENT_SELECTOR);

    if (decrementButton !== this.#decrementButton) {
      this.#decrementButton?.removeEventListener('click', this.#handleDecrement);
      this.#decrementButton = decrementButton;
      decrementButton?.addEventListener('click', this.#handleDecrement);
    }

    if (incrementButton !== this.#incrementButton) {
      this.#incrementButton?.removeEventListener('click', this.#handleIncrement);
      this.#incrementButton = incrementButton;
      incrementButton?.addEventListener('click', this.#handleIncrement);
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

    this.#syncButtons();
  }

  #syncButtons() {
    if (!this.#control) {
      return;
    }

    const effectivelyDisabled = this.disabled || this.#control.disabled;
    const { valueAsNumber, min, max } = this.#control;
    const atMin = min !== '' && !Number.isNaN(valueAsNumber) && valueAsNumber <= Number(min);
    const atMax = max !== '' && !Number.isNaN(valueAsNumber) && valueAsNumber >= Number(max);

    if (this.#decrementButton) {
      this.#decrementButton.disabled = effectivelyDisabled || atMin;
    }

    if (this.#incrementButton) {
      this.#incrementButton.disabled = effectivelyDisabled || atMax;
    }
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

export function registerGnomeSpinButton() {
  defineCustomElement('gnome-spin-button', GnomeSpinButtonElement);
}

registerGnomeSpinButton();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-spin-button': GnomeSpinButtonElement;
  }
}
