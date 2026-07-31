import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PreferencesGroup } from './PreferencesGroup';

describe('PreferencesGroup', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <PreferencesGroup>
          <div>Row content</div>
        </PreferencesGroup>,
      );

      expect(screen.getByText('Row content')).toBeInTheDocument();
    });

    it('renders a title', () => {
      render(<PreferencesGroup title="Network" />);
      expect(screen.getByText('Network')).toBeInTheDocument();
    });

    it('renders a description', () => {
      render(<PreferencesGroup title="Network" description="Manage connections" />);
      expect(screen.getByText('Manage connections')).toBeInTheDocument();
    });

    it('renders headerSuffix content', () => {
      render(
        <PreferencesGroup title="Network" headerSuffix={<button type="button">Reset</button>} />,
      );

      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    });

    it('omits the header block entirely when no title, description, or headerSuffix are given', () => {
      const { container } = render(
        <PreferencesGroup>
          <div>Row</div>
        </PreferencesGroup>,
      );

      // Only the content wrapper should exist as a direct child — no header block.
      expect(container.firstElementChild?.children).toHaveLength(1);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<PreferencesGroup className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data-testid', () => {
      render(<PreferencesGroup data-testid="group" />);
      expect(screen.getByTestId('group')).toBeInTheDocument();
    });
  });
});
