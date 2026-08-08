import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart } from './BarChart';

const DATA = [
  { month: 'Jan', sales: 100, returns: 20 },
  { month: 'Feb', sales: 150, returns: 30 },
];
const SERIES = [{ dataKey: 'sales', name: 'Sales' }];

describe('BarChart', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} xAxisKey="month" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies height to the wrapper div', () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} height={500} />);
      const div = container.querySelector('div');

      expect(div).toHaveStyle({ height: '500px' });
    });

    it('uses 300px as default height', () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} />);
      const div = container.querySelector('div');

      expect(div).toHaveStyle({ height: '300px' });
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the wrapper div', () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} className="custom-bar" />);

      expect(container.querySelector('div')).toHaveClass('custom-bar');
    });
  });

  describe('multi-series', () => {
    it('renders without crashing with multiple series', () => {
      const { container } = render(
        <BarChart
          data={DATA}
          series={[
            { dataKey: 'sales', name: 'Sales' },
            { dataKey: 'returns', name: 'Returns' },
          ]}
          xAxisKey="month"
          showLegend
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role=img on the wrapper', () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} />);

      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it('generates an aria-label that includes each series name', () => {
      const { container } = render(
        <BarChart
          data={DATA}
          series={[
            { dataKey: 'sales', name: 'Sales' },
            { dataKey: 'returns', name: 'Returns' },
          ]}
        />,
      );

      const el = container.querySelector("[role='img']");

      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Sales'));
      expect(el).toHaveAttribute('aria-label', expect.stringContaining('Returns'));
    });

    it('falls back to dataKey in aria-label when name is omitted', () => {
      const { container } = render(<BarChart data={DATA} series={[{ dataKey: 'sales' }]} />);

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        expect.stringContaining('sales'),
      );
    });

    it('uses the custom aria-label when provided', () => {
      const { container } = render(
        <BarChart data={DATA} series={SERIES} aria-label="Monthly sales" />,
      );

      expect(container.querySelector("[role='img']")).toHaveAttribute(
        'aria-label',
        'Monthly sales',
      );
    });
  });
});
