import { defineCustomElement, emit, ensureId, HTMLElementBase } from './internal/dom';

export interface GnomeOtpInputChangeDetail {
  value: string;
}

export interface GnomeOtpInputCompleteDetail {
  value: string;
}

export interface GnomeOtpInputEventMap extends HTMLElementEventMap {
  'gnome-change': CustomEvent<GnomeOtpInputChangeDetail>;
  'gnome-complete': CustomEvent<GnomeOtpInputCompleteDetail>;
}

const FIELDSET_SELECTOR = '[data-slot="otp-input-fieldset"]';
const LEGEND_SELECTOR = '[data-slot="otp-input-legend"]';
const HINT_SELECTOR = '[data-slot="otp-input-hint"]';
const ROW_SELECTOR = '[data-slot="otp-input-row"]';
const CELL_SELECTOR = '[data-slot="otp-input-cell"]';

function parseLength(raw: string | null) {
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

/**
 * Segmented PIN/verification-code input — one cell per digit, with
 * auto-advance on typing, backspace-to-previous-cell, and paste support
 * (pasting a full code distributes it across the remaining cells).
 *
 * Common auth pattern, pairs naturally with `gnome-text-field` for a
 * two-factor confirmation step following a password entry.
 *
 * Fully host-generated — like `@gnome-ui/react`'s `OtpInput`, there is
 * nothing for the consumer to author; the fieldset/legend/hint chrome and
 * every cell are built from attributes alone, same rationale as
 * `gnome-field-group`. `value` is a JS-only property (not an attribute),
 * mirroring `gnome-radio-group`'s `value` — it changes on every keystroke,
 * so reflecting it as an attribute would be wasted churn.
 *
 * Fires `gnome-change` (`{ value }`) on every user-driven edit and
 * `gnome-complete` (`{ value }`) once the value reaches `length` digits —
 * mirrors react's effect of comparing against the previous value, so it
 * won't re-fire on an unchanged complete value but will fire again if the
 * value leaves and returns to a (possibly different) complete value.
 */
export class GnomeOtpInputElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'disabled',
    'error',
    'helper-text',
    'label',
    'length',
    'masked',
  ];

  addEventListener<K extends keyof GnomeOtpInputEventMap>(
    type: K,
    listener: (this: GnomeOtpInputElement, event: GnomeOtpInputEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeOtpInputEventMap>(
    type: K,
    listener: (this: GnomeOtpInputElement, event: GnomeOtpInputEventMap[K]) => void,
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
  #fieldset: HTMLFieldSetElement | null = null;
  #row: HTMLElement | null = null;
  #value = '';

  #handleCellInput = (event: Event) => {
    const cell = event.target as HTMLInputElement;
    const index = this.#cellIndex(cell);

    if (index === -1) {
      return;
    }

    const raw = cell.value.replace(/\D/g, '');

    if (raw.length > 1) {
      this.#fillFrom(index, raw);
      return;
    }

    this.#setCellValue(index, raw);

    if (raw && index < this.length - 1) {
      this.#cells()[index + 1]?.focus();
    }
  };

  #handleCellKeyDown = (event: KeyboardEvent) => {
    const cell = event.target as HTMLInputElement;
    const index = this.#cellIndex(cell);

    if (index === -1) {
      return;
    }

    const chars = this.#chars();

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (chars[index]) {
        this.#setCellValue(index, '');
      } else if (index > 0) {
        this.#setCellValue(index - 1, '');
        this.#cells()[index - 1]?.focus();
      }

      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.#cells()[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < this.length - 1) {
      event.preventDefault();
      this.#cells()[index + 1]?.focus();
    }
  };

  #handleCellPaste = (event: ClipboardEvent) => {
    const cell = event.target as HTMLInputElement;
    const index = this.#cellIndex(cell);
    const text = event.clipboardData?.getData('text') ?? '';

    if (index === -1 || !/\d/.test(text)) {
      return;
    }

    event.preventDefault();
    this.#fillFrom(index, text);
  };

  #handleCellFocus = (event: FocusEvent) => {
    (event.target as HTMLInputElement).select();
  };

  connectedCallback() {
    this.#connected = true;
    this.#wrapFieldset();
    this.#syncState();

    if (this.hasAttribute('autofocus')) {
      this.#cells()[0]?.focus();
    }
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get value() {
    return this.#value;
  }

  set value(next: string) {
    this.#updateValue(next, false);
  }

  get length() {
    return parseLength(this.getAttribute('length'));
  }

  set length(value: number) {
    this.setAttribute('length', String(value));
  }

  get masked() {
    return this.hasAttribute('masked');
  }

  set masked(value: boolean) {
    this.toggleAttribute('masked', value);
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

  get helperText() {
    return this.getAttribute('helper-text') ?? '';
  }

  set helperText(value: string) {
    if (value) {
      this.setAttribute('helper-text', value);
    } else {
      this.removeAttribute('helper-text');
    }
  }

  get error() {
    return this.getAttribute('error') ?? '';
  }

  set error(value: string) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  #cells() {
    return this.#row ? Array.from(this.#row.querySelectorAll<HTMLInputElement>(CELL_SELECTOR)) : [];
  }

  #cellIndex(cell: HTMLInputElement) {
    return this.#cells().indexOf(cell);
  }

  #chars() {
    return Array.from({ length: this.length }, (_, i) => this.#value[i] ?? '');
  }

  #setCellValue(index: number, char: string) {
    const chars = this.#chars();

    chars[index] = char;
    this.#updateValue(chars.join(''));
  }

  #fillFrom(startIndex: number, digits: string) {
    const cleaned = digits.replace(/\D/g, '');

    if (!cleaned) {
      return;
    }

    const chars = this.#chars();
    let i = startIndex;

    for (const digit of cleaned) {
      if (i >= this.length) {
        break;
      }

      chars[i] = digit;
      i++;
    }

    this.#updateValue(chars.join(''));
    this.#cells()[Math.min(i, this.length - 1)]?.focus();
  }

  #updateValue(next: string, emitChange = true) {
    const previous = this.#value;
    const changed = next !== previous;

    this.#value = next;
    this.#syncCells();

    if (changed && emitChange) {
      emit<GnomeOtpInputChangeDetail>(this, 'gnome-change', { value: next });
    }

    if (next.length === this.length && next !== previous) {
      emit<GnomeOtpInputCompleteDetail>(this, 'gnome-complete', { value: next });
    }
  }

  #wrapFieldset() {
    const existing = this.querySelector<HTMLFieldSetElement>(FIELDSET_SELECTOR);

    if (existing && existing.parentElement === this) {
      this.#fieldset = existing;
      this.#row = existing.querySelector<HTMLElement>(ROW_SELECTOR);
      return;
    }

    const fieldset = document.createElement('fieldset');
    fieldset.dataset.slot = 'otp-input-fieldset';

    const legend = document.createElement('legend');
    legend.dataset.slot = 'otp-input-legend';
    fieldset.append(legend);

    const row = document.createElement('div');
    row.dataset.slot = 'otp-input-row';
    fieldset.append(row);

    this.append(fieldset);

    this.#fieldset = fieldset;
    this.#row = row;
  }

  #createCell(): HTMLInputElement {
    const cell = document.createElement('input');
    cell.dataset.slot = 'otp-input-cell';
    cell.inputMode = 'numeric';
    cell.pattern = '[0-9]*';
    cell.maxLength = 1;
    cell.addEventListener('input', this.#handleCellInput);
    cell.addEventListener('keydown', this.#handleCellKeyDown);
    cell.addEventListener('paste', this.#handleCellPaste);
    cell.addEventListener('focus', this.#handleCellFocus);

    return cell;
  }

  #syncCells() {
    const row = this.#row;

    if (!row) {
      return;
    }

    const { length, masked, disabled, error } = this;
    const cells = this.#cells();

    for (let i = cells.length; i < length; i++) {
      const cell = this.#createCell();
      row.append(cell);
      cells.push(cell);
    }

    for (let i = cells.length - 1; i >= length; i--) {
      cells[i].remove();
      cells.pop();
    }

    const type = masked ? 'password' : 'text';

    for (const [i, cell] of cells.entries()) {
      if (cell.type !== type) {
        cell.type = type;
      }

      const autocomplete = i === 0 ? 'one-time-code' : 'off';

      if (cell.autocomplete !== autocomplete) {
        cell.autocomplete = autocomplete;
      }

      const label = `Digit ${i + 1} of ${length}`;

      if (cell.getAttribute('aria-label') !== label) {
        cell.setAttribute('aria-label', label);
      }

      const char = this.#value[i] ?? '';

      if (cell.value !== char) {
        cell.value = char;
      }

      if (cell.disabled !== disabled) {
        cell.disabled = disabled;
      }

      if (error) {
        if (cell.getAttribute('aria-invalid') !== 'true') {
          cell.setAttribute('aria-invalid', 'true');
        }
      } else if (cell.hasAttribute('aria-invalid')) {
        cell.removeAttribute('aria-invalid');
      }

      cell.toggleAttribute('data-error', Boolean(error));
    }
  }

  #syncState() {
    const fieldset = this.#fieldset;

    if (!fieldset) {
      return;
    }

    const legend = fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR);

    if (legend && legend.textContent !== this.label) {
      legend.textContent = this.label;
    }

    if (fieldset.disabled !== this.disabled) {
      fieldset.disabled = this.disabled;
    }

    this.#syncHint(fieldset);
    this.#syncCells();
  }

  #syncHint(fieldset: HTMLFieldSetElement) {
    const { error, helperText } = this;
    const text = error || helperText;
    let hint = fieldset.querySelector<HTMLElement>(HINT_SELECTOR);

    if (!text) {
      hint?.remove();

      if (fieldset.hasAttribute('aria-describedby')) {
        fieldset.removeAttribute('aria-describedby');
      }

      return;
    }

    if (!hint) {
      hint = document.createElement('span');
      hint.dataset.slot = 'otp-input-hint';
      fieldset.querySelector<HTMLElement>(LEGEND_SELECTOR)?.after(hint);
    }

    if (hint.textContent !== text) {
      hint.textContent = text;
    }

    hint.toggleAttribute('data-error', Boolean(error));

    if (error) {
      hint.setAttribute('role', 'alert');
    } else if (hint.hasAttribute('role')) {
      hint.removeAttribute('role');
    }

    const hintId = ensureId(hint, 'gnome-otp-input-hint');

    if (fieldset.getAttribute('aria-describedby') !== hintId) {
      fieldset.setAttribute('aria-describedby', hintId);
    }
  }
}

export function registerGnomeOtpInput() {
  defineCustomElement('gnome-otp-input', GnomeOtpInputElement);
}

registerGnomeOtpInput();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-otp-input': GnomeOtpInputElement;
  }
}
