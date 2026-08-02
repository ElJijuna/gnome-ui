import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeIconButtonVariant = 'default' | 'destructive' | 'flat' | 'raised' | 'suggested';
export type GnomeIconButtonSize = 'lg' | 'md' | 'sm';

interface ManagedIconButtonState {
  ariaBusy: string | null;
  ariaLabel: string | null;
  disabled: boolean;
}

/**
 * Styled light-DOM wrapper for a native icon-only button.
 *
 * The native control must be a descendant marked with
 * `data-slot="icon-button-control"`. Always circular — unlike `gnome-button`,
 * shape isn't a choice here, since an icon-only control has no text that
 * would make a rectangular shape meaningful. `label` is required for an
 * accessible name and is synced onto the control's `aria-label`, mirroring
 * how `gnome-button` manages `aria-busy`/`disabled`: consumer-authored
 * `aria-label` is preserved and restored once `label` is removed or the
 * control is swapped (e.g. by htmx).
 */
export class GnomeIconButtonElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'label', 'loading', 'osd', 'size', 'variant'];

  #connected = false;
  #control: HTMLButtonElement | null = null;
  #managedStates = new WeakMap<HTMLButtonElement, ManagedIconButtonState>();
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

  get variant(): GnomeIconButtonVariant {
    const value = this.getAttribute('variant');

    return value === 'suggested' ||
      value === 'destructive' ||
      value === 'flat' ||
      value === 'raised'
      ? value
      : 'default';
  }

  set variant(value: GnomeIconButtonVariant) {
    this.setAttribute('variant', value);
  }

  get size(): GnomeIconButtonSize {
    const value = this.getAttribute('size');
    return value === 'sm' || value === 'lg' ? value : 'md';
  }

  set size(value: GnomeIconButtonSize) {
    this.setAttribute('size', value);
  }

  get label() {
    return this.getAttribute('label') ?? '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get loading() {
    return this.hasAttribute('loading');
  }

  set loading(value: boolean) {
    this.toggleAttribute('loading', value);
  }

  get osd() {
    return this.hasAttribute('osd');
  }

  set osd(value: boolean) {
    this.toggleAttribute('osd', value);
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

      const controlStateChanged = mutations.some(
        (mutation) =>
          mutation.target === this.#control &&
          (mutation.attributeName === 'aria-busy' ||
            mutation.attributeName === 'aria-label' ||
            mutation.attributeName === 'disabled'),
      );

      if (!controlStateChanged || !this.#control) {
        return;
      }

      const state = this.#managedStates.get(this.#control);

      if (!state) {
        return;
      }

      if (this.disabled || this.loading) {
        this.#syncState();
        return;
      }

      state.disabled = this.#control.disabled;
      state.ariaBusy = this.#control.getAttribute('aria-busy');

      if (!this.label) {
        state.ariaLabel = this.#control.getAttribute('aria-label');
      }

      this.#syncState();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['aria-busy', 'aria-label', 'data-slot', 'disabled'],
      childList: true,
      subtree: true,
    });
  }

  #syncControl() {
    const control = this.querySelector<HTMLButtonElement>(
      'button[data-slot="icon-button-control"]',
    );

    if (control !== this.#control) {
      if (this.#control) {
        this.#restoreControl(this.#control);
      }

      this.#control = control;

      if (control) {
        this.#managedStates.set(control, {
          ariaBusy: control.getAttribute('aria-busy'),
          ariaLabel: control.getAttribute('aria-label'),
          disabled: control.disabled,
        });
      }
    }

    this.#syncState();
  }

  #syncState() {
    const state = this.#control ? this.#managedStates.get(this.#control) : undefined;
    const effectivelyDisabled = this.disabled || this.loading || Boolean(state?.disabled);

    this.dataset.variant = this.variant;
    this.dataset.size = this.size;
    this.dataset.state = this.loading ? 'loading' : effectivelyDisabled ? 'disabled' : 'ready';
    this.toggleAttribute('data-disabled', effectivelyDisabled);
    this.toggleAttribute('data-loading', this.loading);
    this.toggleAttribute('data-osd', this.osd);

    if (!this.#control || !state) {
      return;
    }

    if (this.#control.disabled !== effectivelyDisabled) {
      this.#control.disabled = effectivelyDisabled;
    }

    if (this.loading) {
      if (this.#control.getAttribute('aria-busy') !== 'true') {
        this.#control.setAttribute('aria-busy', 'true');
      }
    } else if (state.ariaBusy === null) {
      this.#control.removeAttribute('aria-busy');
    } else if (this.#control.getAttribute('aria-busy') !== state.ariaBusy) {
      this.#control.setAttribute('aria-busy', state.ariaBusy);
    }

    if (this.label) {
      if (this.#control.getAttribute('aria-label') !== this.label) {
        this.#control.setAttribute('aria-label', this.label);
      }
    } else if (state.ariaLabel === null) {
      this.#control.removeAttribute('aria-label');
    } else if (this.#control.getAttribute('aria-label') !== state.ariaLabel) {
      this.#control.setAttribute('aria-label', state.ariaLabel);
    }
  }

  #restoreControl(control: HTMLButtonElement) {
    const state = this.#managedStates.get(control);

    if (!state) {
      return;
    }

    control.disabled = state.disabled;

    if (state.ariaBusy === null) {
      control.removeAttribute('aria-busy');
    } else {
      control.setAttribute('aria-busy', state.ariaBusy);
    }

    if (state.ariaLabel === null) {
      control.removeAttribute('aria-label');
    } else {
      control.setAttribute('aria-label', state.ariaLabel);
    }

    this.#managedStates.delete(control);
  }
}

export function registerGnomeIconButton() {
  defineCustomElement('gnome-icon-button', GnomeIconButtonElement);
}

registerGnomeIconButton();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-icon-button': GnomeIconButtonElement;
  }
}
