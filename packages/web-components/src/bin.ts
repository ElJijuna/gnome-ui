import { defineCustomElement, HTMLElementBase } from './internal/dom';

/**
 * Single-child container with no visual styling of its own — mirrors
 * `AdwBin` and `@gnome-ui/react`'s own `Bin`.
 *
 * Pure CSS host — no attributes, no lifecycle logic, no `role`. A custom
 * element defaults to `display: inline`, so the only rule this ships is
 * `display: block`, matching a plain `<div>` — everything else (size,
 * layout, chrome) is left entirely to the consumer's own styling. Unlike
 * `gnome-toolbar` (which adds padding/gap), `Bin` adds nothing at all;
 * useful as a neutral base to apply layout or size constraints to without
 * introducing any chrome of its own.
 */
export class GnomeBinElement extends HTMLElementBase {}

export function registerGnomeBin() {
  defineCustomElement('gnome-bin', GnomeBinElement);
}

registerGnomeBin();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-bin': GnomeBinElement;
  }
}
