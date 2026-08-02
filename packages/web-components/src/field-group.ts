import { defineCustomElement, ensureId, HTMLElementBase } from './internal/dom';

const FIELDSET_SELECTOR = '[data-slot="field-group-fieldset"]';
const LEGEND_SELECTOR = '[data-slot="field-group-legend"]';
const HINT_SELECTOR = '[data-slot="field-group-hint"]';

/**
 * Generic form-field grouping with a shared label, help text, and error
 * message, for arbitrary fields outside a `gnome-boxed-list`.
 *
 * Wraps a real `<fieldset data-slot="field-group-fieldset">`/`<legend
 * data-slot="field-group-legend">` — same rationale as `gnome-highlight`
 * wrapping real `<mark>` and `gnome-kbd` wrapping real `<kbd>` — so
 * `disabled` disables every descendant form control for free via native
 * fieldset behavior, no need to thread it through each child manually.
 *
 * All original light-DOM children (the fields themselves — checkboxes,
 * radios, a custom composite field) are moved, once, into a generated
 * `<div data-slot="field-group-content">` inside the fieldset — same
 * adopt-existing-children technique as `gnome-expander-row`'s panel,
 * idempotent via checking the fieldset already exists as a direct child
 * before rebuilding.
 */
export class GnomeFieldGroupElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled', 'error', 'helper-text', 'label'];

  #connected = false;
  #fieldset: HTMLFieldSetElement | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#wrapFieldset();
    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get label() {
    return this.getAttribute('label') ?? '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get helperText() {
    return this.getAttribute('helper-text') ?? '';
  }

  set helperText(value: string) {
    if (value) {
      this.setAttribute('helper-text', value);
    } else {
      this.removeAttribute('helper-text');
    }
  }

  get error() {
    return this.getAttribute('error') ?? '';
  }

  set error(value: string) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #wrapFieldset() {
    const existing = this.querySelector<HTMLFieldSetElement>(FIELDSET_SELECTOR);

    if (existing && existing.parentElement === this) {
      this.#fieldset = existing;
      return;
    }

    const remaining = Array.from(this.children);

    const fieldset = document.createElement('fieldset');
    fieldset.dataset.slot = 'field-group-fieldset';

    const legend = document.createElement('legend');
    legend.dataset.slot = 'field-group-legend';
    fieldset.append(legend);

    const content = document.createElement('div');
    content.dataset.slot = 'field-group-content';

    for (const child of remaining) {
      content.append(child);
    }

    fieldset.append(content);
    this.append(fieldset);
    this.#fieldset = fieldset;
  }

  #syncState() {
    const fieldset = this.#fieldset;

    if (!fieldset) {
      return;
    }

    const legend = fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR);

    if (legend && legend.textContent !== this.label) {
      legend.textContent = this.label;
    }

    if (fieldset.disabled !== this.disabled) {
      fieldset.disabled = this.disabled;
    }

    this.#syncHint(fieldset);
  }

  #syncHint(fieldset: HTMLFieldSetElement) {
    const { error, helperText } = this;
    const text = error || helperText;
    let hint = fieldset.querySelector<HTMLElement>(HINT_SELECTOR);

    if (!text) {
      hint?.remove();

      if (fieldset.hasAttribute('aria-describedby')) {
        fieldset.removeAttribute('aria-describedby');
      }

      return;
    }

    if (!hint) {
      hint = document.createElement('span');
      hint.dataset.slot = 'field-group-hint';
      fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR)?.after(hint);
    }

    if (hint.textContent !== text) {
      hint.textContent = text;
    }

    hint.toggleAttribute('data-error', Boolean(error));

    if (error) {
      hint.setAttribute('role', 'alert');
    } else if (hint.hasAttribute('role')) {
      hint.removeAttribute('role');
    }

    const hintId = ensureId(hint, 'gnome-field-group-hint');

    if (fieldset.getAttribute('aria-describedby') !== hintId) {
      fieldset.setAttribute('aria-describedby', hintId);
    }
  }
}

export function registerGnomeFieldGroup() {
  defineCustomElement('gnome-field-group', GnomeFieldGroupElement);
}

registerGnomeFieldGroup();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-field-group': GnomeFieldGroupElement;
  }
}
