import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeProgressBarVariant = 'accent' | 'error' | 'success' | 'warning';

/**
 * Determinate and indeterminate progress bar.
 *
 * Purely presentational — no light-DOM children. Native `<progress>` has no
 * reliably cross-browser-stylable way to paint a custom-colored indeterminate
 * pulse (there is no value to hook a percentage-based pseudo-element onto),
 * so — like `gnome-spinner` — the host manages `role="progressbar"` and
 * `aria-value*` itself and paints the fill through a `::after` pseudo-element
 * driven by a `--gnome-progress-value` custom property.
 *
 * Omit `value` (or remove the attribute) for the indeterminate state.
 */
export class GnomeProgressBarElement extends HTMLElementBase {
  static readonly observedAttributes = ['value', 'variant'];

  #connected = false;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'progressbar');
    }

    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get value() {
    if (!this.hasAttribute('value')) {
      return undefined;
    }

    const parsed = Number(this.getAttribute('value'));

    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : undefined;
  }

  set value(value: number | undefined) {
    if (value === undefined) {
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', String(value));
    }
  }

  get variant(): GnomeProgressBarVariant {
    const value = this.getAttribute('variant');

    return value === 'success' || value === 'warning' || value === 'error' ? value : 'accent';
  }

  set variant(value: GnomeProgressBarVariant) {
    this.setAttribute('variant', value);
  }

  #syncState() {
    const { value } = this;
    const indeterminate = value === undefined;

    this.dataset.variant = this.variant;
    this.toggleAttribute('data-indeterminate', indeterminate);

    if (indeterminate) {
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');
      this.style.removeProperty('--gnome-progress-value');
      return;
    }

    const percent = value * 100;

    this.setAttribute('aria-valuenow', String(Math.round(percent)));
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
    this.style.setProperty('--gnome-progress-value', `${percent}%`);
  }
}

export function registerGnomeProgressBar() {
  defineCustomElement('gnome-progress-bar', GnomeProgressBarElement);
}

registerGnomeProgressBar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-progress-bar': GnomeProgressBarElement;
  }
}
