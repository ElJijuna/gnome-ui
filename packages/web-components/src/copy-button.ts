import type { IconDefinition } from '@gnome-ui/icons';
import { Check, Copy } from '@gnome-ui/icons';
import type {
  GnomeIconButtonElement,
  GnomeIconButtonSize,
  GnomeIconButtonVariant,
} from './icon-button';
import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';
import './icon-button';

export type GnomeCopyButtonVariant = GnomeIconButtonVariant;
export type GnomeCopyButtonSize = GnomeIconButtonSize;

export interface GnomeCopyButtonCopiedDetail {
  value: string;
}

export interface GnomeCopyButtonCopyErrorDetail {
  error: unknown;
}

export interface GnomeCopyButtonEventMap extends HTMLElementEventMap {
  'gnome-copied': CustomEvent<GnomeCopyButtonCopiedDetail>;
  'gnome-copy-error': CustomEvent<GnomeCopyButtonCopyErrorDetail>;
}

const DEFAULT_LABEL = 'Copy';
const DEFAULT_COPIED_LABEL = 'Copied!';
const DEFAULT_RESET_DELAY = 2000;

function parseResetDelay(raw: string | null) {
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_RESET_DELAY;
}

// document.createElement('svg') would create an HTML-namespace element, not
// a real SVGSVGElement, breaking innerHTML parsing of self-closing children
// — same bug found in gnome-callout's story icons and gnome-file-type-icon.
// DOMParser with the XML content type avoids it.
function buildIconSvg(icon: IconDefinition): SVGElement {
  const pathsMarkup = icon.paths
    .map((path) => {
      const attrs = [`d="${path.d}"`];

      if (path.fillRule) {
        attrs.push(`fill-rule="${path.fillRule}"`);
      }

      if (path.clipRule) {
        attrs.push(`clip-rule="${path.clipRule}"`);
      }

      if (path.transform) {
        attrs.push(`transform="${path.transform}"`);
      }

      return `<path ${attrs.join(' ')}></path>`;
    })
    .join('');

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">${pathsMarkup}</svg>`;
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  return document.importNode(parsed.documentElement, true) as unknown as SVGElement;
}

/**
 * Icon button that copies `value` to the clipboard, swapping to a checkmark
 * and a "Copied!" label for `reset-delay` ms as confirmation.
 *
 * Fully host-generated — like `gnome-otp-input`/`gnome-file-type-icon`,
 * there is nothing for the consumer to author; it builds its own internal
 * `gnome-icon-button` (reusing that component's variant/size/osd/disabled
 * styling and state-management) plus a visually-hidden live region that
 * announces the copied confirmation, mirroring `@gnome-ui/react`'s
 * `CopyButton`.
 *
 * Fires `gnome-copied` (`{ value }`) after a successful clipboard write and
 * `gnome-copy-error` (`{ error }`) if the write rejects or the Clipboard API
 * is unavailable in the current context.
 */
