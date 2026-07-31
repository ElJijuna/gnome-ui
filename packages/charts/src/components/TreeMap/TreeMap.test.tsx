import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TreeMap } from './TreeMap';

const DATA = [
  { label: 'React', value: 4200, group: 'Frontend' },
  { label: 'Vue', value: 2100, group: 'Frontend' },
  { label: 'Node.js', value: 3800, group: 'Backend' },
];

// Recharts' ResponsiveContainer measures itself via getBoundingClientRect, which
// jsdom always reports as 0x0 — so the chart never renders any real SVG geometry
// (and the custom Tile content renderer never runs) unless we fake a real size.
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

describe('TreeMap', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<TreeMap data={DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<TreeMap data={DATA} height={500} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '500px' });
    });

    it('uses 400px as default height', () => {
      const { container } = render(<TreeMap data={DATA} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '400px' });
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<TreeMap data={DATA} className="treemap-cls" />);

      expect(container.querySelector('div')).toHaveClass('treemap-cls');
    });
  });

  describe('props', () => {
    it('renders without crashing with showLabels disabled', () => {
      const { container } = render(<TreeMap data={DATA} showLabels={false} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with ungrouped data', () => {
      const { container } = render(
        <TreeMap
          data={[
            { label: 'A', value: 100 },
            { label: 'B', value: 200 },
          ]}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('with real layout', () => {
    withRealLayout();

    it('renders a tile per data item', () => {
      const { container } = render(<TreeMap data={DATA} />);

      // Recharts also renders one extra root tile covering the whole area,
      // in addition to one tile per leaf data item.
      expect(container.querySelectorAll('rect[aria-label]')).toHaveLength(DATA.length + 1);
    });

    it('labels each tile with its name and formatted value', () => {
      const { container } = render(<TreeMap data={DATA} />);

      expect(container.querySelector('rect[aria-label="React: 4,200"]')).toBeInTheDocument();
    });

    it('renders name and value text on tiles large enough to fit them', () => {
      const { container } = render(<TreeMap data={DATA} />);
      const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);

      expect(texts).toContain('React');
      expect(texts).toContain('4,200');
    });

    it('omits text content when showLabels is false', () => {
      const { container } = render(<TreeMap data={DATA} showLabels={false} />);

      expect(container.querySelectorAll('text')).toHaveLength(0);
    });

    it('colors tiles from the same group identically', () => {
      const { container } = render(<TreeMap data={DATA} />);
      const reactFill = container
        .querySelector('rect[aria-label^="React"]')
        ?.getAttribute('fill');
      const vueFill = container.querySelector('rect[aria-label^="Vue"]')?.getAttribute('fill');
      const nodeFill = container
        .querySelector('rect[aria-label^="Node.js"]')
        ?.getAttribute('fill');

      expect(reactFill).toBe(vueFill);
      expect(reactFill).not.toBe(nodeFill);
    });
  });
});
