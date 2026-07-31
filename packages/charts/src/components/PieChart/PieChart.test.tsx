import { fireEvent, render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { PieChart } from './PieChart';

const DATA = [
  { label: 'Chrome', value: 62 },
  { label: 'Firefox', value: 18 },
  { label: 'Safari', value: 11 },
];

// Recharts' ResponsiveContainer measures itself via getBoundingClientRect, which
// jsdom always reports as 0x0 — so the chart never renders any real SVG geometry
// (and custom label/tooltip renderers never run) unless we fake a real size.
// requestAnimationFrame is also stubbed with advancing timestamps, since react-smooth's
// enter animation otherwise never resolves in jsdom.
const withRealLayout = () => {
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeAll(() => {
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 800,
        height: 400,
        top: 0,
        left: 0,
        right: 800,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON() {},
      }),
    });

    let frame = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frame += 20;
      cb(frame);

      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      writable: true,
      value: originalGetBoundingClientRect,
    });
    vi.unstubAllGlobals();
  });
};

describe('PieChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PieChart data={DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<PieChart data={DATA} height={300} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '300px' });
    });

    it('uses 400px as default height', () => {
      const { container } = render(<PieChart data={DATA} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '400px' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<PieChart data={DATA} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates an aria-label that includes each item's label and value", () => {
      const { container } = render(<PieChart data={DATA} />);
      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Chrome'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('62'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Firefox'));
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(<PieChart data={DATA} aria-label="Browser market share" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Browser market share',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<PieChart data={DATA} className="pie-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('pie-cls');
    });
  });

  describe('props', () => {
    it('renders without crashing in donut mode', () => {
      const { container } = render(<PieChart data={DATA} donut />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with showLabels and showLegend', () => {
      const { container } = render(<PieChart data={DATA} showLabels showLegend />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders a pie slice per data item', () => {
      const { container } = render(<PieChart data={DATA} />);

      expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(DATA.length);
    });

    it('renders slice labels with each item name when showLabels is true', () => {
      const { container } = render(<PieChart data={DATA} showLabels />);
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts).toEqual(expect.arrayContaining(['Chrome', 'Firefox', 'Safari']));
    });

    it('omits the label for a slice smaller than the 4% threshold', () => {
      const { container } = render(
        <PieChart
          data={[
            { label: 'Big', value: 999 },
            { label: 'Tiny', value: 1 },
          ]}
          showLabels
        />,
      );
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts).toContain('Big');
      expect(texts).not.toContain('Tiny');
    });

    it('does not render slice labels when showLabels is false', () => {
      const { container } = render(<PieChart data={DATA} />);

      expect(container.querySelectorAll('text')).toHaveLength(0);
    });

    it('formats the tooltip value on hover', () => {
      const { container } = render(<PieChart data={DATA} />);
      const sector = container.querySelector('.recharts-pie-sector path');

      expect(sector).not.toBeNull();

      fireEvent.mouseOver(sector as Element);
      fireEvent.mouseMove(sector as Element);

      expect(document.querySelector('.recharts-tooltip-wrapper')).toHaveTextContent('62');
    });
  });
});
