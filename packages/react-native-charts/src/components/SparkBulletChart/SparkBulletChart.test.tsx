import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkBulletChart } from './SparkBulletChart';

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkBulletChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<SparkBulletChart value={72} aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a target', async () => {
      await render(withProvider(<SparkBulletChart value={72} target={90} aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom ranges', async () => {
      await render(
        withProvider(
          <SparkBulletChart
            value={72}
            target={90}
            ranges={[{ value: 50 }, { value: 75 }, { value: 100 }]}
            aria-label="Revenue"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom color', async () => {
      await render(
        withProvider(<SparkBulletChart value={72} color="#2ec27e" aria-label="Revenue" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom height', async () => {
      await render(withProvider(<SparkBulletChart value={72} height={8} aria-label="Thin" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('clamps a value outside min/max without crashing', async () => {
      await render(
        withProvider(<SparkBulletChart value={150} min={0} max={100} aria-label="Over" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkBulletChart value={72} aria-label="Revenue" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Revenue');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkBulletChart value={72} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
