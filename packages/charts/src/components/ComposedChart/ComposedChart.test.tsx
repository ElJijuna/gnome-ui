import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ComposedChart } from './ComposedChart';

const DATA = [
  { month: 'Jan', revenue: 4200, expenses: 2400 },
  { month: 'Feb', revenue: 3800, expenses: 2200 },
];

const SERIES = [
  { dataKey: 'revenue', type: 'bar' as const, name: 'Revenue' },
  { dataKey: 'expenses', type: 'line' as const, name: 'Expenses' },
];

describe('ComposedChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" />);

      expect(container.firstChild).not.toBeNull();
    });

    it('applies custom height', () => {
      const { container } = render(
        <ComposedChart data={DATA} series={SERIES} xAxisKey="month" height={400} />,
      );
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('400px');
    });

    it('uses default height of 300', () => {
      const { container } = render(<ComposedChart data={DATA} series={SERIES} />);
      const wrapper = container.firstChild as HTMLElement;

      expect(wrapper.style.height).toBe('300px');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <ComposedChart data={DATA} series={SERIES} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('series types', () => {
    it('renders bar, line and area series', () => {
      const { container } = render(
        <ComposedChart
          data={[{ month: 'Jan', a: 1, b: 2, c: 3 }]}
          xAxisKey="month"
          series={[
            { dataKey: 'a', type: 'bar' },
            { dataKey: 'b', type: 'line' },
            { dataKey: 'c', type: 'area' },
          ]}
        />,
      );

      expect(container.firstChild).not.toBeNull();
    });
  });
});
