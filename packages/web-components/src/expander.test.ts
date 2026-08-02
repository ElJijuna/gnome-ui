import { describe, expect, it, vi } from 'vitest';

import { GnomeExpanderElement, type GnomeExpanderOpenChangeDetail } from './expander';

function renderExpander(setup?: (el: GnomeExpanderElement) => void) {
  const expander = document.createElement('gnome-expander') as GnomeExpanderElement;
  setup?.(expander);
  document.body.append(expander);

  return expander;
}

function header(expander: Element) {
  return expander.querySelector<HTMLButtonElement>('[data-slot="expander-header"]');
}

function panel(expander: Element) {
  return expander.querySelector<HTMLElement>('[data-slot="expander-panel"]');
}

describe('GnomeExpanderElement', () => {
  it('registers the custom element', () => {
    renderExpander();
    expect(customElements.get('gnome-expander')).toBe(GnomeExpanderElement);
  });

  it('renders the label', () => {
    const expander = renderExpander((el) => {
      el.label = 'Show advanced options';
    });

    expect(header(expander)?.textContent).toContain('Show advanced options');
  });

  it('renders a toggle button controlling a labelled region', () => {
    const expander = renderExpander((el) => {
      el.label = 'Advanced';
    });

    const btn = header(expander);
    const region = panel(expander);

    expect(btn?.getAttribute('aria-controls')).toBe(region?.id);
    expect(region?.getAttribute('aria-labelledby')).toBe(btn?.id);
    expect(region?.getAttribute('role')).toBe('region');
  });

  it('moves original light-DOM children into the panel', () => {
    const expander = document.createElement('gnome-expander') as GnomeExpanderElement;
    expander.label = 'Advanced';
    const content = document.createElement('div');
    content.textContent = 'Nested content';
    expander.append(content);
    document.body.append(expander);

    const inner = panel(expander)?.querySelector('[data-slot="expander-panel-inner"]');
    expect(inner?.contains(content)).toBe(true);
  });

  describe('expanded state', () => {
    it('is collapsed by default', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
      });
      expect(header(expander)?.getAttribute('aria-expanded')).toBe('false');
    });

    it('reflects the expanded attribute', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
        el.expanded = true;
      });
      expect(header(expander)?.getAttribute('aria-expanded')).toBe('true');
      expect(expander.hasAttribute('data-expanded')).toBe(true);
    });
  });

  describe('interactions', () => {
    it('toggles expanded state on header click', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
      });
      const btn = header(expander) as HTMLButtonElement;

      btn.click();
      expect(btn.getAttribute('aria-expanded')).toBe('true');

      btn.click();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('emits gnome-open-change with the next value', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
      });
      const listener = vi.fn<(event: CustomEvent<GnomeExpanderOpenChangeDetail>) => void>();
      expander.addEventListener('gnome-open-change', listener);

      header(expander)?.click();

      expect(listener.mock.calls[0]?.[0].detail).toEqual({ open: true });
    });
  });

  describe('disabled', () => {
    it('disables the toggle button', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
        el.disabled = true;
      });
      expect(header(expander)?.disabled).toBe(true);
    });

    it('does not toggle on click when disabled', () => {
      const expander = renderExpander((el) => {
        el.label = 'Advanced';
        el.disabled = true;
      });
      const btn = header(expander) as HTMLButtonElement;

      btn.click();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('does not rebuild the header/panel on repeated attribute changes', () => {
    const expander = renderExpander((el) => {
      el.label = 'Advanced';
    });

    const firstHeader = header(expander);
    const firstPanel = panel(expander);

    expander.label = 'Updated';
    expander.expanded = true;

    expect(header(expander)).toBe(firstHeader);
    expect(panel(expander)).toBe(firstPanel);
  });
});
