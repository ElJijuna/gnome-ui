import { describe, expect, it, vi } from 'vitest';

import { GnomeExpanderRowElement, type GnomeExpanderRowOpenChangeDetail } from './expander-row';

function renderExpanderRow(
  markup = `
    <span data-slot="row-prefix">🔒</span>
    <span data-slot="row-title">Advanced settings</span>
    <span data-slot="row-subtitle">Configure additional options</span>
    <span data-slot="row-suffix">Beta</span>
    <div>Row A</div>
    <div>Row B</div>
    <div>Row C</div>
  `,
) {
  const expanderRow = document.createElement('gnome-expander-row');
  expanderRow.innerHTML = markup;
  document.body.append(expanderRow);

  return {
    expanderRow,
    inner: expanderRow.querySelector<HTMLElement>('[data-slot="row-panel-inner"]'),
    panel: expanderRow.querySelector<HTMLElement>('[data-slot="row-panel"]'),
    surface: expanderRow.querySelector<HTMLButtonElement>('[data-slot="row-surface"]'),
  };
}

describe('GnomeExpanderRowElement', () => {
  it('registers the custom element and wraps a real button surface', () => {
    const { surface } = renderExpanderRow();

    expect(customElements.get('gnome-expander-row')).toBe(GnomeExpanderRowElement);
    expect(surface).toBeInstanceOf(HTMLButtonElement);
    expect(surface?.type).toBe('button');
    expect(surface?.getAttribute('aria-expanded')).toBe('false');
  });

  it('wraps prefix, content, and suffix inside the surface, in that order, plus a chevron', () => {
    const { surface } = renderExpanderRow();
    const children = Array.from(surface?.children ?? []).map((el) => el.dataset.slot);

    expect(children).toEqual(['row-prefix', 'row-content', 'row-suffix', 'row-chevron']);
    expect(surface?.querySelector('[data-slot="row-chevron"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('moves remaining children into a generated region panel, wired to the surface', () => {
    const { inner, panel, surface } = renderExpanderRow();

    expect(panel?.getAttribute('role')).toBe('region');
    expect(surface?.getAttribute('aria-controls')).toBe(panel?.id);
    expect(panel?.getAttribute('aria-labelledby')).toBe(surface?.id);
    expect(inner?.children).toHaveLength(3);
    expect(inner?.textContent).toContain('Row A');
    expect(inner?.textContent).toContain('Row C');
  });

  it('toggles expanded/aria-expanded on click and emits gnome-open-change', () => {
    const { expanderRow, surface } = renderExpanderRow();
    const listener = vi.fn<(event: CustomEvent<GnomeExpanderRowOpenChangeDetail>) => void>();
    expanderRow.addEventListener('gnome-open-change', listener);

    surface?.click();

    expect(expanderRow.expanded).toBe(true);
    expect(surface?.getAttribute('aria-expanded')).toBe('true');
    expect(listener.mock.calls[0]?.[0].detail).toEqual({ open: true });

    surface?.click();

    expect(expanderRow.expanded).toBe(false);
    expect(listener.mock.calls[1]?.[0].detail).toEqual({ open: false });
  });

  it('reflects the expanded attribute programmatically without a click', () => {
    const { expanderRow, surface } = renderExpanderRow();

    expanderRow.expanded = true;

    expect(surface?.getAttribute('aria-expanded')).toBe('true');
  });

  it('works with no nested rows (no panel generated)', () => {
    const { inner, panel, surface } = renderExpanderRow(`
      <span data-slot="row-title">Just a header</span>
    `);

    expect(surface).not.toBeNull();
    expect(panel).toBeNull();
    expect(inner).toBeNull();
  });

  it('adopts an author-supplied row-surface instead of generating one', () => {
    const { expanderRow, surface } = renderExpanderRow(`
      <a data-slot="row-surface" href="#advanced">
        <span data-slot="row-title">Advanced</span>
      </a>
      <div>Nested</div>
    `);

    expect(surface?.tagName).toBe('A');
    expect(expanderRow.querySelectorAll('[data-slot="row-surface"]')).toHaveLength(1);
    expect(surface?.querySelector('[data-slot="row-chevron"]')).not.toBeNull();
  });
});
