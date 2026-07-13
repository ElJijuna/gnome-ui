import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SecurityMetric } from './SecurityMetric';

describe('SecurityMetric', () => {
  it('renders a label and value', () => {
    render(<SecurityMetric label="Critical findings" value={7} />);

    expect(screen.getByText('Critical findings')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByLabelText('Critical findings: 7')).toBeInTheDocument();
  });

  it('renders description and delta', () => {
    render(
      <SecurityMetric
        label="Open CVEs"
        value={18}
        description="Across production images"
        delta="+3 since last scan"
        trend="up"
      />,
    );

    expect(screen.getByText('Across production images')).toBeInTheDocument();
    expect(screen.getByText('+3 since last scan')).toBeInTheDocument();
  });

  it('exposes severity and trend data attributes', () => {
    const { container } = render(
      <SecurityMetric
        label="Worst severity"
        value="Critical"
        severity="critical"
        delta="-2"
        trend="down"
      />,
    );

    expect(container.firstChild).toHaveAttribute('data-severity', 'critical');
    expect(container.firstChild).toHaveAttribute('data-trend', 'down');
    expect(screen.getByLabelText('Severity: Critical')).toBeInTheDocument();
  });

  it('supports minimal severity for scanner-compatible reports', () => {
    const { container } = render(
      <SecurityMetric label="GAR severity" value="Minimal" severity="minimal" />,
    );

    expect(container.firstChild).toHaveAttribute('data-severity', 'minimal');
    expect(screen.getByLabelText('Severity: Minimal')).toBeInTheDocument();
  });

  it('forwards className and aria-label', () => {
    render(
      <SecurityMetric
        label="Average CVSS"
        value="6.4"
        className="custom"
        aria-label="Mean score"
      />,
    );

    expect(screen.getByLabelText('Mean score')).toHaveClass('custom');
  });
});
