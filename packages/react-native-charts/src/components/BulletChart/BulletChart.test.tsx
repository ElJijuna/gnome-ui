import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { BulletChart } from './BulletChart';

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('BulletChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<BulletChart value={72} aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a target', async () => {
      await render(withProvider(<BulletChart value={72} target={90} aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom ranges', async () => {
      await render(
        withProvider(
          <BulletChart
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
      await render(withProvider(<BulletChart value={72} color="#2ec27e" aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showValue disabled', async () => {
      await render(
        withProvider(<BulletChart value={72} showValue={false} aria-label="No value" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a label', async () => {
      await render(withProvider(<BulletChart value={72} label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('clamps a value outside min/max without crashing', async () => {
      await render(withProvider(<BulletChart value={150} min={0} max={100} aria-label="Over" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<BulletChart value={72} aria-label="Revenue" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<BulletChart value={72} aria-label="Revenue" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Revenue');
    });

    it('falls back to a default accessibility label built from label/value/target', async () => {
      await render(withProvider(<BulletChart value={72} target={90} label="Revenue" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe(
        'Bullet chart: Revenue 72 (target 90)',
      );
    });

    it('falls back to a default accessibility label with no label/target', async () => {
      await render(withProvider(<BulletChart value={72} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Bullet chart: 72');
    });
  });
});
