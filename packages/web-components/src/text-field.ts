import { defineCustomElement, ensureId, HTMLElementBase } from './internal/dom';

type GnomeTextFieldControl = HTMLInputElement | HTMLTextAreaElement;

interface ManagedTextFieldState {
  ariaInvalid: string | null;
  disabled: boolean;
}

const CONTROL_SELECTOR =
  'input[data-slot="text-field-control"], textarea[data-slot="text-field-control"]';

/**
 * Styled light-DOM wrapper around a native text input or textarea, with
 * optional label and helper/error text slots.
 *
 * The native control must be a descendant marked with
 * `data-slot="text-field-control"`. A descendant `<label
 * data-slot="text-field-label">` is linked to the control via `for`/`id`,
 * and a descendant marked `data-slot="text-field-hint"` is linked via
 * `aria-describedby`. Consumers own all label/hint text content — the host
 * only wires ARIA relationships and state, and preserves native form
 * participation, `value`, and validation.
 */
export class GnomeTextFieldElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'invalid'];

  #connected = false;
  #control: GnomeTextFieldControl | null = null;
  #hint: HTMLElement | null = null;
  #label: HTMLLabelElement | null = null;
  #managedStates = new WeakMap<GnomeTextFieldControl, ManagedTextFieldState>();
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#syncControl();
    this.#observe();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
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
    return this.#control?.value ?? '';
  }

  set value(value: string) {
    if (this.#control) {
      this.#control.value = value;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get invalid() {
    return this.hasAttribute('invalid');
  }

  set invalid(value: boolean) {
    this.toggleAttribute('invalid', value);
  }

  get validity(): ValidityState | undefined {
    return this.#control?.validity;
  }

  checkValidity() {
    return this.#control?.checkValidity() ?? true;
  }

  reportValidity() {
    return this.#control?.reportValidity() ?? true;
  }

  setCustomValidity(message: string) {
    this.#control?.setCustomValidity(message);
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

      const controlStateChanged = mutations.some(
        (mutation) =>
          mutation.target === this.#control &&
          (mutation.attributeName === 'disabled' || mutation.attributeName === 'aria-invalid'),
      );

      if (!controlStateChanged || !this.#control) {
        return;
      }

      const state = this.#managedStates.get(this.#control);

      if (!state) {
        return;
      }

      if (!this.disabled) {
        state.disabled = this.#control.disabled;
      }

      if (!this.invalid) {
        state.ariaInvalid = this.#control.getAttribute('aria-invalid');
      }

      this.#syncState();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['aria-invalid', 'data-slot', 'disabled'],
      childList: true,
      subtree: true,
    });
  }

  #syncControl() {
    const control = this.querySelector<GnomeTextFieldControl>(CONTROL_SELECTOR);

    if (control !== this.#control) {
      if (this.#control) {
        this.#restoreControl(this.#control);
      }

      this.#control = control;

      if (control) {
        this.#managedStates.set(control, {
          ariaInvalid: control.getAttribute('aria-invalid'),
          disabled: control.disabled,
        });
      }
    }

    this.#hint = this.querySelector<HTMLElement>('[data-slot="text-field-hint"]');
    this.#label = this.querySelector<HTMLLabelElement>('label[data-slot="text-field-label"]');
    this.#syncState();
  }

  #syncState() {
    const state = this.#control ? this.#managedStates.get(this.#control) : undefined;
    const effectivelyDisabled = this.disabled || Boolean(state?.disabled);

    this.toggleAttribute('data-disabled', effectivelyDisabled);

    if (this.#control && this.#hint) {
      this.#control.setAttribute('aria-describedby', ensureId(this.#hint, 'gnome-text-field-hint'));
    } else if (this.#control) {
      this.#control.removeAttribute('aria-describedby');
    }

    if (this.#control && this.#label) {
      this.#label.htmlFor = ensureId(this.#control, 'gnome-text-field-control');
    }

    if (!this.#control || !state) {
      return;
    }

    if (this.#control.disabled !== effectivelyDisabled) {
      this.#control.disabled = effectivelyDisabled;
    }

    if (this.invalid) {
      if (this.#control.getAttribute('aria-invalid') !== 'true') {
        this.#control.setAttribute('aria-invalid', 'true');
      }
    } else if (state.ariaInvalid === null) {
      this.#control.removeAttribute('aria-invalid');
    } else if (this.#control.getAttribute('aria-invalid') !== state.ariaInvalid) {
      this.#control.setAttribute('aria-invalid', state.ariaInvalid);
    }
  }

  #restoreControl(control: GnomeTextFieldControl) {
    const state = this.#managedStates.get(control);

    if (!state) {
      return;
    }

    control.disabled = state.disabled;

    if (state.ariaInvalid === null) {
      control.removeAttribute('aria-invalid');
    } else {
      control.setAttribute('aria-invalid', state.ariaInvalid);
    }

    this.#managedStates.delete(control);
  }
}

export function registerGnomeTextField() {
  defineCustomElement('gnome-text-field', GnomeTextFieldElement);
}

registerGnomeTextField();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-text-field': GnomeTextFieldElement;
  }
}
