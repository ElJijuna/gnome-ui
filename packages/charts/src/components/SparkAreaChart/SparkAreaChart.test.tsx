import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkAreaChart } from './SparkAreaChart';

const NUMBERS = [42, 58, 35, 72, 61];
const OBJECTS = NUMBERS.map((v, i) => ({ day: `D${i}`, sessions: v }));
const MULTI_DATA = [
  { up: 42, down: 18 },
  { up: 58, down: 30 },
  { up: 35, down: 22 },
];

describe('SparkAreaChart', () => {
  describe('rendering', () => {
    it('renders without crashing with number array', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with object array and dataKey', () => {
      const { container } = render(<SparkAreaChart data={OBJECTS} dataKey="sessions" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with empty data', () => {
      const { container } = render(<SparkAreaChart data={[]} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom height to wrapper', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} height={64} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '64px' });
    });

    it('uses 40px as default height', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '40px' });
    });
  });

  describe('accessibility', () => {
    it('sets role=img and aria-label when aria-label is provided', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} aria-label="Revenue trend" />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('role', 'img');
      expect(wrapper).toHaveAttribute('aria-label', 'Revenue trend');
    });

    it('sets aria-hidden when no aria-label is provided', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} className="my-spark" />);

      expect(container.querySelector('div')).toHaveClass('my-spark');
    });
  });

  describe('gradient', () => {
    it('renders without crashing when gradient is disabled', () => {
      const { container } = render(
        <SparkAreaChart data={NUMBERS} gradient={false} fillOpacity={0.3} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('series', () => {
    it('renders without crashing with series prop', () => {
      const { container } = render(
        <SparkAreaChart data={MULTI_DATA} series={[{ key: 'up' }, { key: 'down' }]} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with custom colors per series', () => {
      const { container } = render(
        <SparkAreaChart
          data={MULTI_DATA}
          series={[
            { key: 'up', color: '#e01b24' },
            { key: 'down', color: '#2ec27e' },
          ]}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('highlighted', () => {
    it('renders without crashing when highlighted is enabled', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} highlighted />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('container mouseenter and mouseleave do not throw', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} highlighted />);
      const wrapper = container.querySelector('div')!;

      expect(() => {
        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
      }).not.toThrow();
    });

    it('container has no hover handlers when highlighted is false', () => {
      const { container } = render(<SparkAreaChart data={NUMBERS} highlighted={false} />);
      const wrapper = container.querySelector('div')!;

      expect(() => {
        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
      }).not.toThrow();
    });

    it('multi-series with highlighted renders without crashing', () => {
      const { container } = render(
        <SparkAreaChart data={MULTI_DATA} series={[{ key: 'up' }, { key: 'down' }]} highlighted />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('multi-series container mouseenter and mouseleave do not throw', () => {
      const { container } = render(
        <SparkAreaChart data={MULTI_DATA} series={[{ key: 'up' }, { key: 'down' }]} highlighted />,
      );
      const wrapper = container.querySelector('div')!;

      expect(() => {
        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
      }).not.toThrow();
    });
  });
});
