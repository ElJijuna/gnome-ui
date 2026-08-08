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

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<ComposedChart data={DATA} series={SERIES} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label that includes each series name', () => {
      const { container } = render(<ComposedChart data={DATA} series={SERIES} />);
      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Revenue'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Expenses'));
    });

    it('falls back to dataKey in aria-label when name is omitted', () => {
      const { container } = render(
        <ComposedChart data={DATA} series={[{ dataKey: 'revenue', type: 'bar' }]} />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        expect.stringContaining('revenue'),
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <ComposedChart data={DATA} series={SERIES} aria-label="Revenue vs expenses" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Revenue vs expenses',
      );
    });
  });
});
