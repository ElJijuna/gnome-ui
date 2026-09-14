import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { AreaChart } from './AreaChart';

const DATA = [
  { day: 'Mon', cpu: 42, memory: 68 },
  { day: 'Tue', cpu: 55, memory: 72 },
];
const SERIES = [{ dataKey: 'cpu', name: 'CPU' }];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('AreaChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<AreaChart data={DATA} series={SERIES} xAxisKey="day" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series and legend', async () => {
      await render(
        withProvider(
          <AreaChart
            data={DATA}
            series={[
              { dataKey: 'cpu', name: 'CPU' },
              { dataKey: 'memory', name: 'Memory' },
            ]}
            xAxisKey="day"
            showLegend
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing when stacked', async () => {
      await render(
        withProvider(
          <AreaChart
            data={DATA}
            series={[
              { dataKey: 'cpu', name: 'CPU' },
              { dataKey: 'memory', name: 'Memory' },
            ]}
            xAxisKey="day"
            stacked
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing when stacked with gradient', async () => {
      await render(
        withProvider(
          <AreaChart
            data={DATA}
            series={[
              { dataKey: 'cpu', name: 'CPU' },
              { dataKey: 'memory', name: 'Memory' },
            ]}
            xAxisKey="day"
            stacked
            gradient
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a gradient fill (not stacked)', async () => {
      await render(withProvider(<AreaChart data={DATA} series={SERIES} xAxisKey="day" gradient />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per series when showLegend is true', async () => {
      await render(
        withProvider(
          <AreaChart
            data={DATA}
            series={[
              { dataKey: 'cpu', name: 'CPU' },
              { dataKey: 'memory', name: 'Memory' },
            ]}
            xAxisKey="day"
            showLegend
          />,
        ),
      );

      expect(screen.getByText('CPU', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Memory', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<AreaChart data={DATA} series={SERIES} xAxisKey="day" />));

      expect(screen.queryByText('CPU')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<AreaChart data={DATA} series={SERIES} xAxisKey="day" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each series name', async () => {
      await render(
        withProvider(
          <AreaChart
            data={DATA}
            series={[
              { dataKey: 'cpu', name: 'CPU' },
              { dataKey: 'memory', name: 'Memory' },
            ]}
            xAxisKey="day"
          />,
        ),
      );

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('CPU');
      expect(el.props.accessibilityLabel).toContain('Memory');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(
        withProvider(
          <AreaChart data={DATA} series={SERIES} xAxisKey="day" aria-label="CPU over time" />,
        ),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU over time');
    });
  });
});
