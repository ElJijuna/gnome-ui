import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { GaugeChart } from './GaugeChart';

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('GaugeChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<GaugeChart value={62} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom min/max', async () => {
      await render(withProvider(<GaugeChart value={620} min={0} max={1000} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a value below min', async () => {
      await render(withProvider(<GaugeChart value={-10} min={0} max={100} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a value above max', async () => {
      await render(withProvider(<GaugeChart value={150} min={0} max={100} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an explicit color', async () => {
      await render(withProvider(<GaugeChart value={62} color="#e01b24" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with thresholds', async () => {
      await render(
        withProvider(
          <GaugeChart
            value={82}
            thresholds={[
              { value: 0, color: '#2ec27e' },
              { value: 50, color: '#f6d32d' },
              { value: 80, color: '#e01b24' },
            ]}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a label and no value', async () => {
      await render(withProvider(<GaugeChart value={62} label="CPU" showValue={false} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom valueFormatter', async () => {
      await render(
        withProvider(
          <GaugeChart
            value={0.62}
            min={0}
            max={1}
            valueFormatter={(v) => `${Math.round(v * 100)}%`}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<GaugeChart value={62} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes the label and value', async () => {
      await render(withProvider(<GaugeChart value={62} label="CPU" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toContain('CPU');
      expect(screen.getByRole('image').props.accessibilityLabel).toContain('62');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<GaugeChart value={62} aria-label="CPU usage" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('CPU usage');
    });
  });
});
