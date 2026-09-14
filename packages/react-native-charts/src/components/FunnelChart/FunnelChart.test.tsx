import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { FunnelChart } from './FunnelChart';

const DATA = [
  { name: 'Visitors', value: 1000 },
  { name: 'Signups', value: 400 },
  { name: 'Purchases', value: 120 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('FunnelChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<FunnelChart data={DATA} aria-label="Signup funnel" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with labels disabled', async () => {
      await render(
        withProvider(<FunnelChart data={DATA} showLabels={false} aria-label="No labels" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single item', async () => {
      await render(
        withProvider(
          <FunnelChart data={[{ name: 'All', value: 1 }]} aria-label="Single segment" />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty array', async () => {
      await render(withProvider(<FunnelChart data={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom colors', async () => {
      await render(
        withProvider(
          <FunnelChart
            data={[
              { name: 'A', value: 100, color: '#e01b24' },
              { name: 'B', value: 50, color: '#2ec27e' },
            ]}
            aria-label="Custom colors"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<FunnelChart data={DATA} aria-label="Signup funnel" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<FunnelChart data={DATA} aria-label="Signup funnel" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Signup funnel');
    });

    it('falls back to a default accessibility label when none is provided', async () => {
      await render(withProvider(<FunnelChart data={DATA} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Funnel chart');
    });
  });
});
