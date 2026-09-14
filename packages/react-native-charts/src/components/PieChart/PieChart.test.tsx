import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { PieChart } from './PieChart';

const DATA = [
  { label: 'Chrome', value: 62 },
  { label: 'Safari', value: 20 },
  { label: 'Firefox', value: 10 },
  { label: 'Other', value: 8 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('PieChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<PieChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing as a donut', async () => {
      await render(withProvider(<PieChart data={DATA} donut />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with slice labels', async () => {
      await render(withProvider(<PieChart data={DATA} showLabels />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single item', async () => {
      await render(withProvider(<PieChart data={[{ label: 'All', value: 1 }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per item when showLegend is true', async () => {
      await render(withProvider(<PieChart data={DATA} showLegend />));

      expect(screen.getByText('Chrome', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Safari', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<PieChart data={DATA} />));

      expect(screen.queryByText('Chrome')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<PieChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each item label', async () => {
      await render(withProvider(<PieChart data={DATA} />));

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Chrome');
      expect(el.props.accessibilityLabel).toContain('Safari');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<PieChart data={DATA} aria-label="Browser market share" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Browser market share');
    });
  });
});
