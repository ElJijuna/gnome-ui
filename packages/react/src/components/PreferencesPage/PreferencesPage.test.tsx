import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PreferencesPage } from './PreferencesPage';

describe('PreferencesPage', () => {
  it('renders children', () => {
    render(
      <PreferencesPage title="General">
        <div>Group content</div>
      </PreferencesPage>,
    );

    expect(screen.getByText('Group content')).toBeInTheDocument();
  });

  it('renders with role=tabpanel', () => {
    render(<PreferencesPage title="General" />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('does not render title/iconName as visible text (metadata for the parent dialog)', () => {
    render(<PreferencesPage title="General" iconName="preferences-system-symbolic" />);

    expect(screen.queryByText('General')).not.toBeInTheDocument();
    expect(screen.queryByText('preferences-system-symbolic')).not.toBeInTheDocument();
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<PreferencesPage title="General" className="custom" />);
      expect(screen.getByRole('tabpanel')).toHaveClass('custom');
    });

    it('forwards data-testid', () => {
      render(<PreferencesPage title="General" data-testid="page" />);
      expect(screen.getByTestId('page')).toBeInTheDocument();
    });
  });
});
