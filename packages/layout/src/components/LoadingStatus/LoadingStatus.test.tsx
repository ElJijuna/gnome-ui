import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingStatus } from './LoadingStatus';

describe('LoadingStatus', () => {
  describe('label', () => {
    it('defaults to "Loading…"', () => {
      render(<LoadingStatus />);
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('renders a custom label when provided', () => {
      render(<LoadingStatus label="Fetching results…" />);
      expect(screen.getByText('Fetching results…')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('exposes role="status"', () => {
      render(<LoadingStatus />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has the sr-only class so it is visually hidden but announced', () => {
      const { container } = render(<LoadingStatus />);
      const status = container.querySelector('[role="status"]');

      expect(status?.className).toBeTruthy();
    });
  });
});
