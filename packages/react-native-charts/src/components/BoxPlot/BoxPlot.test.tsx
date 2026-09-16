import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { BoxPlot } from './BoxPlot';

const VALUES_DATA = [
  { label: 'Team A', values: [12, 15, 14, 18, 22, 9, 31, 16] },
  { label: 'Team B', values: [8, 11, 10, 9, 14, 7, 12] },
];

const STATS_DATA = [
  { label: 'Team A', min: 9, q1: 13, median: 15.5, q3: 19, max: 22, outliers: [31] },
  { label: 'Team B', min: 7, q1: 8.5, median: 10, q3: 11.5, max: 14 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('BoxPlot', () => {
  describe('rendering', () => {
    it('renders without crashing with values arrays', async () => {
      await render(withProvider(<BoxPlot data={VALUES_DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with precomputed stats', async () => {
      await render(withProvider(<BoxPlot data={STATS_DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders category labels', async () => {
      await render(withProvider(<BoxPlot data={VALUES_DATA} />));

      expect(screen.getByText('Team A')).toBeOnTheScreen();
      expect(screen.getByText('Team B')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom height', async () => {
      await render(withProvider(<BoxPlot data={VALUES_DATA} height={480} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single data item', async () => {
      await render(withProvider(<BoxPlot data={[VALUES_DATA[0]!]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a tight values array (no outliers)', async () => {
      await render(
        withProvider(<BoxPlot data={[{ label: 'Tight', values: [10, 11, 10, 12, 11, 10, 11] }]} />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showOutliers disabled', async () => {
      await render(withProvider(<BoxPlot data={STATS_DATA} showOutliers={false} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an explicit per-item color', async () => {
      await render(withProvider(<BoxPlot data={[{ ...STATS_DATA[0]!, color: '#e01b24' }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom valueFormatter', async () => {
      await render(withProvider(<BoxPlot data={STATS_DATA} valueFormatter={(v) => `${v}ms`} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<BoxPlot data={VALUES_DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label including each label and median', async () => {
      await render(withProvider(<BoxPlot data={STATS_DATA} />));

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Team A');
      expect(el.props.accessibilityLabel).toContain('15.5');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<BoxPlot data={VALUES_DATA} aria-label="Response times" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Response times');
    });
  });
});
