import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ComposedChart } from './ComposedChart';

const DATA = [
  { month: 'Jan', revenue: 4000, target: 3800, growth: 12 },
  { month: 'Feb', revenue: 4500, target: 4000, growth: 18 },
];
const SERIES = [
  { dataKey: 'revenue', type: 'bar' as const, name: 'Revenue' },
  { dataKey: 'target', type: 'line' as const, name: 'Target' },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('ComposedChart', () => {
  describe('rendering', () => {
    it('renders without crashing with bar + line series', async () => {
      await render(withProvider(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with bar + area + line series', async () => {
      await render(
        withProvider(
          <ComposedChart
            data={DATA}
            series={[
              { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
              { dataKey: 'growth', type: 'area', name: 'Growth' },
              { dataKey: 'target', type: 'line', name: 'Target' },
            ]}
            xAxisKey="month"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with only line series', async () => {
      await render(
        withProvider(
          <ComposedChart
            data={DATA}
            series={[{ dataKey: 'target', type: 'line', name: 'Target' }]}
            xAxisKey="month"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple bar series', async () => {
      await render(
        withProvider(
          <ComposedChart
            data={DATA}
            series={[
              { dataKey: 'revenue', type: 'bar', name: 'Revenue' },
              { dataKey: 'target', type: 'bar', name: 'Target' },
            ]}
            xAxisKey="month"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per series when showLegend is true', async () => {
      await render(
        withProvider(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" showLegend />),
      );

      expect(screen.getByText('Revenue', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Target', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.queryByText('Revenue')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each series name', async () => {
      await render(withProvider(<ComposedChart data={DATA} series={SERIES} xAxisKey="month" />));

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Revenue');
      expect(el.props.accessibilityLabel).toContain('Target');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(
        withProvider(
          <ComposedChart
            data={DATA}
            series={SERIES}
            xAxisKey="month"
            aria-label="Revenue vs target"
          />,
        ),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Revenue vs target');
    });
  });
});
