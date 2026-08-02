import { defineCustomElement, HTMLElementBase } from './internal/dom';

const LINE_SELECTOR = '[data-slot="divider-line"]';
const LABEL_SELECTOR = '[data-slot="divider-label"]';

/**
 * Horizontal rule with an optional centered label — common auth/login-form
 * pattern ("Sign in" / **OR** / "Continue with Google").
 *
 * Purely presentational — no light-DOM children for the consumer to
 * author. The `label` attribute drives an `aria-label` and a host-derived
 * centered `[data-slot="divider-label"]` span between two
 * `[data-slot="divider-line"]` segments, fully rebuilt from `label` alone
 * — same rationale as `gnome-level-bar`'s discrete blocks.
 *
 * Distinct from `gnome-separator`, which is a bare dividing line with no
 * label but supports a vertical orientation — this component doesn't.
 */
export class GnomeDividerElement extends HTMLElementBase {
  static readonly observedAttributes = ['label'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }

    this.setAttribute('aria-orientation', 'horizontal');
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
    if (value) {
      this.setAttribute('label', value);
    } else {
      this.removeAttribute('label');
    }
  }

  #syncState() {
    const { label } = this;

    if (label) {
      this.setAttribute('aria-label', label);
    } else {
      this.removeAttribute('aria-label');
    }

    this.#syncStructure(label);
  }

  #syncStructure(label: string) {
    const lines = this.querySelectorAll<HTMLElement>(LINE_SELECTOR);
    const labelEl = this.querySelector<HTMLElement>(LABEL_SELECTOR);

    if (label) {
      if (lines.length !== 2 || !labelEl) {
        this.textContent = '';
        this.append(this.#createLine(), this.#createLabel(label), this.#createLine());
        return;
      }

      if (labelEl.textContent !== label) {
        labelEl.textContent = label;
      }

      return;
    }

    if (lines.length !== 1 || labelEl) {
      this.textContent = '';
      this.append(this.#createLine());
    }
  }

  #createLine() {
    const line = document.createElement('span');
    line.dataset.slot = 'divider-line';
    line.setAttribute('aria-hidden', 'true');

    return line;
  }

  #createLabel(label: string) {
    const labelEl = document.createElement('span');
    labelEl.dataset.slot = 'divider-label';
    labelEl.textContent = label;

    return labelEl;
  }
}

export function registerGnomeDivider() {
  defineCustomElement('gnome-divider', GnomeDividerElement);
}

registerGnomeDivider();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-divider': GnomeDividerElement;
  }
}
