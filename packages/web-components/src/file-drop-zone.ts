import type { IconDefinition } from '@gnome-ui/icons';
import { Folder, FolderDragAccept } from '@gnome-ui/icons';
import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export interface GnomeFileDropZoneFilesSelectedDetail {
  files: File[];
}

export interface GnomeFileDropZoneErrorDetail {
  message: string;
}

export interface GnomeFileDropZoneEventMap extends HTMLElementEventMap {
  'gnome-files-selected': CustomEvent<GnomeFileDropZoneFilesSelectedDetail>;
  'gnome-error': CustomEvent<GnomeFileDropZoneErrorDetail>;
}

const DEFAULT_LABEL = 'Drag files here or click to browse';

function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (patterns.length === 0) {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return patterns.some((p) => {
    if (p.startsWith('.')) {
      return name.endsWith(p);
    }

    if (p.endsWith('/*')) {
      return type.startsWith(p.slice(0, -1));
    }

    return type === p;
  });
}

// document.createElement('svg') would create an HTML-namespace element, not
// a real SVGSVGElement, breaking innerHTML parsing of self-closing children
// — same bug found in gnome-copy-button/gnome-rating-stars. DOMParser with
// the XML content type avoids it.
function buildFolderSvg(icon: IconDefinition): SVGElement {
  const pathsMarkup = (icon.paths ?? [])
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

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" data-slot="file-drop-zone-icon" viewBox="${icon.viewBox}" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">${pathsMarkup}</svg>`;
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  return document.importNode(parsed.documentElement, true) as unknown as SVGElement;
}

function parseMaxSize(raw: string | null): number | undefined {
  if (raw === null) {
    return undefined;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Drag-and-drop file upload target with hover/active states, falling back
 * to a click-to-browse trigger — mirrors `@gnome-ui/react`'s `FileDropZone`.
 *
 * Fully host-generated from attributes — like `gnome-otp-input`, there is
 * nothing for the consumer to author; the icon, label, helper text, and
 * hidden `<input type="file">` are all built once on connect. `File`
 * objects can't round-trip through HTML attributes, so selection is
 * entirely event-driven: `gnome-files-selected` (`{ files }`) fires with
 * the accepted files, whether dropped or picked via the browse dialog, and
 * `gnome-error` (`{ message }`) fires once per rejected file.
 *
 * Native `accept` only restricts the browse dialog, not drag-and-drop, so
 * dropped files are re-validated against both `accept` and `max-size`
 * before firing `gnome-files-selected` — same rationale as the React
 * source. Drag state uses a counter (not a boolean) because `dragenter`/
 * `dragleave` fire again for every nested descendant the pointer crosses;
 * only reaching zero means the pointer actually left the zone.
 */
export class GnomeFileDropZoneElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'accept',
    'disabled',
    'helper-text',
    'label',
    'max-size',
    'multiple',
  ];

  addEventListener<K extends keyof GnomeFileDropZoneEventMap>(
    type: K,
    listener: (this: GnomeFileDropZoneElement, event: GnomeFileDropZoneEventMap[K]) => void,
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

  removeEventListener<K extends keyof GnomeFileDropZoneEventMap>(
    type: K,
    listener: (this: GnomeFileDropZoneElement, event: GnomeFileDropZoneEventMap[K]) => void,
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
  #icon: SVGElement | null = null;
  #labelEl: HTMLElement | null = null;
  #helperTextEl: HTMLElement | null = null;
  #input: HTMLInputElement | null = null;
  #dragCounter = 0;
  #dragging = false;

  #handleClick = () => {
    this.#openBrowser();
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#openBrowser();
    }
  };

  #handleDragEnter = (event: DragEvent) => {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.#dragCounter += 1;
    this.#setDragging(true);
  };

  #handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  #handleDragLeave = (event: DragEvent) => {
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    this.#dragCounter = Math.max(0, this.#dragCounter - 1);

    if (this.#dragCounter === 0) {
      this.#setDragging(false);
    }
  };

  #handleDrop = (event: DragEvent) => {
    event.preventDefault();
    this.#dragCounter = 0;
    this.#setDragging(false);

    if (this.disabled) {
      return;
    }

    this.#processFiles(event.dataTransfer?.files ?? null);
  };

  // A programmatic input.click() dispatches a real click event that
  // bubbles — without this it would re-trigger the zone's own click
  // handler and call #openBrowser() a second time.
  #handleInputClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  #handleInputChange = () => {
    const input = this.#input;

    if (!input) {
      return;
    }

    this.#processFiles(input.files);
    input.value = '';
  };

  connectedCallback() {
    this.#connected = true;
    this.#build();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.addEventListener('dragenter', this.#handleDragEnter);
    this.addEventListener('dragover', this.#handleDragOver);
    this.addEventListener('dragleave', this.#handleDragLeave);
    this.addEventListener('drop', this.#handleDrop);
    this.#syncState();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('dragenter', this.#handleDragEnter);
    this.removeEventListener('dragover', this.#handleDragOver);
    this.removeEventListener('dragleave', this.#handleDragLeave);
    this.removeEventListener('drop', this.#handleDrop);
    this.#dragCounter = 0;
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get accept() {
    return this.getAttribute('accept') ?? '';
  }

  set accept(value: string) {
    if (value) {
      this.setAttribute('accept', value);
    } else {
      this.removeAttribute('accept');
    }
  }

  get multiple() {
    return this.hasAttribute('multiple');
  }

  set multiple(value: boolean) {
    this.toggleAttribute('multiple', value);
  }

  get maxSize() {
    return parseMaxSize(this.getAttribute('max-size'));
  }

  set maxSize(value: number | undefined) {
    if (value === undefined) {
      this.removeAttribute('max-size');
    } else {
      this.setAttribute('max-size', String(value));
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  get label() {
    return this.getAttribute('label') || DEFAULT_LABEL;
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

  /** Whether a drag is currently over the zone. Read-only. */
  get dragging() {
    return this.#dragging;
  }

  #openBrowser() {
    if (!this.disabled) {
      this.#input?.click();
    }
  }

  #setDragging(next: boolean) {
    if (this.#dragging === next) {
      return;
    }

    this.#dragging = next;
    this.#syncState();
  }

  #processFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const incoming = this.multiple ? Array.from(fileList) : Array.from(fileList).slice(0, 1);
    const { accept, maxSize } = this;
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        emit<GnomeFileDropZoneErrorDetail>(this, 'gnome-error', {
          message: `"${file.name}" is not an accepted file type.`,
        });
        continue;
      }

      if (maxSize !== undefined && file.size > maxSize) {
        emit<GnomeFileDropZoneErrorDetail>(this, 'gnome-error', {
          message: `"${file.name}" exceeds the maximum file size.`,
        });
        continue;
      }

      accepted.push(file);
    }

    if (accepted.length > 0) {
      emit<GnomeFileDropZoneFilesSelectedDetail>(this, 'gnome-files-selected', {
        files: accepted,
      });
    }
  }

  #build() {
    if (this.#input) {
      return;
    }

    this.textContent = '';

    const icon = buildFolderSvg(Folder);
    icon.dataset.icon = 'default';

    const labelEl = document.createElement('span');
    labelEl.dataset.slot = 'file-drop-zone-label';

    const input = document.createElement('input');
    input.type = 'file';
    input.dataset.slot = 'file-drop-zone-input';
    input.tabIndex = -1;
    input.setAttribute('aria-hidden', 'true');
    input.addEventListener('click', this.#handleInputClick);
    input.addEventListener('change', this.#handleInputChange);

    this.append(icon, labelEl, input);

    this.#icon = icon;
    this.#labelEl = labelEl;
    this.#input = input;
  }

  #syncState() {
    const input = this.#input;

    if (!input) {
      return;
    }

    const { disabled, label, helperText, dragging, accept, multiple } = this;

    if (this.getAttribute('role') !== 'button') {
      this.setAttribute('role', 'button');
    }

    const nextTabIndex = disabled ? -1 : 0;

    // Compare against the content attribute, not the `tabIndex` IDL
    // property: an unconnected custom element with no `tabindex` attribute
    // already reports `-1` for the property (the default for anything not
    // in the browser's built-in focusable set), which would make this
    // guard skip writing the attribute at all whenever the very first
    // render happens to want `-1` too (e.g. `disabled` from the start).
    if (this.getAttribute('tabindex') !== String(nextTabIndex)) {
      this.tabIndex = nextTabIndex;
    }

    if (disabled) {
      if (this.getAttribute('aria-disabled') !== 'true') {
        this.setAttribute('aria-disabled', 'true');
      }
    } else if (this.hasAttribute('aria-disabled')) {
      this.removeAttribute('aria-disabled');
    }

    this.toggleAttribute('data-dragging', dragging);
    this.toggleAttribute('data-disabled', disabled);

    if (this.#labelEl && this.#labelEl.textContent !== label) {
      this.#labelEl.textContent = label;
    }

    if (helperText) {
      if (!this.#helperTextEl) {
        this.#helperTextEl = document.createElement('span');
        this.#helperTextEl.dataset.slot = 'file-drop-zone-helper-text';
        this.#labelEl?.after(this.#helperTextEl);
      }

      if (this.#helperTextEl.textContent !== helperText) {
        this.#helperTextEl.textContent = helperText;
      }
    } else if (this.#helperTextEl) {
      this.#helperTextEl.remove();
      this.#helperTextEl = null;
    }

    if (input.disabled !== disabled) {
      input.disabled = disabled;
    }

    if (input.multiple !== multiple) {
      input.multiple = multiple;
    }

    if (input.accept !== accept) {
      input.accept = accept;
    }

    // Guard against replacing the icon unconditionally: this component has
    // no hover feedback loop today, but an equality-guarded swap (same
    // pattern gnome-rating-stars needed for its hover preview) costs
    // nothing and avoids reintroducing that bug class if drag state ever
    // grows a hover-adjacent handler.
    const iconKey = dragging ? 'accept' : 'default';

    if (this.#icon && this.#icon.dataset.icon !== iconKey) {
      const nextIcon = buildFolderSvg(dragging ? FolderDragAccept : Folder);
      nextIcon.dataset.icon = iconKey;
      this.#icon.replaceWith(nextIcon);
      this.#icon = nextIcon;
    }
  }
}

export function registerGnomeFileDropZone() {
  defineCustomElement('gnome-file-drop-zone', GnomeFileDropZoneElement);
}

registerGnomeFileDropZone();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-file-drop-zone': GnomeFileDropZoneElement;
  }
}
