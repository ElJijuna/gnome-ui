import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkLineChart } from './SparkLineChart';

const NUMBERS = [42, 58, 35, 72, 61];
const OBJECTS = NUMBERS.map((v, i) => ({ day: `D${i}`, sessions: v }));
const MULTI_DATA = [
  { sent: 42, received: 18 },
  { sent: 58, received: 30 },
  { sent: 35, received: 22 },
];

describe('SparkLineChart', () => {
  describe('rendering', () => {
    it('renders without crashing with number array', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with object array and dataKey', () => {
      const { container } = render(<SparkLineChart data={OBJECTS} dataKey="sessions" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with empty data', () => {
      const { container } = render(<SparkLineChart data={[]} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom height to wrapper', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} height={32} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '32px' });
    });

    it('uses 40px as default height', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} />);

      expect(container.querySelector('div')).toHaveStyle({ height: '40px' });
    });
  });

  describe('accessibility', () => {
    it('sets role=img and aria-label when aria-label is provided', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} aria-label="Sessions trend" />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('role', 'img');
      expect(wrapper).toHaveAttribute('aria-label', 'Sessions trend');
    });

    it('sets aria-hidden when no aria-label is provided', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} className="my-spark" />);

      expect(container.querySelector('div')).toHaveClass('my-spark');
    });
  });

  describe('series', () => {
    it('renders without crashing with series prop', () => {
      const { container } = render(
        <SparkLineChart data={MULTI_DATA} series={[{ key: 'sent' }, { key: 'received' }]} />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with custom colors per series', () => {
      const { container } = render(
        <SparkLineChart
          data={MULTI_DATA}
          series={[
            { key: 'sent', color: '#3584e4' },
            { key: 'received', color: '#e01b24' },
          ]}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('highlighted', () => {
    it('renders without crashing when highlighted is enabled', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} highlighted />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('container mouseenter and mouseleave do not throw', () => {
      const { container } = render(<SparkLineChart data={NUMBERS} highlighted />);
      const wrapper = container.querySelector('div')!;

      expect(() => {
        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
      }).not.toThrow();
    });

    it('multi-series with highlighted renders without crashing', () => {
      const { container } = render(
        <SparkLineChart
          data={MULTI_DATA}
          series={[{ key: 'sent' }, { key: 'received' }]}
          highlighted
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('multi-series container mouseenter and mouseleave do not throw', () => {
      const { container } = render(
        <SparkLineChart
          data={MULTI_DATA}
          series={[{ key: 'sent' }, { key: 'received' }]}
          highlighted
        />,
      );
      const wrapper = container.querySelector('div')!;

      expect(() => {
        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
      }).not.toThrow();
    });
  });
});
