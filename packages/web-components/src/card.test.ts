import { describe, expect, it } from 'vitest';

import { GnomeCardElement } from './card';

function renderCard(markup: string, attrs: Record<string, string> = {}) {
  const card = document.createElement('gnome-card');

  for (const [name, value] of Object.entries(attrs)) {
    card.setAttribute(name, value);
  }

  card.innerHTML = markup;
  document.body.append(card);

  return {
    card,
    surface: card.querySelector<HTMLElement>('[data-slot="card-surface"]'),
  };
}

describe('GnomeCardElement', () => {
  it('registers the custom element and renders children directly with no surface by default', () => {
    const { card, surface } = renderCard('<p>Content</p>');

    expect(customElements.get('gnome-card')).toBe(GnomeCardElement);
    expect(card.textContent).toBe('Content');
    expect(surface).toBeNull();
    expect(card.padding).toBe('md');
    expect(card.interactive).toBe(false);
  });

  it('normalizes an invalid padding attribute to "md"', () => {
    const { card } = renderCard('', { padding: 'huge' });

    expect(card.padding).toBe('md');
  });

  it('reflects padding/interactive properties to attributes', () => {
    const { card } = renderCard('');

    card.padding = 'lg';
    expect(card.getAttribute('padding')).toBe('lg');

    card.interactive = true;
    expect(card.hasAttribute('interactive')).toBe(true);
  });

  describe('interactive', () => {
    it('wraps existing children in a generated <button data-slot="card-surface">', () => {
      const { card, surface } = renderCard('<p>Open settings</p>', { interactive: '' });

      expect(surface).not.toBeNull();
      expect(surface?.tagName).toBe('BUTTON');
      expect(surface?.getAttribute('type')).toBe('button');
      expect(surface?.parentElement).toBe(card);
      expect(surface?.textContent).toBe('Open settings');
      expect(card.children).toHaveLength(1);
    });

    it('adopts a pre-existing data-slot="card-surface" instead of generating a duplicate', () => {
      const { card, surface } = renderCard(
        '<a href="/settings" data-slot="card-surface">Open settings</a>',
        { interactive: '' },
      );

      expect(surface?.tagName).toBe('A');
      expect(card.querySelectorAll('[data-slot="card-surface"]')).toHaveLength(1);
    });

    it('copies a host aria-label onto a generated surface', () => {
      const { surface } = renderCard('<p>Content</p>', {
        'aria-label': 'Open settings',
        interactive: '',
      });

      expect(surface?.getAttribute('aria-label')).toBe('Open settings');
    });

    it('unwraps the surface (moving children back onto the host) when interactive is removed', () => {
      const { card, surface: initialSurface } = renderCard('<p>Open settings</p>', {
        interactive: '',
      });
      expect(initialSurface).not.toBeNull();

      card.removeAttribute('interactive');

      expect(card.querySelector('[data-slot="card-surface"]')).toBeNull();
      expect(card.textContent).toBe('Open settings');
    });

    it('re-wraps into a fresh surface when interactive is toggled back on', () => {
      const { card } = renderCard('<p>Open settings</p>', { interactive: '' });

      card.removeAttribute('interactive');
      card.setAttribute('interactive', '');

      const surface = card.querySelector<HTMLElement>('[data-slot="card-surface"]');
      expect(surface?.tagName).toBe('BUTTON');
      expect(surface?.textContent).toBe('Open settings');
    });

    it('fires native click events through the generated button', () => {
      const { surface } = renderCard('<p>Open settings</p>', { interactive: '' });
      let clicked = false;
      surface?.addEventListener('click', () => {
        clicked = true;
      });

      surface?.click();

      expect(clicked).toBe(true);
    });
  });
});
