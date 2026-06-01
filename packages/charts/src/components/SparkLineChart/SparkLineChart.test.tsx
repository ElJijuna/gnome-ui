import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkLineChart } from './SparkLineChart';

const NUMBERS = [42, 58, 35, 72, 61];
const OBJECTS = NUMBERS.map((v, i) => ({ day: `D${i}`, sessions: v }));

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
});
