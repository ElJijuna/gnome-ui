import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { RadialBarChart } from './RadialBarChart';

const DATA = [
  { label: 'CPU', value: 62 },
  { label: 'Memory', value: 80 },
  { label: 'Disk', value: 35 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('RadialBarChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<RadialBarChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with labels', async () => {
      await render(withProvider(<RadialBarChart data={DATA} showLabels />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom inner radius', async () => {
      await render(withProvider(<RadialBarChart data={DATA} innerRadius="10%" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single item', async () => {
      await render(withProvider(<RadialBarChart data={[{ label: 'CPU', value: 62 }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per item when showLegend is true', async () => {
      await render(withProvider(<RadialBarChart data={DATA} showLegend />));

      expect(screen.getByText('CPU', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Memory', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<RadialBarChart data={DATA} />));

      expect(screen.queryByText('CPU')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<RadialBarChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each item label', async () => {
      await render(withProvider(<RadialBarChart data={DATA} />));

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('CPU');
      expect(el.props.accessibilityLabel).toContain('Memory');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<RadialBarChart data={DATA} aria-label="Resource usage" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Resource usage');
    });
  });
});
