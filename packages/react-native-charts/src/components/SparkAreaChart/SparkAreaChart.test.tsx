import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkAreaChart } from './SparkAreaChart';

const NUMBER_DATA = [42, 58, 35, 72, 88, 93];
const OBJECT_DATA = [
  { up: 42, down: 18 },
  { up: 58, down: 24 },
  { up: 35, down: 30 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkAreaChart', () => {
  describe('rendering', () => {
    it('renders without crashing with a plain number array', async () => {
      await render(withProvider(<SparkAreaChart data={NUMBER_DATA} aria-label="Trend" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an object array and a custom dataKey', async () => {
      await render(
        withProvider(<SparkAreaChart data={OBJECT_DATA} dataKey="up" aria-label="Up" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series', async () => {
      await render(
        withProvider(
          <SparkAreaChart
            data={OBJECT_DATA}
            series={[{ key: 'up' }, { key: 'down', color: '#e01b24' }]}
            aria-label="Up vs down"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with gradient disabled', async () => {
      await render(
        withProvider(<SparkAreaChart data={NUMBER_DATA} gradient={false} aria-label="Flat fill" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty array', async () => {
      await render(withProvider(<SparkAreaChart data={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkAreaChart data={NUMBER_DATA} aria-label="CPU trend" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU trend');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkAreaChart data={NUMBER_DATA} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
