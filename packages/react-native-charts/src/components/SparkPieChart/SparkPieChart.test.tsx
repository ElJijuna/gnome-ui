import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkPieChart } from './SparkPieChart';

const DATA = [{ value: 40 }, { value: 30 }, { value: 20 }, { value: 10 }];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkPieChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<SparkPieChart data={DATA} aria-label="Breakdown" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing as a donut', async () => {
      await render(withProvider(<SparkPieChart data={DATA} donut aria-label="Breakdown" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single slice', async () => {
      await render(withProvider(<SparkPieChart data={[{ value: 1 }]} aria-label="Single" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with paddingAngle set to 0', async () => {
      await render(
        withProvider(<SparkPieChart data={DATA} paddingAngle={0} aria-label="No gap" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with explicit slice colors', async () => {
      await render(
        withProvider(
          <SparkPieChart
            data={[
              { value: 60, color: '#e01b24' },
              { value: 40, color: '#2ec27e' },
            ]}
            aria-label="Colored"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom size', async () => {
      await render(withProvider(<SparkPieChart data={DATA} size={24} aria-label="Small" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkPieChart data={DATA} aria-label="Revenue breakdown" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Revenue breakdown');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkPieChart data={DATA} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
