import { describe, expect, it, vi } from 'vitest';

import { GnomeActionRowElement } from './action-row';

function renderRow(markup: string, attrs: Record<string, string> = {}) {
  const row = document.createElement('gnome-action-row');

  for (const [name, value] of Object.entries(attrs)) {
    row.setAttribute(name, value);
  }

  row.innerHTML = markup;
  document.body.append(row);

  return {
    content: row.querySelector<HTMLElement>('[data-slot="row-content"]'),
    row,
    surface: row.querySelector<HTMLElement>('[data-slot="row-surface"]'),
  };
}

const BASIC_MARKUP =
  '<span data-slot="row-title">Wi-Fi</span>' + '<span data-slot="row-subtitle">Home Network</span>';

describe('GnomeActionRowElement', () => {
  it('registers the custom element and defaults to non-interactive/default variant', () => {
    const { row } = renderRow(BASIC_MARKUP);

    expect(customElements.get('gnome-action-row')).toBe(GnomeActionRowElement);
    expect(row.interactive).toBe(false);
    expect(row.variant).toBe('default');
  });

  it('wraps title/subtitle in a generated row-content element', () => {
    const { content, row } = renderRow(BASIC_MARKUP);

    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(row);
    expect(content?.querySelector('[data-slot="row-title"]')?.textContent).toBe('Wi-Fi');
    expect(content?.querySelector('[data-slot="row-subtitle"]')?.textContent).toBe('Home Network');
  });

  it('does not generate row-content when there is no title/subtitle at all', () => {
    const { row } = renderRow('<span data-slot="row-suffix">suffix only</span>');

    expect(row.querySelector('[data-slot="row-content"]')).toBeNull();
  });

  it('adopts a pre-existing row-content wrapper instead of generating a duplicate', () => {
    const { row } = renderRow(
      '<span data-slot="row-content"><span data-slot="row-title">Wi-Fi</span></span>',
    );

    expect(row.querySelectorAll('[data-slot="row-content"]')).toHaveLength(1);
  });

  describe('interactive', () => {
    it('wraps prefix + content in a generated <button data-slot="row-surface">, leaving suffix outside', () => {
      const { row, surface } = renderRow(
        '<span data-slot="row-prefix">🔔</span>' +
          BASIC_MARKUP +
          '<span data-slot="row-suffix"><button type="button">Configure</button></span>',
        { interactive: '' },
      );

      expect(surface?.tagName).toBe('BUTTON');
      expect(surface?.getAttribute('type')).toBe('button');
      expect(surface?.querySelector('[data-slot="row-prefix"]')).not.toBeNull();
      expect(surface?.querySelector('[data-slot="row-title"]')).not.toBeNull();

      const suffix = row.querySelector<HTMLElement>('[data-slot="row-suffix"]');
      expect(suffix?.parentElement).toBe(row);
      expect(surface?.contains(suffix as Node)).toBe(false);
    });

    it('adopts a pre-existing row-surface instead of generating a duplicate', () => {
      const { row, surface } = renderRow(
        '<a href="/wifi" data-slot="row-surface">' + BASIC_MARKUP + '</a>',
        { interactive: '' },
      );

      expect(surface?.tagName).toBe('A');
      expect(row.querySelectorAll('[data-slot="row-surface"]')).toHaveLength(1);
    });

    it('copies a host aria-label onto a generated surface', () => {
      const { surface } = renderRow(BASIC_MARKUP, {
        'aria-label': 'Open Wi-Fi settings',
        interactive: '',
      });

      expect(surface?.getAttribute('aria-label')).toBe('Open Wi-Fi settings');
    });

    it('unwraps the surface when interactive is removed', () => {
      const { row } = renderRow(BASIC_MARKUP, { interactive: '' });

      row.removeAttribute('interactive');

      expect(row.querySelector('[data-slot="row-surface"]')).toBeNull();
      expect(row.querySelector('[data-slot="row-content"]')).not.toBeNull();
    });

    it('emits gnome-activate when the surface is clicked', () => {
      const { surface, row } = renderRow(BASIC_MARKUP, { interactive: '' });
      const onActivate = vi.fn();
      row.addEventListener('gnome-activate', onActivate);

      surface?.click();

      expect(onActivate).toHaveBeenCalledOnce();
    });

    it('does not emit gnome-activate when clicking a row-suffix control', () => {
      const { row } = renderRow(
        BASIC_MARKUP +
          '<span data-slot="row-suffix"><button type="button">Configure</button></span>',
        { interactive: '' },
      );
      const onActivate = vi.fn();
      row.addEventListener('gnome-activate', onActivate);

      row.querySelector<HTMLButtonElement>('[data-slot="row-suffix"] button')?.click();

      expect(onActivate).not.toHaveBeenCalled();
    });

    it('stops emitting gnome-activate through the old surface after interactive is toggled off then on', () => {
      const { row } = renderRow(BASIC_MARKUP, { interactive: '' });
      const firstSurface = row.querySelector<HTMLButtonElement>('[data-slot="row-surface"]');

      row.removeAttribute('interactive');
      row.setAttribute('interactive', '');

      const onActivate = vi.fn();
      row.addEventListener('gnome-activate', onActivate);

      firstSurface?.click();
      expect(onActivate).not.toHaveBeenCalled();

      row.querySelector<HTMLButtonElement>('[data-slot="row-surface"]')?.click();
      expect(onActivate).toHaveBeenCalledOnce();
    });
  });

  describe('variant', () => {
    it('reflects the variant property to the attribute', () => {
      const { row } = renderRow(BASIC_MARKUP);

      row.variant = 'property';
      expect(row.getAttribute('variant')).toBe('property');
    });

    it('treats an invalid variant attribute as "default"', () => {
      const { row } = renderRow(BASIC_MARKUP, { variant: 'nonsense' });

      expect(row.variant).toBe('default');
    });
  });

  it('reflects the interactive property to the attribute', () => {
    const { row } = renderRow(BASIC_MARKUP);

    row.interactive = true;
    expect(row.hasAttribute('interactive')).toBe(true);
  });
});
