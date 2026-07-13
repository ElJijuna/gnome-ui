import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CweIdentifier } from './CweIdentifier';
import { getCweNumber, getCweUrl, isCweId, normalizeCweId } from './cwe';

describe('CweIdentifier', () => {
  it('normalizes numeric and prefixed CWE identifiers', () => {
    expect(normalizeCweId('79')).toBe('CWE-79');
    expect(normalizeCweId(' cwe-89 ')).toBe('CWE-89');
  });

  it('validates CWE identifiers', () => {
    expect(isCweId('CWE-79')).toBe(true);
    expect(isCweId('79')).toBe(true);
    expect(isCweId('CWE-ABC')).toBe(false);
  });

  it('extracts CWE numbers and builds MITRE URLs', () => {
    expect(getCweNumber('CWE-352')).toBe(352);
    expect(getCweUrl('CWE-352')).toBe('https://cwe.mitre.org/data/definitions/352.html');
  });

  it('renders as a MITRE CWE link by default', () => {
    render(<CweIdentifier cweId="CWE-79" />);

    const link = screen.getByRole('link', { name: 'CWE-79 weakness identifier' });

    expect(link).toHaveAttribute('href', 'https://cwe.mitre.org/data/definitions/79.html');
    expect(link).toHaveAttribute('data-valid', 'true');
  });

  it('can render as static text', () => {
    render(<CweIdentifier cweId="89" link={false} />);

    expect(screen.getByText('CWE-89')).toHaveAttribute('data-valid', 'true');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('marks invalid identifiers', () => {
    render(<CweIdentifier cweId="SQL injection" link={false} />);

    expect(screen.getByText('SQL INJECTION')).toHaveAttribute('data-valid', 'false');
  });

  it('forwards link props safely', () => {
    render(<CweIdentifier cweId="CWE-22" target="_blank" />);

    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
