import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ScatterChart } from './ScatterChart';

const SERIES_A = [
  { x: 10, y: 30 },
  { x: 20, y: 50 },
  { x: 30, y: 20 },
];
const SERIES_B = [
  { x: 15, y: 60 },
  { x: 25, y: 40 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('ScatterChart', () => {
  describe('rendering', () => {
    it('renders without crashing with a single series', async () => {
      await render(withProvider(<ScatterChart series={[{ data: SERIES_A }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series and legend', async () => {
      await render(
        withProvider(
          <ScatterChart
            series={[
              { data: SERIES_A, name: 'A' },
              { data: SERIES_B, name: 'B' },
            ]}
            showLegend
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom xKey/yKey per series', async () => {
      await render(
        withProvider(
          <ScatterChart
            series={[{ data: [{ price: 10, sales: 30 }], xKey: 'price', yKey: 'sales' }]}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with bubble sizing via zKey', async () => {
      await render(
        withProvider(
          <ScatterChart
            series={[
              {
                data: [
                  { x: 10, y: 30, z: 100 },
                  { x: 20, y: 50, z: 500 },
                ],
                zKey: 'z',
              },
            ]}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty series list', async () => {
      await render(withProvider(<ScatterChart series={[]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per series when showLegend is true', async () => {
      await render(
        withProvider(
          <ScatterChart
            series={[
              { data: SERIES_A, name: 'A' },
              { data: SERIES_B, name: 'B' },
            ]}
            showLegend
          />,
        ),
      );

      expect(screen.getByText('A', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('B', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<ScatterChart series={[{ data: SERIES_A, name: 'A' }]} />));

      expect(screen.queryByText('A')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<ScatterChart series={[{ data: SERIES_A }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('uses the custom aria-label when provided', async () => {
      await render(
        withProvider(<ScatterChart series={[{ data: SERIES_A }]} aria-label="Price vs sales" />),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Price vs sales');
    });
  });
});
