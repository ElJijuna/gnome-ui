import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TextTruncate } from './TextTruncate';

// jsdom doesn't implement ResizeObserver.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let mockScrollWidth = 0;
let mockClientWidth = 0;
let mockScrollHeight = 0;
let mockClientHeight = 0;

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

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
});

beforeEach(() => {
  mockScrollWidth = 0;
  mockClientWidth = 0;
  mockScrollHeight = 0;
  mockClientHeight = 0;
});

afterEach(() => {
  mockScrollWidth = 0;
  mockClientWidth = 0;
  mockScrollHeight = 0;
  mockClientHeight = 0;
});

describe('TextTruncate', () => {
  describe('not truncated', () => {
    it('renders the text as plain content', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      render(<TextTruncate>Short label</TextTruncate>);

      expect(screen.getByText('Short label')).toBeInTheDocument();
    });

    it('does not render a tooltip trigger', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      render(<TextTruncate>Short label</TextTruncate>);

      expect(screen.getByText('Short label')).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('single-line truncation (default)', () => {
    it('measures overflow via scrollWidth vs clientWidth', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const { container } = render(<TextTruncate>A very long label that does not fit</TextTruncate>);

      // The tooltip's own (hidden) content div also contains the text, so
      // target the trigger specifically via the attribute Tooltip sets on it.
      expect(container.querySelector('[aria-describedby]')).toHaveTextContent(
        'A very long label that does not fit',
      );
    });

    it('applies the truncate class, not the clamp class', () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const { container } = render(<TextTruncate>A very long label that does not fit</TextTruncate>);
      const el = container.querySelector('[aria-describedby]') as HTMLElement;

      expect(el.className).toMatch(/truncate/);
      expect(el.className).not.toMatch(/clamp/);
    });

    it('reveals the full text in a tooltip on hover', async () => {
      mockScrollWidth = 300;
      mockClientWidth = 120;

      const { container } = render(<TextTruncate>A very long label that does not fit</TextTruncate>);
      const trigger = container.querySelector('[aria-describedby]') as HTMLElement;

      await userEvent.hover(trigger);

      expect(await screen.findAllByText('A very long label that does not fit')).toHaveLength(2);
    });
  });

  describe('multi-line clamping', () => {
    it('measures overflow via scrollHeight vs clientHeight when lines > 1', () => {
      mockScrollWidth = 0;
      mockClientWidth = 1000; // wide enough that single-line overflow would be false
      mockScrollHeight = 200;
      mockClientHeight = 60;

      const { container } = render(
        <TextTruncate lines={3}>A long paragraph spanning several lines of text</TextTruncate>,
      );

      expect(container.querySelector('[aria-describedby]')).toHaveTextContent(
        'A long paragraph spanning several lines of text',
      );
    });

    it('applies the clamp class and sets -webkit-line-clamp', () => {
      mockScrollHeight = 200;
      mockClientHeight = 60;

      const { container } = render(
        <TextTruncate lines={3}>A long paragraph spanning several lines of text</TextTruncate>,
      );
      const el = container.querySelector('[aria-describedby]') as HTMLElement;

      expect(el.className).toMatch(/clamp/);
      expect(el.style.getPropertyValue('-webkit-line-clamp')).toBe('3');
    });

    it('is not truncated when the content fits within the clamped lines', () => {
      mockScrollHeight = 40;
      mockClientHeight = 60;

      render(<TextTruncate lines={3}>Short paragraph</TextTruncate>);

      expect(screen.getByText('Short paragraph')).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      render(<TextTruncate className="custom">Label</TextTruncate>);
      expect(screen.getByText('Label')).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes', () => {
      mockScrollWidth = 100;
      mockClientWidth = 100;

      render(<TextTruncate data-testid="label">Label</TextTruncate>);
      expect(screen.getByTestId('label')).toBeInTheDocument();
    });
  });
});
