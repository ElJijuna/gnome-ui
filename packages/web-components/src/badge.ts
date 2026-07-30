import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeBadgeVariant = 'accent' | 'error' | 'neutral' | 'success' | 'warning';

/**
 * Counter or status indicator, optionally overlaid on another element.
 *
 * Pure CSS host — no lifecycle logic, no light-DOM management. `variant`,
 * `dot`, and `anchored` are plain attributes read directly by CSS
 * (`[variant="…"]`, `[dot]`, `[anchored]`); the property accessors below
 * exist only for JS ergonomics and attribute-value normalization.
 *
 * `anchored` only switches the badge to `position: absolute; top; right;` —
 * the consumer's own wrapper around both the anchor element and this badge
 * must be `position: relative` (or similar), since the host has no visibility
 * into DOM outside itself.
 */
export class GnomeBadgeElement extends HTMLElementBase {
  get variant(): GnomeBadgeVariant {
    const value = this.getAttribute('variant');

    return value === 'success' || value === 'warning' || value === 'error' || value === 'neutral'
      ? value
      : 'accent';
  }

  set variant(value: GnomeBadgeVariant) {
    this.setAttribute('variant', value);
  }

  get dot() {
    return this.hasAttribute('dot');
  }

  set dot(value: boolean) {
    this.toggleAttribute('dot', value);
  }

  get anchored() {
    return this.hasAttribute('anchored');
  }

  set anchored(value: boolean) {
    this.toggleAttribute('anchored', value);
  }
}

export function registerGnomeBadge() {
  defineCustomElement('gnome-badge', GnomeBadgeElement);
}

registerGnomeBadge();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-badge': GnomeBadgeElement;
  }
}
