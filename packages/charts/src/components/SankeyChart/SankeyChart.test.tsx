import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { SankeyChart } from './SankeyChart';

const NODES = [{ name: 'Visitors' }, { name: 'Signups' }, { name: 'Customers' }, { name: 'Churn' }];
const LINKS = [
  { source: 'Visitors', target: 'Signups', value: 100 },
  { source: 'Signups', target: 'Customers', value: 60 },
  { source: 'Signups', target: 'Churn', value: 40 },
];

// Recharts' ResponsiveContainer measures itself via getBoundingClientRect, which
// jsdom always reports as 0x0 — so Sankey never lays out any real nodes/links
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
        height: 400,
        top: 0,
        left: 0,
        right: 600,
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

describe('SankeyChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 400px as default height', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '400px' });
    });

    it('applies a custom height to the wrapper', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} height={300} />);

      expect(container.querySelector("[role='img']")).toHaveStyle({ height: '300px' });
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates a default aria-label with node and link counts', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Sankey chart with 4 nodes and 3 flows',
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <SankeyChart nodes={NODES} links={LINKS} aria-label="Signup funnel" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Signup funnel',
      );
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(
        <SankeyChart nodes={NODES} links={LINKS} className="sankey-cls" />,
      );

      expect(container.querySelector("[role='img']")).toHaveClass('sankey-cls');
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders a rect per node', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.querySelectorAll('.recharts-sankey-nodes rect')).toHaveLength(NODES.length);
    });

    it('renders a path per link', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);

      expect(container.querySelectorAll('.recharts-sankey-links path')).toHaveLength(LINKS.length);
    });

    it('labels each node with its name', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} />);
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts).toEqual(expect.arrayContaining(['Visitors', 'Signups', 'Customers', 'Churn']));
    });

    it('appends the formatted value to labels when showValues is true', () => {
      const { container } = render(<SankeyChart nodes={NODES} links={LINKS} showValues />);
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts.some((t) => t?.startsWith('Visitors ('))).toBe(true);
    });

    it('applies per-node custom colors', () => {
      const { container } = render(
        <SankeyChart
          nodes={[{ name: 'A', color: '#e01b24' }, { name: 'B' }]}
          links={[{ source: 'A', target: 'B', value: 10 }]}
        />,
      );
      const rects = container.querySelectorAll('.recharts-sankey-nodes rect');

      expect(rects[0]).toHaveAttribute('fill', '#e01b24');
    });
  });
});
