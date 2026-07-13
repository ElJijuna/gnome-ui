import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CvssVector } from './CvssVector';
import { parseCvssVector } from './vector';

const CRITICAL_VECTOR = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H';

describe('CvssVector', () => {
  it('parses CVSS 3.1 base vector metrics', () => {
    expect(parseCvssVector(CRITICAL_VECTOR)).toEqual({
      version: '3.1',
      valid: true,
      metrics: [
        { key: 'AV', label: 'Attack Vector', value: 'N', valueLabel: 'Network', known: true },
        { key: 'AC', label: 'Attack Complexity', value: 'L', valueLabel: 'Low', known: true },
        { key: 'PR', label: 'Privileges Required', value: 'N', valueLabel: 'None', known: true },
        { key: 'UI', label: 'User Interaction', value: 'N', valueLabel: 'None', known: true },
        { key: 'S', label: 'Scope', value: 'U', valueLabel: 'Unchanged', known: true },
        { key: 'C', label: 'Confidentiality', value: 'H', valueLabel: 'High', known: true },
        { key: 'I', label: 'Integrity', value: 'H', valueLabel: 'High', known: true },
        { key: 'A', label: 'Availability', value: 'H', valueLabel: 'High', known: true },
      ],
    });
  });

  it('renders the raw vector and expanded labels', () => {
    render(<CvssVector vector={CRITICAL_VECTOR} />);

    expect(screen.getByText(CRITICAL_VECTOR)).toBeInTheDocument();
    expect(screen.getByText('Attack Vector')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Confidentiality')).toBeInTheDocument();
    expect(screen.getByLabelText('CVSS vector 3.1')).toHaveAttribute('data-valid', 'true');
  });

  it('can hide raw vector or metric details', () => {
    const { rerender } = render(<CvssVector vector={CRITICAL_VECTOR} showVector={false} />);

    expect(screen.queryByText(CRITICAL_VECTOR)).not.toBeInTheDocument();
    expect(screen.getByText('Attack Vector')).toBeInTheDocument();

    rerender(<CvssVector vector={CRITICAL_VECTOR} showMetrics={false} />);

    expect(screen.getByText(CRITICAL_VECTOR)).toBeInTheDocument();
    expect(screen.queryByText('Attack Vector')).not.toBeInTheDocument();
  });

  it('marks unsupported metric tokens as unknown', () => {
    const parsed = parseCvssVector('CVSS:3.1/AV:X');

    expect(parsed.valid).toBe(false);
    expect(parsed.metrics[0]).toMatchObject({
      key: 'AV',
      label: 'Attack Vector',
      value: 'X',
      valueLabel: 'X',
      known: false,
    });
  });

  it('forwards className and aria-label', () => {
    render(<CvssVector vector={CRITICAL_VECTOR} className="custom" aria-label="Vector details" />);

    expect(screen.getByLabelText('Vector details')).toHaveClass('custom');
  });
});
