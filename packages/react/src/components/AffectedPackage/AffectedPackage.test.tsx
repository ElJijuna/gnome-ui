import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AffectedPackage } from './AffectedPackage';
import { formatPackageCoordinate, getPackageUrl } from './package';

describe('AffectedPackage', () => {
  it('formats package coordinates', () => {
    expect(formatPackageCoordinate({ ecosystem: 'npm', name: 'lodash', version: '4.17.20' })).toBe(
      'npm:lodash@4.17.20',
    );
  });

  it('builds package URLs', () => {
    expect(getPackageUrl({ ecosystem: 'npm', name: 'lodash', version: '4.17.20' })).toBe(
      'pkg:npm/lodash@4.17.20',
    );
  });

  it('renders affected package metadata', () => {
    render(
      <AffectedPackage ecosystem="npm" fixedVersion="4.17.21" name="lodash" version="4.17.20" />,
    );

    expect(screen.getByText('npm')).toBeInTheDocument();
    expect(screen.getByText('lodash')).toBeInTheDocument();
    expect(screen.getByText('4.17.20')).toBeInTheDocument();
    expect(screen.getByText('4.17.21')).toBeInTheDocument();
    expect(screen.getByText('pkg:npm/lodash@4.17.20')).toBeInTheDocument();
    expect(screen.getByLabelText('Affected package npm:lodash@4.17.20')).toBeInTheDocument();
  });

  it('renders digest and custom purl', () => {
    render(
      <AffectedPackage
        digest="sha256:abc123"
        ecosystem="deb"
        name="openssl"
        purl="pkg:deb/debian/openssl@3.0.11"
      />,
    );

    expect(screen.getByText('sha256:abc123')).toBeInTheDocument();
    expect(screen.getByText('pkg:deb/debian/openssl@3.0.11')).toBeInTheDocument();
  });

  it('supports custom className and aria-label', () => {
    render(
      <AffectedPackage
        aria-label="Affected dependency"
        className="custom"
        ecosystem="pypi"
        name="django"
      />,
    );

    expect(screen.getByLabelText('Affected dependency')).toHaveClass('custom');
  });
});
