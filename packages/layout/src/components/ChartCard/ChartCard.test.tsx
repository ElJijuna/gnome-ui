import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartCard } from './ChartCard';

describe('ChartCard', () => {
  it('renders title, subtitle, metric, and chart children', () => {
    render(
      <ChartCard title="Sessions" subtitle="Last 30 days" value={12840}>
        <svg aria-label="Sessions chart" />
      </ChartCard>,
    );

    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('12,840')).toBeInTheDocument();
    expect(screen.getByLabelText('Sessions chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Sessions: 12,840')).toBeInTheDocument();
  });

  it('renders string values, units, and trend', () => {
    render(
      <ChartCard
        title="Uptime"
        value="99.9"
        unit="%"
        trend={{ direction: 'up', value: 2.5, period: 'vs last week' }}
      />,
    );

    expect(screen.getByText('99.9')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('+2.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
    expect(screen.getByLabelText('Uptime: 99.9 %')).toBeInTheDocument();
  });

  it('renders actions and footer slots', () => {
    render(
      <ChartCard
        title="Revenue"
        actions={<button type="button">Export</button>}
        footer={<span>Updated now</span>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByText('Updated now')).toBeInTheDocument();
  });

  it('renders error before empty state', () => {
    render(<ChartCard title="Errors" error="Could not load data" empty="No data" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load data');
    expect(screen.queryByText('No data')).toBeNull();
  });

  it('renders empty state when provided without error', () => {
    render(<ChartCard title="Events" empty="No events yet" />);

    expect(screen.getByText('No events yet')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders skeleton and aria-busy when loading=true', () => {
    const { container } = render(<ChartCard title="Sessions" loading data-testid="card" />);

    expect(screen.getByTestId('card')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Sessions')).toBeNull();
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(0);
  });

  it('renders spinner when loadingType=spinner', () => {
    render(<ChartCard title="Sessions" loading loadingType="spinner" data-testid="card" />);

    expect(screen.getByTestId('card')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('forwards className, style, and data attributes to the root', () => {
    render(
      <ChartCard
        title="Revenue"
        className="custom-chart-card"
        style={{ width: 360 }}
        data-testid="card"
      />,
    );

    const root = screen.getByTestId('card');

    expect(root).toHaveClass('custom-chart-card');
    expect(root).toHaveStyle({ width: '360px' });
  });
});
