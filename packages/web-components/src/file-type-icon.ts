import type { IconDefinition } from '@gnome-ui/icons';

import { defineCustomElement, HTMLElementBase } from './internal/dom';
import {
  categoryFromMimeType,
  categoryFromName,
  type FileTypeCategory,
  getFileTypeIcon,
  getFileTypeLabel,
} from './internal/file-type';

export type { FileTypeCategory } from './internal/file-type';

export type GnomeFileTypeIconSize = 'sm' | 'md' | 'lg';

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

  // Building this via document.createElement('svg') would create an
  // HTML-namespace element, not a real SVGSVGElement, breaking innerHTML
  // parsing of self-closing children — same bug found in gnome-callout's
  // story icon creation. DOMParser with the XML content type avoids it.
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" data-slot="file-type-icon-svg" viewBox="${icon.viewBox}" fill="currentColor" aria-hidden="true" focusable="false">${pathsMarkup}</svg>`;
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  return document.importNode(parsed.documentElement, true) as unknown as SVGElement;
}

/**
 * Small icon — optionally a thumbnail — resolved from a file's MIME type
 * or name extension. Useful for file-manager-style listings.
 *
 * Purely presentational and fully host-derived — nothing for the consumer
 * to author, same rationale as `gnome-divider`/`gnome-highlight`. No
 * `MutationObserver` is needed since nothing external ever swaps the
 * generated icon/thumbnail.
 *
 * Icon glyphs come from `@gnome-ui/icons` (framework-agnostic path data,
 * no React dependency) and are rendered the same way `gnome-callout`
 * builds its story icons: via `DOMParser`, not `document.createElement`,
 * to avoid the HTML-namespace self-closing-tag parsing bug.
 *
 * Falls back to the generic file icon (mirrors freedesktop's
 * `text-x-generic`) when the type can't be resolved.
 */
export class GnomeFileTypeIconElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'is-folder',
    'label',
    'mime-type',
    'name',
    'size',
    'thumbnail',
  ];

  #connected = false;
  #renderedKey: string | null = null;

  connectedCallback() {
    this.#connected = true;
    this.#syncState();
  }

  attributeChangedCallback() {
    if (this.#connected) {
      this.#syncState();
    }
  }

  get name() {
    return this.getAttribute('name') ?? '';
  }

  set name(value: string) {
    if (value) {
      this.setAttribute('name', value);
    } else {
      this.removeAttribute('name');
    }
  }

  get mimeType() {
    return this.getAttribute('mime-type') ?? '';
  }

  set mimeType(value: string) {
    if (value) {
      this.setAttribute('mime-type', value);
    } else {
      this.removeAttribute('mime-type');
    }
  }

  get isFolder() {
    return this.hasAttribute('is-folder');
  }

  set isFolder(value: boolean) {
    this.toggleAttribute('is-folder', value);
  }

  get thumbnail() {
    return this.getAttribute('thumbnail') ?? '';
  }

  set thumbnail(value: string) {
    if (value) {
      this.setAttribute('thumbnail', value);
    } else {
      this.removeAttribute('thumbnail');
    }
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

  get size(): GnomeFileTypeIconSize {
    const value = this.getAttribute('size');

    return value === 'sm' || value === 'lg' ? value : 'md';
  }

  set size(value: GnomeFileTypeIconSize) {
    this.setAttribute('size', value);
  }

  get category(): FileTypeCategory {
    if (this.isFolder) {
      return 'folder';
    }

    const { mimeType, name } = this;

    return (
      (mimeType && categoryFromMimeType(mimeType)) || (name && categoryFromName(name)) || 'unknown'
    );
  }

  #syncState() {
    const { category, thumbnail, size } = this;
    const resolvedLabel = this.label || getFileTypeLabel(category);

    if (this.getAttribute('role') !== 'img') {
      this.setAttribute('role', 'img');
    }

    if (this.getAttribute('aria-label') !== resolvedLabel) {
      this.setAttribute('aria-label', resolvedLabel);
    }

    if (this.dataset.size !== size) {
      this.dataset.size = size;
    }

    const key = thumbnail ? `thumbnail:${thumbnail}` : `icon:${category}`;

    if (this.#renderedKey === key) {
      return;
    }

    this.#renderedKey = key;
    this.textContent = '';

    if (thumbnail) {
      const img = document.createElement('img');
      img.dataset.slot = 'file-type-icon-thumbnail';
      img.src = thumbnail;
      img.alt = '';
      this.append(img);
      return;
    }

    this.append(buildIconSvg(getFileTypeIcon(category)));
  }
}

export function registerGnomeFileTypeIcon() {
  defineCustomElement('gnome-file-type-icon', GnomeFileTypeIconElement);
}

registerGnomeFileTypeIcon();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-file-type-icon': GnomeFileTypeIconElement;
  }
}
