import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { TreeMap } from './TreeMap';

const DATA = [
  { label: 'Chrome', value: 6500, group: 'Desktop' },
  { label: 'Safari', value: 2100, group: 'Desktop' },
  { label: 'Firefox', value: 900, group: 'Desktop' },
  { label: 'Chrome Mobile', value: 4800, group: 'Mobile' },
  { label: 'Safari Mobile', value: 3200, group: 'Mobile' },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('TreeMap', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<TreeMap data={DATA} aria-label="Browser usage" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with labels disabled', async () => {
      await render(withProvider(<TreeMap data={DATA} showLabels={false} aria-label="No labels" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single item', async () => {
      await render(
        withProvider(<TreeMap data={[{ label: 'All', value: 1 }]} aria-label="Single tile" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty array', async () => {
      await render(withProvider(<TreeMap data={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with ungrouped items', async () => {
      await render(
        withProvider(
          <TreeMap
            data={[
              { label: 'A', value: 100 },
              { label: 'B', value: 50 },
            ]}
            aria-label="Ungrouped"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<TreeMap data={DATA} aria-label="Browser usage" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<TreeMap data={DATA} aria-label="Browser usage" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Browser usage');
    });

    it('falls back to a default accessibility label when none is provided', async () => {
      await render(withProvider(<TreeMap data={DATA} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Treemap');
    });
  });
});
