import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkBarChart } from './SparkBarChart';

const NUMBER_DATA = [42, 58, 35, 72, 88, 93];
const OBJECT_DATA = [{ hits: 42 }, { hits: 58 }, { hits: 35 }];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkBarChart', () => {
  describe('rendering', () => {
    it('renders without crashing with a plain number array', async () => {
      await render(withProvider(<SparkBarChart data={NUMBER_DATA} aria-label="Trend" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an object array and a custom dataKey', async () => {
      await render(
        withProvider(<SparkBarChart data={OBJECT_DATA} dataKey="hits" aria-label="Hits" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom color and barSize', async () => {
      await render(
        withProvider(
          <SparkBarChart data={NUMBER_DATA} color="#2ec27e" barSize={6} aria-label="Custom" />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty array', async () => {
      await render(withProvider(<SparkBarChart data={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkBarChart data={NUMBER_DATA} aria-label="CPU trend" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU trend');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkBarChart data={NUMBER_DATA} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
