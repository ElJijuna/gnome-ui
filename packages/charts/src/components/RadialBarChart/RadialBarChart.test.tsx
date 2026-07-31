import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { RadialBarChart } from './RadialBarChart';

const DATA = [
  { label: 'CPU', value: 72 },
  { label: 'Memory', value: 58 },
  { label: 'Disk', value: 41 },
];

// Recharts' ResponsiveContainer measures itself via getBoundingClientRect, which
// jsdom always reports as 0x0 — so the chart never renders any real SVG geometry
// (and custom label renderers like ArcLabel never run) unless we fake a real size.
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

describe('RadialBarChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<RadialBarChart data={DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<RadialBarChart data={DATA} height={300} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '300px' });
    });

    it('uses 400px as default height', () => {
      const { container } = render(<RadialBarChart data={DATA} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '400px' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<RadialBarChart data={DATA} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates an aria-label that includes each item's label and value", () => {
      const { container } = render(<RadialBarChart data={DATA} />);
      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('CPU'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('72'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Memory'));
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <RadialBarChart data={DATA} aria-label="System resource usage" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'System resource usage',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<RadialBarChart data={DATA} className="radial-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('radial-cls');
    });
  });

  describe('props', () => {
    it('renders without crashing with showLabels and showLegend', () => {
      const { container } = render(<RadialBarChart data={DATA} showLabels showLegend />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with custom innerRadius', () => {
      const { container } = render(<RadialBarChart data={DATA} innerRadius="40%" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with per-item custom colors', () => {
      const { container } = render(
        <RadialBarChart
          data={[
            { label: 'A', value: 80, color: '#3584e4' },
            { label: 'B', value: 50, color: '#2ec27e' },
          ]}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders a radial bar sector per data item', () => {
      const { container } = render(<RadialBarChart data={DATA} />);

      expect(container.querySelectorAll('.recharts-radial-bar-sector')).toHaveLength(DATA.length);
    });

    it('renders arc labels with each item name when showLabels is true', () => {
      const { container } = render(<RadialBarChart data={DATA} showLabels />);
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts).toEqual(expect.arrayContaining(['CPU', 'Memory', 'Disk']));
    });

    it('does not render arc labels when showLabels is false', () => {
      const { container } = render(<RadialBarChart data={DATA} />);

      expect(container.querySelectorAll('text')).toHaveLength(0);
    });
  });
});
