import { defineCustomElement, HTMLElementBase } from './internal/dom';

export type GnomeAvatarSize = 'lg' | 'md' | 'sm' | 'xl';

/** Named color palette for the initials fallback. Mirrors libadwaita's avatar color set. */
export type GnomeAvatarColor =
  | 'blue'
  | 'brown'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'slate'
  | 'teal'
  | 'yellow';

const COLORS: readonly GnomeAvatarColor[] = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brown',
  'teal',
  'slate',
];

const IMAGE_SELECTOR = 'img[data-slot="avatar-image"]';
const INITIALS_SELECTOR = '[data-slot="avatar-initials"]';

/** Stable, non-cryptographic hash → index into the named color palette. */
export function hashNameToColor(name: string): GnomeAvatarColor {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return COLORS[hash % COLORS.length];
}

/** Extract up to 2 initials from a name string. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

/**
 * Circular avatar with an image or a name-derived initials fallback.
 *
 * A descendant `<img data-slot="avatar-image">` is composed as a real native
 * image — its own `error`/`load` events drive the fallback, matching normal
 * browser image-loading behavior. Initials are always derived from `name`,
 * so unlike every other component in this package the host itself manages a
 * `[data-slot="avatar-initials"]` element (adopting one already present in
 * light DOM, e.g. from SSR, or creating one) rather than requiring the
 * consumer to author derived text.
 */
export class GnomeAvatarElement extends HTMLElementBase {
  static readonly observedAttributes = ['color', 'name', 'size'];

  #connected = false;
  #image: HTMLImageElement | null = null;
  #imageErrored = false;
  #initials: HTMLSpanElement | null = null;
  #observer: MutationObserver | null = null;

  #handleImageError = () => {
    this.#imageErrored = true;
    this.#syncFallback();
  };

  #handleImageLoad = () => {
    this.#imageErrored = false;
    this.#syncFallback();
  };

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'img');
    }

    this.#syncImage();
    this.#observe();
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#detachImage();
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
    this.setAttribute('name', value);
  }

  get size(): GnomeAvatarSize {
    const value = this.getAttribute('size');

    return value === 'sm' || value === 'lg' || value === 'xl' ? value : 'md';
  }

  set size(value: GnomeAvatarSize) {
    this.setAttribute('size', value);
  }

  get color(): GnomeAvatarColor | undefined {
    const value = this.getAttribute('color');

    return (COLORS as readonly string[]).includes(value ?? '')
      ? (value as GnomeAvatarColor)
      : undefined;
  }

  set color(value: GnomeAvatarColor | undefined) {
    if (value === undefined) {
      this.removeAttribute('color');
    } else {
      this.setAttribute('color', value);
    }
  }

  #detachImage() {
    this.#image?.removeEventListener('error', this.#handleImageError);
    this.#image?.removeEventListener('load', this.#handleImageLoad);
  }

  #observe() {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver((mutations) => {
      const structureChanged = mutations.some(
        (mutation) =>
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' && mutation.attributeName === 'data-slot'),
      );

      if (structureChanged) {
        this.#syncImage();
        return;
      }

      const imageStateChanged = mutations.some(
        (mutation) =>
          mutation.target === this.#image &&
          (mutation.attributeName === 'alt' || mutation.attributeName === 'src'),
      );

      if (imageStateChanged) {
        this.#imageErrored = false;
        this.#syncState();
      }
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ['alt', 'data-slot', 'src'],
      childList: true,
      subtree: true,
    });
  }

  #syncImage() {
    const image = this.querySelector<HTMLImageElement>(IMAGE_SELECTOR);

    if (image !== this.#image) {
      this.#detachImage();
      this.#image = image;
      this.#imageErrored = false;
      image?.addEventListener('error', this.#handleImageError);
      image?.addEventListener('load', this.#handleImageLoad);
    }

    this.#syncState();
  }

  #syncState() {
    const resolvedColor = this.color ?? (this.name ? hashNameToColor(this.name) : 'blue');

    this.dataset.size = this.size;
    this.dataset.color = resolvedColor;

    if (this.#image && this.name && !this.#image.getAttribute('alt')) {
      this.#image.setAttribute('alt', this.name);
    }

    this.setAttribute('aria-label', this.#image?.getAttribute('alt') || this.name || 'Avatar');

    this.#syncFallback();
  }

  #syncFallback() {
    const hasUsableImage = Boolean(this.#image?.getAttribute('src')) && !this.#imageErrored;

    if (this.#image && this.#image.hidden !== !hasUsableImage) {
      this.#image.hidden = !hasUsableImage;
    }

    if (!this.#initials?.isConnected) {
      this.#initials = this.querySelector<HTMLSpanElement>(INITIALS_SELECTOR);

      if (!this.#initials) {
        this.#initials = document.createElement('span');
        this.#initials.dataset.slot = 'avatar-initials';
        this.append(this.#initials);
      }

      if (this.#initials.getAttribute('aria-hidden') !== 'true') {
        this.#initials.setAttribute('aria-hidden', 'true');
      }
    }

    // Idempotent writes: `.textContent =` always replaces child nodes (a
    // childList mutation), and this method is re-entered by the observer's
    // own `childList` records — an unconditional write here would recreate
    // its own trigger forever.
    if (this.#initials.hidden !== hasUsableImage) {
      this.#initials.hidden = hasUsableImage;
    }

    const initialsText = getInitials(this.name);

    if (this.#initials.textContent !== initialsText) {
      this.#initials.textContent = initialsText;
    }
  }
}

export function registerGnomeAvatar() {
  defineCustomElement('gnome-avatar', GnomeAvatarElement);
}

registerGnomeAvatar();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-avatar': GnomeAvatarElement;
  }
}
