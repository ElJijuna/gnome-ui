import { defineCustomElement, HTMLElementBase } from './internal/dom';
import type { GnomeTooltipElement, GnomeTooltipPlacement } from './tooltip';
import './tooltip';

const DEFAULT_LINES = 1;
const DEFAULT_PLACEMENT: GnomeTooltipPlacement = 'top';

function parseLines(raw: string | null) {
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : DEFAULT_LINES;
}

/**
 * Single/multi-line text truncation with an automatic tooltip revealing the
 * full content on overflow — mirrors `GtkLabel`'s `ellipsize` property.
 *
 * The text is authored as plain light-DOM content — same as `gnome-kbd` —
 * captured once on first connect into `#rawText`; set the `text` property
 * for programmatic updates afterward. Truncation is measured via
 * `ResizeObserver` (`scrollWidth`/`clientWidth` for the default single
 * line, `scrollHeight`/`clientHeight` once `lines` is above `1`), so it
 * stays accurate as the host is resized.
 *
 * Only when actually clipped does the content span get moved inside a real
 * `gnome-tooltip`, reusing that component wholesale rather than
 * reimplementing hover/focus positioning: the span becomes
 * `data-slot="tooltip-trigger"` and a sibling `data-slot="tooltip-content"`
 * carries the untruncated text, which is how `gnome-tooltip` itself wires
 * `aria-describedby`. When it fits, the span sits directly in the host with
 * `data-slot="text-truncate-content"` and no tooltip exists at all.
 */
export class GnomeTextTruncateElement extends HTMLElementBase {
  static readonly observedAttributes = ['lines', 'tooltip-placement'];

  #connected = false;
  #captured = false;
  #rawText = '';
  #content: HTMLSpanElement | null = null;
  #tooltip: GnomeTooltipElement | null = null;
  #tooltipContent: HTMLSpanElement | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #truncated = false;

  connectedCallback() {
    if (!this.#captured) {
      this.#rawText = this.textContent ?? '';
      this.#captured = true;
    }

    this.#connected = true;
    this.#build();
    this.#applyLineMode();
    this.#observeResize();
    this.#measure();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'lines') {
      this.#applyLineMode();
      this.#measure();
    } else if (name === 'tooltip-placement' && this.#tooltip) {
      this.#tooltip.placement = this.tooltipPlacement;
    }
  }

  /** The text being truncated. Reflects the captured light-DOM content. */
  get text() {
    return this.#rawText;
  }

  set text(value: string) {
    this.#rawText = value;
    this.#captured = true;

    if (this.#content && this.#content.textContent !== value) {
      this.#content.textContent = value;
    }

    if (this.#tooltipContent && this.#tooltipContent.textContent !== value) {
      this.#tooltipContent.textContent = value;
    }

    if (this.#connected) {
      this.#measure();
    }
  }

  get lines() {
    return parseLines(this.getAttribute('lines'));
  }

  set lines(value: number) {
    this.setAttribute('lines', String(value));
  }

  get tooltipPlacement(): GnomeTooltipPlacement {
    const value = this.getAttribute('tooltip-placement');

    return value === 'bottom' || value === 'left' || value === 'right' ? value : DEFAULT_PLACEMENT;
  }

  set tooltipPlacement(value: GnomeTooltipPlacement) {
    this.setAttribute('tooltip-placement', value);
  }

  /** Whether the text is currently clipped and wrapped in a tooltip. Read-only. */
  get truncated() {
    return this.#truncated;
  }

  #build() {
    if (this.#content) {
      return;
    }

    this.textContent = '';

    const content = document.createElement('span');
    content.dataset.slot = 'text-truncate-content';
    content.textContent = this.#rawText;

    this.append(content);
    this.#content = content;
  }

  #applyLineMode() {
    if (!this.#content) {
      return;
    }

    const { lines } = this;

    if (lines > 1) {
      this.#content.setAttribute('data-clamp', '');
      this.#content.style.setProperty('-webkit-line-clamp', String(lines));
    } else {
      this.#content.removeAttribute('data-clamp');
      this.#content.style.removeProperty('-webkit-line-clamp');
    }
  }

  #observeResize() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;

    if (typeof ResizeObserver === 'undefined' || !this.#content) {
      return;
    }

    this.#resizeObserver = new ResizeObserver(() => this.#measure());
    this.#resizeObserver.observe(this.#content);
  }

  #measure() {
    const content = this.#content;

    if (!content) {
      return;
    }

    const truncated =
      this.lines <= 1
        ? content.scrollWidth > content.clientWidth
        : content.scrollHeight > content.clientHeight;

    if (truncated === this.#truncated) {
      return;
    }

    this.#truncated = truncated;
    this.#syncTooltip();
  }

  #syncTooltip() {
    const content = this.#content;

    if (!content) {
      return;
    }

    this.toggleAttribute('data-truncated', this.#truncated);

    if (this.#truncated) {
      if (this.#tooltip) {
        return;
      }

      const tooltip = document.createElement('gnome-tooltip') as GnomeTooltipElement;
      tooltip.placement = this.tooltipPlacement;

      const tooltipContent = document.createElement('span');
      tooltipContent.dataset.slot = 'tooltip-content';
      tooltipContent.textContent = this.#rawText;

      // Assemble the tooltip fully before inserting it — gnome-tooltip reads
      // its trigger/content children synchronously from connectedCallback,
      // and only picks up children added afterward via its MutationObserver,
      // which fires asynchronously.
      content.dataset.slot = 'tooltip-trigger';
      tooltip.append(content, tooltipContent);
      this.append(tooltip);

      this.#tooltip = tooltip;
      this.#tooltipContent = tooltipContent;
      return;
    }

    if (!this.#tooltip) {
      return;
    }

    content.dataset.slot = 'text-truncate-content';
    this.#tooltip.replaceWith(content);
    this.#tooltip = null;
    this.#tooltipContent = null;
  }
}

export function registerGnomeTextTruncate() {
  defineCustomElement('gnome-text-truncate', GnomeTextTruncateElement);
}

registerGnomeTextTruncate();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-text-truncate': GnomeTextTruncateElement;
  }
}
