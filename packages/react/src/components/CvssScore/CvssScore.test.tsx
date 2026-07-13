import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CvssScore } from './CvssScore';
import { clampCvssScore, formatCvssScore, getCvssSeverity } from './cvss';

describe('CvssScore', () => {
  it.each([
    [0, 'none'],
    [0.1, 'low'],
    [3.9, 'low'],
    [4, 'medium'],
    [6.9, 'medium'],
    [7, 'high'],
    [8.9, 'high'],
    [9, 'critical'],
    [10, 'critical'],
  ] as const)('maps %s to %s severity', (score, severity) => {
    expect(getCvssSeverity(score)).toBe(severity);
  });

  it('clamps scores to the CVSS range', () => {
    expect(clampCvssScore(-1)).toBe(0);
    expect(clampCvssScore(11)).toBe(10);
  });

  it('formats scores with one decimal place', () => {
    expect(formatCvssScore(7)).toBe('7.0');
    expect(formatCvssScore(7.56)).toBe('7.6');
  });

  it('renders score and derived severity', () => {
    render(<CvssScore score={9.8} />);

    expect(screen.getByText('9.8')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByLabelText('CVSS score 9.8, critical severity')).toBeInTheDocument();
  });

  it('allows scanner severity overrides including minimal', () => {
    const { container } = render(<CvssScore score={0} severity="minimal" />);

    expect(container.firstChild).toHaveAttribute('data-severity', 'minimal');
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('can hide the severity badge', () => {
    render(<CvssScore score={5} showSeverity={false} />);

    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.queryByText('Medium')).not.toBeInTheDocument();
  });

  it('forwards className and aria-label', () => {
    render(<CvssScore score={7.1} className="custom" aria-label="Base score" />);

    expect(screen.getByLabelText('Base score')).toHaveClass('custom');
  });
});
