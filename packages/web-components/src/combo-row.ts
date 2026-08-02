import { defineCustomElement, HTMLElementBase } from './internal/dom';

const SUFFIX_SELECTOR = '[data-slot="row-suffix"]';

/**
 * Settings row with an inline combo selector at the trailing edge —
 * mirrors `AdwComboRow`.
 *
 * Genuinely composes `gnome-action-row`'s layout conventions
 * (`row-prefix`/`row-title`/`row-subtitle`/`row-suffix`) with a real,
 * consumer-authored `<gnome-dropdown>` placed in `data-slot="row-suffix"`
 * — no combobox logic is duplicated here; the nested dropdown registers
 * and behaves completely on its own once connected. Unlike
 * `gnome-action-row`, this row is never itself interactive (there is no
 * row-level click activation, only the nested dropdown trigger), so the
 * title/subtitle stacking is handled entirely by CSS grid areas — no
 * JS-generated `row-content` wrapper is needed the way `gnome-action-row`
 * needs one to support its optional `<button data-slot="row-surface">`.
 *
 * The host's `disabled` attribute dims the row and forwards `disabled` to
 * whichever element is marked `data-slot="row-suffix"`, if it exposes a
 * `disabled` property (works for `gnome-dropdown`, `gnome-button`, or a
 * native control marked directly with that slot).
 */
export class GnomeComboRowElement extends HTMLElementBase {
  static readonly observedAttributes = ['disabled'];

  #connected = false;
  #observer: MutationObserver | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#syncDisabled();
    this.#observeSuffix();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncDisabled();
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #observeSuffix() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => this.#syncDisabled());
    this.#observer.observe(this, { childList: true, subtree: true });
  }

  #syncDisabled() {
    const { disabled } = this;

    this.toggleAttribute('data-disabled', disabled);

    const control = this.querySelector<HTMLElement & { disabled?: boolean }>(SUFFIX_SELECTOR);

    if (control && 'disabled' in control && control.disabled !== disabled) {
      control.disabled = disabled;
    }
  }
}

export function registerGnomeComboRow() {
  defineCustomElement('gnome-combo-row', GnomeComboRowElement);
}

registerGnomeComboRow();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-combo-row': GnomeComboRowElement;
  }
}