export class GnomeCopyButtonElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'copied-label',
    'disabled',
    'label',
    'osd',
    'reset-delay',
    'size',
    'value',
    'variant',
  ];

  addEventListener<K extends keyof GnomeCopyButtonEventMap>(
    type: K,
    listener: (this: GnomeCopyButtonElement, event: GnomeCopyButtonEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: string, listener: unknown, options?: boolean | AddEventListenerOptions) {
    if (listener === null) {
      return;
    }

    super.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  removeEventListener<K extends keyof GnomeCopyButtonEventMap>(
    type: K,
    listener: (this: GnomeCopyButtonElement, event: GnomeCopyButtonEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(type: string, listener: unknown, options?: boolean | EventListenerOptions) {
    if (listener === null) {
      return;
    }

    super.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
  }

  #connected = false;
  #copied = false;
  #resetTimer: ReturnType<typeof setTimeout> | null = null;
  #iconButton: GnomeIconButtonElement | null = null;
  #control: HTMLButtonElement | null = null;
  #status: HTMLElement | null = null;

  #handleClick = () => {
    this.#copy();
  };

  connectedCallback() {
    this.#connected = true;
    this.#build();
    this.#syncState();
  }

  disconnectedCallback() {
    this.#connected = false;

    if (this.#resetTimer !== null) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get control() {
    return this.#control;
  }

  get value() {
    return this.getAttribute('value') ?? '';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  get label() {
    return this.getAttribute('label') || DEFAULT_LABEL;
  }

  set label(next: string) {
    this.setAttribute('label', next);
  }

  get copiedLabel() {
    return this.getAttribute('copied-label') || DEFAULT_COPIED_LABEL;
  }

  set copiedLabel(next: string) {
    this.setAttribute('copied-label', next);
  }

  get resetDelay() {
    return parseResetDelay(this.getAttribute('reset-delay'));
  }

  set resetDelay(next: number) {
    this.setAttribute('reset-delay', String(next));
  }

  get variant(): GnomeCopyButtonVariant {
    const value = this.getAttribute('variant');

    return value === 'suggested' ||
      value === 'destructive' ||
      value === 'flat' ||
      value === 'raised'
      ? value
      : 'default';
  }

  set variant(value: GnomeCopyButtonVariant) {
    this.setAttribute('variant', value);
  }

  get size(): GnomeCopyButtonSize {
    const value = this.getAttribute('size');
    return value === 'sm' || value === 'lg' ? value : 'md';
  }

  set size(value: GnomeCopyButtonSize) {
    this.setAttribute('size', value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get osd() {
    return this.hasAttribute('osd');
  }

  set osd(value: boolean) {
    this.toggleAttribute('osd', value);
  }

  /** Whether the "copied" confirmation state is currently shown. Read-only. */
  get copied() {
    return this.#copied;
  }

  override click() {
    this.#control?.click();
  }

  override focus(options?: FocusOptions) {
    if (this.#iconButton) {
      this.#iconButton.focus(options);
    } else {
      super.focus(options);
    }
  }

  async #copy() {
    if (!navigator.clipboard?.writeText) {
      emit<GnomeCopyButtonCopyErrorDetail>(this, 'gnome-copy-error', {
        error: new Error('Clipboard API is unavailable in this context.'),
      });
      return;
    }

    const { value } = this;

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      emit<GnomeCopyButtonCopyErrorDetail>(this, 'gnome-copy-error', { error });
      return;
    }

    emit<GnomeCopyButtonCopiedDetail>(this, 'gnome-copied', { value });
    this.#setCopied(true);
  }

  #setCopied(next: boolean) {
    if (this.#resetTimer !== null) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }

    this.#copied = next;
    this.#syncState();

    if (next) {
      this.#resetTimer = setTimeout(() => {
        this.#resetTimer = null;
        this.#copied = false;
        this.#syncState();
      }, this.resetDelay);
    }
  }

  #build() {
    if (this.#iconButton) {
      return;
    }

    this.textContent = '';

    const iconButton = document.createElement('gnome-icon-button') as GnomeIconButtonElement;
    iconButton.dataset.slot = 'copy-button-icon-button';

    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.slot = 'icon-button-control';
    control.addEventListener('click', this.#handleClick);
    iconButton.append(control);

    const status = document.createElement('span');
    status.dataset.slot = 'copy-button-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    this.append(iconButton, status);

    this.#iconButton = iconButton;
    this.#control = control;
    this.#status = status;
  }

  #syncState() {
    if (!this.#iconButton || !this.#control || !this.#status) {
      return;
    }

    const { copied, variant, size, disabled, osd } = this;
    const label = copied ? this.copiedLabel : this.label;

    this.#iconButton.variant = variant;
    this.#iconButton.size = size;
    this.#iconButton.disabled = disabled;
    this.#iconButton.osd = osd;
    this.#iconButton.label = label;

    this.dataset.variant = variant;
    this.dataset.size = size;
    this.toggleAttribute('data-copied', copied);

    const iconKey = copied ? 'check' : 'copy';

    if (this.#control.dataset.icon !== iconKey) {
      this.#control.dataset.icon = iconKey;
      this.#control.replaceChildren(buildIconSvg(copied ? Check : Copy));
    }

    this.#status.textContent = copied ? this.copiedLabel : '';
  }
}

export function registerGnomeCopyButton() {
  defineCustomElement('gnome-copy-button', GnomeCopyButtonElement);
}

registerGnomeCopyButton();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-copy-button': GnomeCopyButtonElement;
  }
}
