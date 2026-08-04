import { beforeEach, describe, expect, it } from 'vitest';

import { GnomeTextTruncateElement } from './text-truncate';

let mockScrollWidth = 0;
let mockClientWidth = 0;
let mockScrollHeight = 0;
let mockClientHeight = 0;

Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
  configurable: true,
  get() {
    return mockScrollWidth;
  },
});
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return mockClientWidth;
  },
});
Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  configurable: true,
  get() {
    return mockScrollHeight;
  },
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return mockClientHeight;
  },
});

beforeEach(() => {
  mockScrollWidth = 0;
  mockClientWidth = 0;
  mockScrollHeight = 0;
  mockClientHeight = 0;
});

function renderTextTruncate(text: string, setup?: (el: GnomeTextTruncateElement) => void) {
  const el = document.createElement('gnome-text-truncate') as GnomeTextTruncateElement;
  el.textContent = text;
  setup?.(el);
  document.body.append(el);

  return el;
}

function content(el: GnomeTextTruncateElement) {
  return el.querySelector<HTMLElement>(
    '[data-slot="text-truncate-content"], [data-slot="tooltip-trigger"]',
  );
}

describe('GnomeTextTruncateElement', () => {
  it('registers the custom element', () => {
    renderTextTruncate('Short label');
    expect(customElements.get('gnome-text-truncate')).toBe(GnomeTextTruncateElement);
  });

  describe('not truncated', () => {
    it('renders the text as plain content with no tooltip', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      const el = renderTextTruncate('Short label');

      expect(content(el)?.textContent).toBe('Short label');
      expect(content(el)?.dataset.slot).toBe('text-truncate-content');
      expect(el.querySelector('gnome-tooltip')).toBeNull();
      expect(content(el)?.hasAttribute('aria-describedby')).toBe(false);
      expect(el.truncated).toBe(false);
      expect(el.hasAttribute('data-truncated')).toBe(false);
    });
  });

  describe('single-line truncation (default)', () => {
    it('measures overflow via scrollWidth vs clientWidth and wraps in a tooltip', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const el = renderTextTruncate('A very long label that does not fit');

      expect(el.truncated).toBe(true);
      expect(el.hasAttribute('data-truncated')).toBe(true);

      const trigger = content(el);
      expect(trigger?.dataset.slot).toBe('tooltip-trigger');
      expect(trigger?.textContent).toBe('A very long label that does not fit');
      expect(trigger?.closest('gnome-tooltip')).not.toBeNull();
      expect(trigger?.hasAttribute('aria-describedby')).toBe(true);

      const tooltipContent = el.querySelector('[data-slot="tooltip-content"]');
      expect(tooltipContent?.textContent).toBe('A very long label that does not fit');
    });

    it('does not set data-clamp or -webkit-line-clamp', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const el = renderTextTruncate('A very long label that does not fit');
      const trigger = content(el) as HTMLElement;

      expect(trigger.hasAttribute('data-clamp')).toBe(false);
      expect(trigger.style.getPropertyValue('-webkit-line-clamp')).toBe('');
    });
  });

  describe('multi-line clamping', () => {
    it('measures overflow via scrollHeight vs clientHeight when lines > 1', () => {
      mockScrollWidth = 0;
      mockClientWidth = 1000; // wide enough that single-line overflow would be false
      mockScrollHeight = 200;
      mockClientHeight = 60;

      const el = renderTextTruncate('A long paragraph spanning several lines of text', (node) => {
        node.lines = 3;
      });

      expect(el.truncated).toBe(true);
      expect(content(el)?.closest('gnome-tooltip')).not.toBeNull();
    });

    it('applies data-clamp and sets -webkit-line-clamp', () => {
      mockScrollHeight = 200;
      mockClientHeight = 60;

      const el = renderTextTruncate('A long paragraph spanning several lines of text', (node) => {
        node.lines = 3;
      });
      const trigger = content(el) as HTMLElement;

      expect(trigger.hasAttribute('data-clamp')).toBe(true);
      expect(trigger.style.getPropertyValue('-webkit-line-clamp')).toBe('3');
    });

    it('is not truncated when the content fits within the clamped lines', () => {
      mockScrollHeight = 40;
      mockClientHeight = 60;

      const el = renderTextTruncate('Short paragraph', (node) => {
        node.lines = 3;
      });

      expect(el.truncated).toBe(false);
      expect(el.querySelector('gnome-tooltip')).toBeNull();
    });
  });

  describe('text property', () => {
    it('captures the initial light-DOM text content', () => {
      const el = renderTextTruncate('Captured once');
      expect(el.text).toBe('Captured once');
    });

    it('updates the rendered content and re-measures', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      const el = renderTextTruncate('Short');
      expect(el.truncated).toBe(false);

      mockScrollWidth = 300;
      el.text = 'A much longer replacement value';

      expect(content(el)?.textContent).toBe('A much longer replacement value');
      expect(el.truncated).toBe(true);
    });

    it('keeps the tooltip content in sync with a later text change', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const el = renderTextTruncate('Initial long label that overflows');
      el.text = 'Updated long label that overflows';

      expect(el.querySelector('[data-slot="tooltip-content"]')?.textContent).toBe(
        'Updated long label that overflows',
      );
    });
  });

  describe('lines property', () => {
    it('re-measures using the new dimension when lines changes after connecting', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;
      mockScrollHeight = 40;
      mockClientHeight = 60;

      const el = renderTextTruncate('A very long label that does not fit');
      expect(el.truncated).toBe(true);

      el.lines = 3;
      expect(el.truncated).toBe(false);
      expect(el.querySelector('gnome-tooltip')).toBeNull();
    });
  });

  describe('tooltipPlacement property', () => {
    it('defaults to top and forwards to the internal tooltip', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const el = renderTextTruncate('A very long label that does not fit', (node) => {
        node.tooltipPlacement = 'bottom';
      });

      expect(el.tooltipPlacement).toBe('bottom');
      expect(el.querySelector('gnome-tooltip')?.getAttribute('placement')).toBe('bottom');
    });

    it('updates the live tooltip when changed after truncation', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const el = renderTextTruncate('A very long label that does not fit');
      el.tooltipPlacement = 'left';

      expect(el.querySelector('gnome-tooltip')?.getAttribute('placement')).toBe('left');
    });
  });
});
