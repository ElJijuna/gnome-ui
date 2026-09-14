import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { RadarChart } from './RadarChart';

const DATA = [
  { stat: 'Speed', car1: 80, car2: 60 },
  { stat: 'Power', car1: 90, car2: 95 },
  { stat: 'Handling', car1: 70, car2: 85 },
  { stat: 'Comfort', car1: 60, car2: 75 },
  { stat: 'Efficiency', car1: 50, car2: 65 },
];
const SERIES = [{ dataKey: 'car1', name: 'Car 1' }];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('RadarChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<RadarChart data={DATA} series={SERIES} angleKey="stat" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series and legend', async () => {
      await render(
        withProvider(
          <RadarChart
            data={DATA}
            series={[
              { dataKey: 'car1', name: 'Car 1' },
              { dataKey: 'car2', name: 'Car 2' },
            ]}
            angleKey="stat"
            showLegend
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing when filled', async () => {
      await render(withProvider(<RadarChart data={DATA} series={SERIES} angleKey="stat" filled />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with fewer than 3 axes', async () => {
      await render(
        withProvider(<RadarChart data={DATA.slice(0, 2)} series={SERIES} angleKey="stat" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per series when showLegend is true', async () => {
      await render(
        withProvider(
          <RadarChart
            data={DATA}
            series={[
              { dataKey: 'car1', name: 'Car 1' },
              { dataKey: 'car2', name: 'Car 2' },
            ]}
            angleKey="stat"
            showLegend
          />,
        ),
      );

      expect(screen.getByText('Car 1', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Car 2', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<RadarChart data={DATA} series={SERIES} angleKey="stat" />));

      expect(screen.queryByText('Car 1')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<RadarChart data={DATA} series={SERIES} angleKey="stat" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each series name', async () => {
      await render(
        withProvider(
          <RadarChart
            data={DATA}
            series={[
              { dataKey: 'car1', name: 'Car 1' },
              { dataKey: 'car2', name: 'Car 2' },
            ]}
            angleKey="stat"
          />,
        ),
      );

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Car 1');
      expect(el.props.accessibilityLabel).toContain('Car 2');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(
        withProvider(
          <RadarChart data={DATA} series={SERIES} angleKey="stat" aria-label="Car comparison" />,
        ),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Car comparison');
    });
  });
});
