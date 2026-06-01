import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  describe('title', () => {
    it('renders the title text', () => {
      render(<SectionHeader title="Recent Activity" />);
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('subtitle', () => {
    it('renders the subtitle when provided', () => {
      render(<SectionHeader title="Recent Activity" subtitle="Last 24 hours" />);
      expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    });

    it('does not render a subtitle element when omitted', () => {
      render(<SectionHeader title="Recent Activity" />);
      expect(screen.queryByText('Last 24 hours')).toBeNull();
    });
  });

  describe('action', () => {
    it('renders the action when provided', () => {
      render(<SectionHeader title="Recent Activity" action={<button>View all</button>} />);
      expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument();
    });

    it('does not render the action slot when omitted', () => {
      const { container } = render(<SectionHeader title="Recent Activity" />);

      expect(container.querySelector("[class*='action']")).toBeNull();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root element', () => {
      const { container } = render(<SectionHeader title="Title" className="custom-header" />);

      expect(container.firstChild).toHaveClass('custom-header');
    });

    it('forwards inline style to the root element', () => {
      const { container } = render(<SectionHeader title="Title" style={{ marginBottom: 16 }} />);

      expect((container.firstChild as HTMLElement).style.marginBottom).toBe('16px');
    });

    it('forwards arbitrary data attributes', () => {
      const { container } = render(<SectionHeader title="Title" data-testid="section-header" />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'section-header');
    });
  });
});
