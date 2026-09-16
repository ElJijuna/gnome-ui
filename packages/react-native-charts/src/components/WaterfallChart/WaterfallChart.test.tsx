import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { WaterfallChart } from './WaterfallChart';

const DATA = [
  { label: 'Starting revenue', value: 42000, isTotal: true },
  { label: 'New sales', value: 12000 },
  { label: 'Churn', value: -6000 },
  { label: 'Ending revenue', value: 48000, isTotal: true },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('WaterfallChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<WaterfallChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showValues', async () => {
      await render(withProvider(<WaterfallChart data={DATA} showValues />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showGrid disabled', async () => {
      await render(withProvider(<WaterfallChart data={DATA} showGrid={false} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom colors', async () => {
      await render(
        withProvider(
          <WaterfallChart
            data={DATA}
            increaseColor="#3584e4"
            decreaseColor="#ff7800"
            totalColor="#9141ac"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a custom valueFormatter', async () => {
      await render(
        withProvider(
          <WaterfallChart
            data={DATA}
            showValues
            valueFormatter={(v) => `$${v.toLocaleString()}`}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with no isTotal bars at all', async () => {
      await render(
        withProvider(
          <WaterfallChart
            data={[
              { label: 'A', value: 10 },
              { label: 'B', value: -4 },
            ]}
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single bar', async () => {
      await render(withProvider(<WaterfallChart data={[{ label: 'Only', value: 5 }]} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<WaterfallChart data={DATA} />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each label and value', async () => {
      await render(withProvider(<WaterfallChart data={DATA} />));

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Starting revenue');
      expect(el.props.accessibilityLabel).toContain('Churn');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<WaterfallChart data={DATA} aria-label="Revenue bridge" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Revenue bridge');
    });
  });
});
