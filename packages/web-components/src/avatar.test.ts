import { describe, expect, it } from 'vitest';

import { GnomeAvatarElement, getInitials, hashNameToColor } from './avatar';

function renderAvatar(markup = '', attrs: Record<string, string> = {}) {
  const avatar = document.createElement('gnome-avatar');

  for (const [name, value] of Object.entries(attrs)) {
    avatar.setAttribute(name, value);
  }

  avatar.innerHTML = markup;
  document.body.append(avatar);

  return {
    avatar,
    image: avatar.querySelector<HTMLImageElement>('[data-slot="avatar-image"]'),
    initials: avatar.querySelector<HTMLSpanElement>('[data-slot="avatar-initials"]'),
  };
}

describe('getInitials', () => {
  it('extracts up to two initials from a full name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('Cher')).toBe('C');
    expect(getInitials('  ')).toBe('');
  });
});

describe('hashNameToColor', () => {
  it('is stable for the same name', () => {
    expect(hashNameToColor('Ada Lovelace')).toBe(hashNameToColor('Ada Lovelace'));
  });
});

describe('GnomeAvatarElement', () => {
  it('registers the custom element and defaults role/label/color without a name or image', () => {
    const { avatar, initials } = renderAvatar();

    expect(customElements.get('gnome-avatar')).toBe(GnomeAvatarElement);
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Avatar');
    expect(avatar.dataset.size).toBe('md');
    expect(avatar.dataset.color).toBe('blue');
    expect(initials?.hidden).toBe(false);
    expect(initials?.getAttribute('aria-hidden')).toBe('true');
  });

  it('derives initials, color, and aria-label from name', () => {
    const { avatar, initials } = renderAvatar('', { name: 'Ada Lovelace' });

    expect(initials?.textContent).toBe('AL');
    expect(avatar.dataset.color).toBe(hashNameToColor('Ada Lovelace'));
    expect(avatar.getAttribute('aria-label')).toBe('Ada Lovelace');
  });

  it('lets an explicit color attribute override the name-derived hash', () => {
    const { avatar } = renderAvatar('', { color: 'red', name: 'Ada Lovelace' });

    expect(avatar.dataset.color).toBe('red');
  });

  it('ignores an invalid color attribute and falls back to the hash', () => {
    const { avatar } = renderAvatar('', { color: 'ultraviolet', name: 'Ada Lovelace' });

    expect(avatar.dataset.color).toBe(hashNameToColor('Ada Lovelace'));
  });

  it('shows the image and hides initials when a src is present', () => {
    const { image, initials } = renderAvatar('<img data-slot="avatar-image" src="/ada.png" />', {
      name: 'Ada Lovelace',
    });

    expect(image?.hidden).toBe(false);
    expect(initials?.hidden).toBe(true);
  });

  it('defaults the image alt from name without overwriting an explicit alt', () => {
    const { image: withoutAlt } = renderAvatar('<img data-slot="avatar-image" src="/ada.png" />', {
      name: 'Ada Lovelace',
    });
    expect(withoutAlt?.getAttribute('alt')).toBe('Ada Lovelace');

    const { image: withAlt } = renderAvatar(
      '<img data-slot="avatar-image" src="/ada.png" alt="Custom alt" />',
      { name: 'Ada Lovelace' },
    );
    expect(withAlt?.getAttribute('alt')).toBe('Custom alt');
  });

  it('falls back to initials immediately when the image has no src', () => {
    const { image, initials } = renderAvatar('<img data-slot="avatar-image" />', {
      name: 'Ada Lovelace',
    });

    expect(image?.hidden).toBe(true);
    expect(initials?.hidden).toBe(false);
  });

  it('falls back to initials when the image fires an error event', () => {
    const { image, initials } = renderAvatar('<img data-slot="avatar-image" src="/broken.png" />', {
      name: 'Ada Lovelace',
    });

    expect(image?.hidden).toBe(false);
    expect(initials?.hidden).toBe(true);

    image?.dispatchEvent(new Event('error'));

    expect(image?.hidden).toBe(true);
    expect(initials?.hidden).toBe(false);
  });

  it('recovers when the image loads successfully after a previous error', () => {
    const { image, initials } = renderAvatar('<img data-slot="avatar-image" src="/broken.png" />', {
      name: 'Ada Lovelace',
    });

    image?.dispatchEvent(new Event('error'));
    expect(image?.hidden).toBe(true);

    image?.dispatchEvent(new Event('load'));
    expect(image?.hidden).toBe(false);
    expect(initials?.hidden).toBe(true);
  });

  it('adopts a pre-existing initials element instead of creating a duplicate', () => {
    const { avatar, initials } = renderAvatar('<span data-slot="avatar-initials">SSR</span>', {
      name: 'Ada Lovelace',
    });

    expect(avatar.querySelectorAll('[data-slot="avatar-initials"]')).toHaveLength(1);
    expect(initials?.textContent).toBe('AL');
  });

  it('restores fallback behavior after an htmx-style image swap', async () => {
    const { avatar, image: original } = renderAvatar(
      '<img data-slot="avatar-image" src="/ada.png" />',
      { name: 'Ada Lovelace' },
    );

    const replacement = document.createElement('img');
    replacement.dataset.slot = 'avatar-image';
    original?.replaceWith(replacement);
    await Promise.resolve();

    expect(avatar.querySelector('[data-slot="avatar-initials"]')).not.toBeNull();

    replacement.dispatchEvent(new Event('error'));
    expect(replacement.hidden).toBe(true);
    expect(avatar.querySelector<HTMLElement>('[data-slot="avatar-initials"]')?.hidden).toBe(false);
  });
});
