import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeLevelBarVariant = 'accent' | 'error' | 'success' | 'warning';

const BLOCK_SELECTOR = '[data-slot="level-block"]';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(raw: string | null, fallback: number) {
  if (raw === null) {
    return fallback;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveVariant(
  value: number,
  low: number | undefined,
  lowVariant: GnomeLevelBarVariant,
  high: number | undefined,
  highVariant: GnomeLevelBarVariant,
  variant: GnomeLevelBarVariant,
): GnomeLevelBarVariant {
  if (low !== undefined && value <= low) {
    return lowVariant;
  }

  if (high !== undefined && value >= high) {
    return highVariant;
  }

  return variant;
}

/**
 * Discrete level indicator with colour-coded low/high offset zones —
 * mirrors `GtkLevelBar`. Use for a gauge/measurement display (disk usage,
 * battery, signal strength), not task progress (see `gnome-progress-bar`).
 *
 * Purely presentational, `role="meter"` (the WAI-ARIA role for a scalar
 * measurement within a known range, distinct from `role="progressbar"`).
 * The continuous fill is painted through a `::after` pseudo-element driven
 * by a `--gnome-level-value` custom property, same technique as
 * `gnome-progress-bar`. In `discrete` mode there is nothing for a consumer
 * to author — like `gnome-skeleton`'s `text` variant rows, the host derives
 * `num-blocks` `[data-slot="level-block"]` elements itself; no
 * `MutationObserver` is needed since nothing external ever swaps them.
 */
export class GnomeLevelBarElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'discrete',
    'high',
    'high-variant',
    'low',
    'low-variant',
    'max',
    'min',
    'num-blocks',
    'value',
    'variant',
  ];

  #connected = false;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'meter');
    }

    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get value() {
    return parseNumber(this.getAttribute('value'), this.min);
  }

  set value(value: number) {
    this.setAttribute('value', String(value));
  }

  get min() {
    return parseNumber(this.getAttribute('min'), 0);
  }

  set min(value: number) {
    this.setAttribute('min', String(value));
  }

  get max() {
    return parseNumber(this.getAttribute('max'), 1);
  }

  set max(value: number) {
    this.setAttribute('max', String(value));
  }

  get low(): number | undefined {
    return this.hasAttribute('low') ? parseNumber(this.getAttribute('low'), 0) : undefined;
  }

  set low(value: number | undefined) {
    if (value === undefined) {
      this.removeAttribute('low');
    } else {
      this.setAttribute('low', String(value));
    }
  }

  get high(): number | undefined {
    return this.hasAttribute('high') ? parseNumber(this.getAttribute('high'), 0) : undefined;
  }

  set high(value: number | undefined) {
    if (value === undefined) {
      this.removeAttribute('high');
    } else {
      this.setAttribute('high', String(value));
    }
  }

  get variant(): GnomeLevelBarVariant {
    return this.#readVariant('variant', 'accent');
  }

  set variant(value: GnomeLevelBarVariant) {
    this.setAttribute('variant', value);
  }

  get lowVariant(): GnomeLevelBarVariant {
    return this.#readVariant('low-variant', 'warning');
  }

  set lowVariant(value: GnomeLevelBarVariant) {
    this.setAttribute('low-variant', value);
  }

  get highVariant(): GnomeLevelBarVariant {
    return this.#readVariant('high-variant', 'error');
  }

  set highVariant(value: GnomeLevelBarVariant) {
    this.setAttribute('high-variant', value);
  }

  get discrete() {
    return this.hasAttribute('discrete');
  }

  set discrete(value: boolean) {
    this.toggleAttribute('discrete', value);
  }

  get numBlocks() {
    const parsed = parseNumber(this.getAttribute('num-blocks'), 10);

    return Math.max(1, Math.floor(parsed));
  }

  set numBlocks(value: number) {
    this.setAttribute('num-blocks', String(value));
  }

  #readVariant(attribute: string, fallback: GnomeLevelBarVariant): GnomeLevelBarVariant {
    const value = this.getAttribute(attribute);

    return value === 'success' || value === 'warning' || value === 'error' || value === 'accent'
      ? value
      : fallback;
  }

  #syncState() {
    const { min, max, low, lowVariant, high, highVariant, variant, discrete } = this;
    const range = max - min;
    const clamped = clamp(this.value, min, max);
    const fraction = range > 0 ? (clamped - min) / range : 0;
    const resolvedVariant = resolveVariant(clamped, low, lowVariant, high, highVariant, variant);

    this.dataset.variant = resolvedVariant;
    this.toggleAttribute('data-discrete', discrete);
    this.setAttribute('aria-valuenow', String(clamped));
    this.setAttribute('aria-valuemin', String(min));
    this.setAttribute('aria-valuemax', String(max));

    if (discrete) {
      this.style.removeProperty('--gnome-level-value');
      this.#syncBlocks(fraction);
      return;
    }

    this.#clearBlocks();
    this.style.setProperty('--gnome-level-value', `${fraction * 100}%`);
  }

  #syncBlocks(fraction: number) {
    const blockCount = this.numBlocks;
    const existing = Array.from(this.querySelectorAll<HTMLSpanElement>(BLOCK_SELECTOR));

    for (let index = blockCount; index < existing.length; index += 1) {
      existing[index].remove();
    }

    for (let index = 0; index < blockCount; index += 1) {
      const block = existing[index] ?? this.#createBlock();
      const blockFraction = (index + 1) / blockCount;

      block.toggleAttribute('data-filled', blockFraction <= fraction);
    }
  }

  #createBlock() {
    const block = document.createElement('span');

    block.dataset.slot = 'level-block';
    block.setAttribute('aria-hidden', 'true');
    this.append(block);

    return block;
  }

  #clearBlocks() {
    for (const block of this.querySelectorAll(BLOCK_SELECTOR)) {
      block.remove();
    }
  }
}

export function registerGnomeLevelBar() {
  defineCustomElement('gnome-level-bar', GnomeLevelBarElement);
}

registerGnomeLevelBar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-level-bar': GnomeLevelBarElement;
  }
}
