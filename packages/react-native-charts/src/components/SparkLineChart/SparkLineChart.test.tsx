import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkLineChart } from './SparkLineChart';

const NUMBER_DATA = [42, 58, 35, 72, 88, 93];
const OBJECT_DATA = [
  { sent: 42, received: 18 },
  { sent: 58, received: 24 },
  { sent: 35, received: 30 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkLineChart', () => {
  describe('rendering', () => {
    it('renders without crashing with a plain number array', async () => {
      await render(withProvider(<SparkLineChart data={NUMBER_DATA} aria-label="Trend" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an object array and a custom dataKey', async () => {
      await render(
        withProvider(<SparkLineChart data={OBJECT_DATA} dataKey="sent" aria-label="Sent" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series', async () => {
      await render(
        withProvider(
          <SparkLineChart
            data={OBJECT_DATA}
            series={[{ key: 'sent' }, { key: 'received', color: '#e01b24' }]}
            aria-label="Sent vs received"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty array', async () => {
      await render(withProvider(<SparkLineChart data={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkLineChart data={NUMBER_DATA} aria-label="CPU trend" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU trend');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkLineChart data={NUMBER_DATA} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
