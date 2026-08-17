import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SparkPieChart } from './SparkPieChart';

const DATA = [{ value: 62 }, { value: 18 }, { value: 11 }];

describe('SparkPieChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SparkPieChart data={DATA} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with a single item', () => {
      const { container } = render(<SparkPieChart data={[{ value: 100 }]} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders without crashing with empty data', () => {
      const { container } = render(<SparkPieChart data={[]} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses 40px as the default size', () => {
      const { container } = render(<SparkPieChart data={DATA} />);

      expect(container.querySelector('div')).toHaveStyle({ width: '40px', height: '40px' });
    });

    it('applies a custom size', () => {
      const { container } = render(<SparkPieChart data={DATA} size={64} />);

      expect(container.querySelector('div')).toHaveStyle({ width: '64px', height: '64px' });
    });

    it('renders without crashing in donut mode', () => {
      const { container } = render(<SparkPieChart data={DATA} donut />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('sets role=img and aria-label when aria-label is provided', () => {
      const { container } = render(<SparkPieChart data={DATA} aria-label="Storage by type" />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('role', 'img');
      expect(wrapper).toHaveAttribute('aria-label', 'Storage by type');
    });

    it('sets aria-hidden when no aria-label is provided', () => {
      const { container } = render(<SparkPieChart data={DATA} />);
      const wrapper = container.querySelector('div');

      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<SparkPieChart data={DATA} className="my-spark-pie" />);

      expect(container.querySelector('div')).toHaveClass('my-spark-pie');
    });
  });
});
