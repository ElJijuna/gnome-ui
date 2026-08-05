import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { GaugeChart } from './GaugeChart';

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
        width: 400,
        height: 220,
        top: 0,
        left: 0,
        right: 400,
        bottom: 220,
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

describe('GaugeChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<GaugeChart value={72} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 220px as default height', () => {
      const { container } = render(<GaugeChart value={72} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '220px' });
    });

    it('applies a custom height to the wrapper', () => {
      const { container } = render(<GaugeChart value={72} height={300} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '300px' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<GaugeChart value={72} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label that includes the formatted value', () => {
      const { container } = render(<GaugeChart value={72} />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        expect.stringContaining('72'),
      );
    });

    it('includes the label in the generated aria-label when provided', () => {
      const { container } = render(<GaugeChart value={72} label="CPU" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        expect.stringContaining('CPU'),
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(<GaugeChart value={72} aria-label="Current CPU load" />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Current CPU load',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<GaugeChart value={72} className="gauge-cls" />);

      expect(container.querySelector("[role='img']")).toHaveClass('gauge-cls');
    });
  });

  describe('value label', () => {
    it('shows the formatted value by default', () => {
      const { getByText } = render(<GaugeChart value={72} />);

      expect(getByText('72')).toBeInTheDocument();
    });

    it('hides the value label when showValue is false', () => {
      const { queryByText } = render(<GaugeChart value={72} showValue={false} />);

      expect(queryByText('72')).not.toBeInTheDocument();
    });

    it('renders the caption label under the value', () => {
      const { getByText } = render(<GaugeChart value={72} label="CPU" />);

      expect(getByText('CPU')).toBeInTheDocument();
    });

    it('uses a custom valueFormatter', () => {
      const { getByText } = render(<GaugeChart value={72} valueFormatter={(v) => `${v}%`} />);

      expect(getByText('72%')).toBeInTheDocument();
    });

    it('shows the raw value even when it exceeds max', () => {
      const { getByText } = render(<GaugeChart value={120} max={100} />);

      expect(getByText('120')).toBeInTheDocument();
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders a radial bar sector for the value arc', () => {
      const { container } = render(<GaugeChart value={72} />);

      expect(container.querySelectorAll('.recharts-radial-bar-sector').length).toBeGreaterThan(0);
    });

    it('applies the explicit color prop to the arc', () => {
      const { container } = render(<GaugeChart value={72} color="#3584e4" />);
      const sector = container.querySelector('.recharts-radial-bar-sector');

      expect(sector).toHaveAttribute('fill', '#3584e4');
    });

    it('resolves arc color from thresholds based on the current value', () => {
      const { container } = render(
        <GaugeChart
          value={90}
          thresholds={[
            { value: 0, color: '#e01b24' },
            { value: 50, color: '#e5a50a' },
            { value: 80, color: '#2ec27e' },
          ]}
        />,
      );
      const sector = container.querySelector('.recharts-radial-bar-sector');

      expect(sector).toHaveAttribute('fill', '#2ec27e');
    });
  });
});
