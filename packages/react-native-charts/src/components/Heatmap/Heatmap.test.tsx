import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { Heatmap } from './Heatmap';

const DATA = [
  { row: 'Mon', column: 'Morning', value: 12 },
  { row: 'Mon', column: 'Afternoon', value: 34 },
  { row: 'Tue', column: 'Morning', value: 5 },
  { row: 'Tue', column: 'Afternoon', value: 20 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('Heatmap', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<Heatmap data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showValues', async () => {
      await render(withProvider(<Heatmap data={DATA} showValues />));

      expect(screen.getByText('12')).toBeOnTheScreen();
      expect(screen.getByText('34')).toBeOnTheScreen();
    });

    it('renders without crashing with showLegend', async () => {
      await render(withProvider(<Heatmap data={DATA} showLegend />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders row and column labels', async () => {
      await render(withProvider(<Heatmap data={DATA} />));

      expect(screen.getByText('Mon')).toBeOnTheScreen();
      expect(screen.getByText('Tue')).toBeOnTheScreen();
      expect(screen.getByText('Morning')).toBeOnTheScreen();
      expect(screen.getByText('Afternoon')).toBeOnTheScreen();
    });

    it('renders a placeholder for a missing row/column combination', async () => {
      await render(
        withProvider(
          <Heatmap
            data={[
              { row: 'Mon', column: 'Morning', value: 1 },
              { row: 'Tue', column: 'Afternoon', value: 2 },
            ]}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders with explicit rows/columns order', async () => {
      await render(
        withProvider(
          <Heatmap data={DATA} rows={['Tue', 'Mon']} columns={['Afternoon', 'Morning']} />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders with explicit min/max and a custom color', async () => {
      await render(withProvider(<Heatmap data={DATA} min={0} max={100} color="#9141ac" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom valueFormatter', async () => {
      await render(
        withProvider(<Heatmap data={DATA} showValues valueFormatter={(v) => `${v}%`} />),
      );

      expect(screen.getByText('12%')).toBeOnTheScreen();
    });

    it('renders without crashing with a single cell', async () => {
      await render(withProvider(<Heatmap data={[{ row: 'A', column: 'B', value: 1 }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<Heatmap data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label with row/column counts', async () => {
      await render(withProvider(<Heatmap data={DATA} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe(
        'Heatmap: 2 rows by 2 columns',
      );
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<Heatmap data={DATA} aria-label="Activity by day and time" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Activity by day and time');
    });
  });
});
