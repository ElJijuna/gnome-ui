import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SparkGaugeChart } from './SparkGaugeChart';

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SparkGaugeChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<SparkGaugeChart value={62} aria-label="CPU" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom min/max', async () => {
      await render(
        withProvider(<SparkGaugeChart value={620} min={0} max={1000} aria-label="Requests" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a value below min', async () => {
      await render(
        withProvider(<SparkGaugeChart value={-10} min={0} max={100} aria-label="Below min" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a value above max', async () => {
      await render(
        withProvider(<SparkGaugeChart value={150} min={0} max={100} aria-label="Above max" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an explicit color', async () => {
      await render(withProvider(<SparkGaugeChart value={62} color="#e01b24" aria-label="CPU" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with thresholds', async () => {
      await render(
        withProvider(
          <SparkGaugeChart
            value={82}
            thresholds={[
              { value: 0, color: '#2ec27e' },
              { value: 50, color: '#f6d32d' },
              { value: 80, color: '#e01b24' },
            ]}
            aria-label="Disk"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom size and strokeWidth', async () => {
      await render(
        withProvider(<SparkGaugeChart value={40} size={24} strokeWidth={3} aria-label="Small" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('sets role="image" and the accessibility label when aria-label is provided', async () => {
      await render(withProvider(<SparkGaugeChart value={62} aria-label="CPU usage" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU usage');
    });

    it('hides the chart from the accessibility tree when no aria-label is provided', async () => {
      await render(withProvider(<SparkGaugeChart value={62} />));

      expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    });
  });
});
