import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SeverityBadge } from './SeverityBadge';
import {
  VULNERABILITY_SEVERITIES,
  VULNERABILITY_SEVERITY_LABELS,
  VULNERABILITY_SEVERITY_RANK,
} from './severity';

describe('SeverityBadge', () => {
  it('renders the default label for every severity', () => {
    VULNERABILITY_SEVERITIES.forEach((severity) => {
      render(<SeverityBadge severity={severity} />);
      expect(screen.getByText(VULNERABILITY_SEVERITY_LABELS[severity])).toBeInTheDocument();
    });
  });

  it('orders minimal between none and low', () => {
    expect(VULNERABILITY_SEVERITY_RANK.minimal).toBeGreaterThan(VULNERABILITY_SEVERITY_RANK.none);
    expect(VULNERABILITY_SEVERITY_RANK.minimal).toBeLessThan(VULNERABILITY_SEVERITY_RANK.low);
  });

  it('applies severity as a class and data attribute', () => {
    const { container } = render(<SeverityBadge severity="minimal" />);

    expect((container.firstChild as HTMLElement).className).toMatch(/minimal/);
    expect(container.firstChild).toHaveAttribute('data-severity', 'minimal');
  });

  it('allows overriding the visible label', () => {
    render(<SeverityBadge severity="critical" label="P0" />);

    expect(screen.getByText('P0')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity: P0')).toBeInTheDocument();
  });

  it('forwards className and HTML attributes', () => {
    render(
      <SeverityBadge
        severity="high"
        className="custom"
        data-testid="severity"
        aria-label="Exploit-ready severity"
      />,
    );

    expect(screen.getByTestId('severity')).toHaveClass('custom');
    expect(screen.getByLabelText('Exploit-ready severity')).toBeInTheDocument();
  });
});
