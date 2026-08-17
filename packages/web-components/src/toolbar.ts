import { defineCustomElement, HTMLElementBase } from './internal/dom';

/**
 * Horizontal action bar following the libadwaita `.toolbar` style class.
 *
 * Pure CSS host — no attributes, no lifecycle logic. Provides the standard
 * 6px padding/gap for rows of flat or raised buttons in header bars, action
 * bars, and generic tool rows. Consumer-authored children (`gnome-button`,
 * `gnome-linked-group`, `gnome-dropdown`, `gnome-divider`/`gnome-separator`,
 * or anything else) render directly, in DOM order — same as the React
 * version, which never sets a `role` and expects the consumer to place
 * whatever controls belong there. Use a plain `flex: 1` filler `<div>`
 * between leading and trailing groups to push trailing items to the end
 * (mirrors the React version's `<Spacer />`).
 */
export class GnomeToolbarElement extends HTMLElementBase {}

export function registerGnomeToolbar() {
  defineCustomElement('gnome-toolbar', GnomeToolbarElement);
}

registerGnomeToolbar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-toolbar': GnomeToolbarElement;
  }
}
