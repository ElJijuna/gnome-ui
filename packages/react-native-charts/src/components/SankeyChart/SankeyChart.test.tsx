import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { SankeyChart } from './SankeyChart';

const NODES = [
  { name: 'Organic', color: '#2ec27e' },
  { name: 'Paid', color: '#ff7800' },
  { name: 'Trial' },
  { name: 'Converted' },
  { name: 'Churned' },
];

const LINKS = [
  { source: 'Organic', target: 'Trial', value: 420 },
  { source: 'Paid', target: 'Trial', value: 260 },
  { source: 'Trial', target: 'Converted', value: 480 },
  { source: 'Trial', target: 'Churned', value: 340 },
];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('SankeyChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<SankeyChart nodes={NODES} links={LINKS} aria-label="Funnel" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with showValues', async () => {
      await render(
        withProvider(
          <SankeyChart nodes={NODES} links={LINKS} showValues aria-label="Funnel with values" />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with a single node and no links', async () => {
      await render(
        withProvider(<SankeyChart nodes={[{ name: 'Only' }]} links={[]} aria-label="Solo" />),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with an empty nodes array', async () => {
      await render(withProvider(<SankeyChart nodes={[]} links={[]} aria-label="Empty" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with custom nodeWidth/nodePadding', async () => {
      await render(
        withProvider(
          <SankeyChart
            nodes={NODES}
            links={LINKS}
            nodeWidth={24}
            nodePadding={40}
            aria-label="Wide nodes"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing when a link references an unknown node', async () => {
      await render(
        withProvider(
          <SankeyChart
            nodes={[{ name: 'A' }, { name: 'B' }]}
            links={[{ source: 'A', target: 'Missing', value: 10 }]}
            aria-label="Unknown target"
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<SankeyChart nodes={NODES} links={LINKS} aria-label="Funnel" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('uses the custom aria-label when provided', async () => {
      await render(withProvider(<SankeyChart nodes={NODES} links={LINKS} aria-label="Funnel" />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Funnel');
    });

    it('falls back to a default accessibility label when none is provided', async () => {
      await render(withProvider(<SankeyChart nodes={NODES} links={LINKS} />));

      expect(screen.getByRole('image').props.accessibilityLabel).toBe(
        'Sankey chart with 5 nodes and 4 flows',
      );
    });
  });
});
