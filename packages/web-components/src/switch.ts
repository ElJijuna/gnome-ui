import { defineCustomElement, HTMLElementBase } from './internal/dom';

interface ManagedSwitchState {
  disabled: boolean;
}

/**
 * Styled light-DOM wrapper for a native on/off toggle.
 *
 * The native control must be a descendant marked with
 * `data-slot="switch-control"` and should be an
 * `<input type="checkbox" role="switch">`. Keeping the actual `<input>` in
 * light DOM preserves form participation, native `change`/`input` events,
 * keyboard behavior, and compatibility with htmx attributes.
 */
export class GnomeSwitchElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled'];

  #connected = false;
  #control: HTMLInputElement | null = null;
  #managedStates = new WeakMap<HTMLInputElement, ManagedSwitchState>();
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#syncControl();
    this.#observeControl();
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

  get checked() {
    return this.#control?.checked ?? false;
  }

  set checked(value: boolean) {
    if (this.#control) {
      this.#control.checked = value;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  override click() {
    this.#control?.click();
  }

  override focus(options?: FocusOptions) {
    if (this.#control) {
      this.#control.focus(options);
    } else {
      super.focus(options);
    }
  }

  #observeControl() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver((mutations) => {
      const partsChanged = mutations.some(
        (mutation) =>
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' && mutation.attributeName === 'data-slot'),
      );

      if (partsChanged) {
        this.#syncControl();
        return;
      }

      const controlDisabledChanged = mutations.some(
        (mutation) => mutation.target === this.#control && mutation.attributeName === 'disabled',
      );

      if (!controlDisabledChanged || !this.#control) {
        return;
      }

      const state = this.#managedStates.get(this.#control);

      if (!state) {
        return;
      }

      if (this.disabled) {
        this.#syncState();
      } else {
        state.disabled = this.#control.disabled;
        this.#syncState();
      }
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['data-slot', 'disabled'],
      childList: true,
      subtree: true,
    });
  }

  #syncControl() {
    const control = this.querySelector<HTMLInputElement>('input[data-slot="switch-control"]');

    if (control !== this.#control) {
      if (this.#control) {
        this.#restoreControl(this.#control);
      }

      this.#control = control;

      if (control) {
        this.#managedStates.set(control, {
          disabled: control.disabled,
        });
      }
    }

    this.#syncState();
  }

  #syncState() {
    const state = this.#control ? this.#managedStates.get(this.#control) : undefined;
    const effectivelyDisabled = this.disabled || Boolean(state?.disabled);

    this.dataset.state = effectivelyDisabled ? 'disabled' : 'ready';
    this.toggleAttribute('data-disabled', effectivelyDisabled);

    if (!this.#control || !state) {
      return;
    }

    if (this.#control.disabled !== effectivelyDisabled) {
      this.#control.disabled = effectivelyDisabled;
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

export function registerGnomeSwitch() {
  defineCustomElement('gnome-switch', GnomeSwitchElement);
}

registerGnomeSwitch();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-switch': GnomeSwitchElement;
  }
}
