import { GnomeProvider } from '@gnome-ui/react-native';
import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { BarChart } from './BarChart';

const DATA = [
  { month: 'Jan', users: 420, sessions: 680 },
  { month: 'Feb', users: 380, sessions: 590 },
];
const SERIES = [{ dataKey: 'users', name: 'Users' }];

const withProvider = (node: ReactElement) => (
  <GnomeProvider colorScheme="light">{node}</GnomeProvider>
);

describe('BarChart', () => {
  describe('rendering', () => {
    it('renders without crashing', async () => {
      await render(withProvider(<BarChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('renders without crashing with multiple series and legend', async () => {
      await render(
        withProvider(
          <BarChart
            data={DATA}
            series={[
              { dataKey: 'users', name: 'Users' },
              { dataKey: 'sessions', name: 'Sessions' },
            ]}
            xAxisKey="month"
            showLegend
          />,
        ),
      );

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });
  });

  describe('legend', () => {
    it('renders a label per series when showLegend is true', async () => {
      await render(
        withProvider(
          <BarChart
            data={DATA}
            series={[
              { dataKey: 'users', name: 'Users' },
              { dataKey: 'sessions', name: 'Sessions' },
            ]}
            xAxisKey="month"
            showLegend
          />,
        ),
      );

      expect(screen.getByText('Users', { includeHiddenElements: true })).toBeOnTheScreen();
      expect(screen.getByText('Sessions', { includeHiddenElements: true })).toBeOnTheScreen();
    });

    it('does not render legend labels when showLegend is false', async () => {
      await render(withProvider(<BarChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.queryByText('Users')).not.toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('has role="image" on the wrapper', async () => {
      await render(withProvider(<BarChart data={DATA} series={SERIES} xAxisKey="month" />));

      expect(screen.getByRole('image')).toBeOnTheScreen();
    });

    it('generates an accessibility label that includes each series name', async () => {
      await render(
        withProvider(
          <BarChart
            data={DATA}
            series={[
              { dataKey: 'users', name: 'Users' },
              { dataKey: 'sessions', name: 'Sessions' },
            ]}
            xAxisKey="month"
          />,
        ),
      );

      const el = screen.getByRole('image');

      expect(el.props.accessibilityLabel).toContain('Users');
      expect(el.props.accessibilityLabel).toContain('Sessions');
    });

    it('falls back to dataKey in the accessibility label when name is omitted', async () => {
      await render(
        withProvider(<BarChart data={DATA} series={[{ dataKey: 'users' }]} xAxisKey="month" />),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toContain('users');
    });

    it('uses the custom aria-label when provided', async () => {
      await render(
        withProvider(
          <BarChart data={DATA} series={SERIES} xAxisKey="month" aria-label="Signups by month" />,
        ),
      );

      expect(screen.getByRole('image').props.accessibilityLabel).toBe('Signups by month');
    });
  });
});
