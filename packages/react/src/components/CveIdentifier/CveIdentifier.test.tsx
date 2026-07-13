import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CveIdentifier } from './CveIdentifier';
import { getCveUrl, getCveYear, isCveId, normalizeCveId } from './cve';

describe('CveIdentifier', () => {
  it('normalizes CVE IDs', () => {
    expect(normalizeCveId(' cve-2024-3094 ')).toBe('CVE-2024-3094');
  });

  it('validates CVE ID shape', () => {
    expect(isCveId('CVE-2024-3094')).toBe(true);
    expect(isCveId('CVE-2024-123456')).toBe(true);
    expect(isCveId('GHSA-xxxx-yyyy')).toBe(false);
  });

  it('extracts the CVE year', () => {
    expect(getCveYear('CVE-2024-3094')).toBe(2024);
    expect(getCveYear('invalid')).toBeNull();
  });

  it('builds CVE.org URLs by default', () => {
    expect(getCveUrl('CVE-2024-3094')).toBe('https://www.cve.org/CVERecord?id=CVE-2024-3094');
  });

  it('builds NVD URLs', () => {
    expect(getCveUrl('CVE-2024-3094', 'nvd')).toBe(
      'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
    );
  });

  it('renders as a CVE.org link by default', () => {
    render(<CveIdentifier cveId="cve-2024-3094" />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://www.cve.org/CVERecord?id=CVE-2024-3094',
    );
    expect(screen.getByText('CVE-2024-3094')).toBeInTheDocument();
  });

  it('can render as an NVD link', () => {
    render(<CveIdentifier cveId="CVE-2024-3094" source="nvd" />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
    );
  });

  it('can render as static text', () => {
    render(<CveIdentifier cveId="CVE-2024-3094" link={false} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('CVE-2024-3094')).toBeInTheDocument();
  });

  it('marks invalid identifiers', () => {
    render(<CveIdentifier cveId="not-a-cve" link={false} />);

    expect(screen.getByText('NOT-A-CVE')).toHaveAttribute('data-valid', 'false');
  });

  it('forwards className and aria-label', () => {
    render(<CveIdentifier cveId="CVE-2024-3094" className="custom" aria-label="Backdoor CVE" />);

    expect(screen.getByLabelText('Backdoor CVE')).toHaveClass('custom');
  });
});
