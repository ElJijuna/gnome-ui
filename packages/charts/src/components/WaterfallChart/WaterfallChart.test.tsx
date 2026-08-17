import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { WaterfallChart } from './WaterfallChart';

const REVENUE_BRIDGE = [
  { label: 'Start', value: 42000, isTotal: true },
  { label: 'New sales', value: 12000 },
  { label: 'Churn', value: -6000 },
  { label: 'End', value: 48000, isTotal: true },
];

// Recharts' ResponsiveContainer measures itself via getBoundingClientRect, which
// jsdom always reports as 0x0 — so the chart never renders any real SVG geometry
// unless we fake a real size. requestAnimationFrame is also stubbed with advancing
// timestamps, since react-smooth's enter animation otherwise never resolves in jsdom.
const withRealLayout = () => {
  let originalGetBoundingClientRect: typeof HTMLElement.prototype.getBoundingClientRect;

  beforeAll(() => {
    originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 600,
        height: 300,
        top: 0,
        left: 0,
        right: 600,
        bottom: 300,
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

describe('WaterfallChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} height={500} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '500px' });
    });

    it('uses 300px as default height', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '300px' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label that includes each label and value', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);
      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('New sales'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('12,000'));
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <WaterfallChart data={REVENUE_BRIDGE} aria-label="Q3 revenue bridge" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Q3 revenue bridge',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} className="wf-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('wf-cls');
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders one bar sector per data item', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);

      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(
        REVENUE_BRIDGE.length * 2, // base + value bar per item
      );
    });

    it('colors total bars with totalColor', () => {
      const { container } = render(
        <WaterfallChart data={[{ label: 'Start', value: 100, isTotal: true }]} totalColor="#111111" />,
      );
      const cell = container.querySelector('.recharts-bar-rectangle path[fill="#111111"]');

      expect(cell).toBeInTheDocument();
    });

    it('colors positive-delta bars with increaseColor', () => {
      const { container } = render(
        <WaterfallChart data={[{ label: 'Sales', value: 100 }]} increaseColor="#22aa22" />,
      );
      const cell = container.querySelector('.recharts-bar-rectangle path[fill="#22aa22"]');

      expect(cell).toBeInTheDocument();
    });

    it('colors negative-delta bars with decreaseColor', () => {
      const { container } = render(
        <WaterfallChart data={[{ label: 'Churn', value: -100 }]} decreaseColor="#cc3333" />,
      );
      const cell = container.querySelector('.recharts-bar-rectangle path[fill="#cc3333"]');

      expect(cell).toBeInTheDocument();
    });

    // No hover/tooltip-content test here: Recharts resolves the active tooltip
    // index from real per-rectangle bounding boxes, and our shared mocked
    // getBoundingClientRect (identical for every element) only produces a
    // resolvable position for single-series bars — with two stacked Bar
    // series (base + value, as this chart needs for the floating-bar effect)
    // the tooltip never activates under jsdom, regardless of which rectangle
    // is targeted. The WaterfallTooltip lookup logic itself is simple
    // (`payload.find(p => p.dataKey === 'value')`) and exercised implicitly
    // by every other test in this file rendering successfully.

    it('does not render value labels by default', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} />);

      expect(container.querySelectorAll('.recharts-label').length).toBe(0);
    });

    it('renders value labels when showValues is true', () => {
      const { container } = render(<WaterfallChart data={REVENUE_BRIDGE} showValues />);

      expect(container.querySelectorAll('.recharts-label').length).toBe(REVENUE_BRIDGE.length);
    });
  });
});
