import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

interface ManagedRadioState {
  disabled: boolean;
}

export interface GnomeRadioGroupChangeDetail {
  value: string;
}

export interface GnomeRadioGroupEventMap extends HTMLElementEventMap {
  'gnome-change': CustomEvent<GnomeRadioGroupChangeDetail>;
}

let autoNameCounter = 0;

/**
 * Styled light-DOM wrapper around a group of native radio buttons.
 *
 * Descendants must be `<input type="radio" data-slot="radio-control">`.
 * Native same-name radios already provide mutual exclusivity, arrow-key
 * cycling, and Space/click selection in every browser, so the host does not
 * reimplement that behavior — it only assigns a shared `name` (from the
 * host's own `name` attribute, or an auto-generated one) to every control,
 * mirrors group-level `disabled` onto each control while preserving any
 * disabled state the consumer set directly on one, and normalizes selection
 * into a `value` property plus a `gnome-change` event.
 */
export class GnomeRadioGroupElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'name'];

  addEventListener<K extends keyof GnomeRadioGroupEventMap>(
    type: K,
    listener: (this: GnomeRadioGroupElement, event: GnomeRadioGroupEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeRadioGroupEventMap>(
    type: K,
    listener: (this: GnomeRadioGroupElement, event: GnomeRadioGroupEventMap[K]) => void,
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
  #autoName: string | null = null;
  #controls: HTMLInputElement[] = [];
  #managedStates = new WeakMap<HTMLInputElement, ManagedRadioState>();
  #observer: MutationObserver | null = null;

  #handleChange = (event: Event) => {
    const target = event.target;

    if (
      target instanceof HTMLInputElement &&
      this.#controls.includes(target) &&
      target.checked
    ) {
      emit<GnomeRadioGroupChangeDetail>(this, 'gnome-change', { value: target.value });
    }
  };

  connectedCallback() {
    this.#connected = true;
    this.#syncControls();
    this.#observeControls();
    this.addEventListener('change', this.#handleChange);
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.removeEventListener('change', this.#handleChange);
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncControls();
    }
  }

  get controls() {
    return [...this.#controls];
  }

  get value() {
    return this.#controls.find((control) => control.checked)?.value ?? '';
  }

  set value(value: string) {
    const match = this.#controls.find((control) => control.value === value);

    if (match) {
      match.checked = true;
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get name() {
    return this.getAttribute('name') ?? '';
  }

  set name(value: string) {
    this.setAttribute('name', value);
  }

  #groupName() {
    const explicit = this.getAttribute('name');

    if (explicit) {
      return explicit;
    }

    if (!this.#autoName) {
      autoNameCounter += 1;
      this.#autoName = `gnome-radio-group-${autoNameCounter}`;
    }

    return this.#autoName;
  }

  #observeControls() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver((mutations) => {
      const partsChanged = mutations.some(
        (mutation) =>
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' && mutation.attributeName === 'data-slot'),
      );

      if (partsChanged) {
        this.#syncControls();
        return;
      }

      const disabledChanged = mutations.some(
        (mutation) =>
          mutation.attributeName === 'disabled' &&
          mutation.target instanceof HTMLInputElement &&
          this.#controls.includes(mutation.target),
      );

      if (!disabledChanged) {
        return;
      }

      if (!this.disabled) {
        for (const control of this.#controls) {
          const state = this.#managedStates.get(control);

          if (state) {
            state.disabled = control.disabled;
          }
        }
      }

      this.#applyState();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['data-slot', 'disabled'],
      childList: true,
      subtree: true,
    });
  }

  #syncControls() {
    const controls = Array.from(
      this.querySelectorAll<HTMLInputElement>('input[data-slot="radio-control"]'),
    );
    const previous = this.#controls;
    this.#controls = controls;

    for (const control of previous) {
      if (!controls.includes(control)) {
        this.#restoreControl(control);
      }
    }

    for (const control of controls) {
      if (!this.#managedStates.has(control)) {
        this.#managedStates.set(control, { disabled: control.disabled });
      }
    }

    const groupName = this.#groupName();

    for (const control of controls) {
      if (control.name !== groupName) {
        control.name = groupName;
      }
    }

    this.#applyState();
  }

  #applyState() {
    const effectivelyDisabled = this.disabled;

    this.dataset.state = effectivelyDisabled ? 'disabled' : 'ready';
    this.toggleAttribute('data-disabled', effectivelyDisabled);

    for (const control of this.#controls) {
      const state = this.#managedStates.get(control);

      if (!state) {
        continue;
      }

      const shouldDisable = effectivelyDisabled || state.disabled;

      if (control.disabled !== shouldDisable) {
        control.disabled = shouldDisable;
      }
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

export function registerGnomeRadioGroup() {
  defineCustomElement('gnome-radio-group', GnomeRadioGroupElement);
}

registerGnomeRadioGroup();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-radio-group': GnomeRadioGroupElement;
  }
}
