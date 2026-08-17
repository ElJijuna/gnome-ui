import { defineCustomElement, HTMLElementBase } from './internal/dom';

/**
 * Renders children as a single visually-connected unit with no gap and
 * merged borders — the canonical GNOME pattern for button groups and
 * segmented inputs. Mirrors the libadwaita `.linked` style class.
 *
 * Pure CSS host — no lifecycle logic, no light-DOM management. `vertical`
 * is a plain attribute read directly by CSS (`[vertical]`); the property
 * accessor exists only for JS ergonomics, same rationale as `gnome-badge`.
 *
 * Unlike the React version, whose children ARE the real DOM elements being
 * bordered, `gnome-button`/`gnome-icon-button` are two-level hosts (the
 * visible border/radius lives on an inner `[data-slot="*-control"]`, not
 * the host) — the border-merge CSS in `styles.css` matches those two
 * control slots explicitly, alongside any bare native control passed
 * directly as a child.
 */
export class GnomeLinkedGroupElement extends HTMLElementBase {
  get vertical() {
    return this.hasAttribute('vertical');
  }

  set vertical(value: boolean) {
    this.toggleAttribute('vertical', value);
  }
}

export function registerGnomeLinkedGroup() {
  defineCustomElement('gnome-linked-group', GnomeLinkedGroupElement);
}

registerGnomeLinkedGroup();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-linked-group': GnomeLinkedGroupElement;
  }
}
