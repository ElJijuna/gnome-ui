import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonRow } from './ButtonRow';

describe('ButtonRow', () => {
  describe('rendering', () => {
    it('renders the title text', () => {
      render(<ButtonRow title="Sign out" />);
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });

    it('renders as a <button> element', () => {
      render(<ButtonRow title="Action" />);
      expect(screen.getByRole('button', { name: /Action/ })).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it.each([
      'default',
      'suggested',
      'destructive',
    ] as const)('applies the %s variant class', (variant) => {
      const { container } = render(<ButtonRow title="T" variant={variant} />);

      expect(container.firstElementChild?.className).toMatch(new RegExp(variant));
    });

    it('defaults to the default variant', () => {
      const { container } = render(<ButtonRow title="T" />);

      expect(container.firstElementChild?.className).toMatch(/default/);
    });
  });

  describe('leading and trailing slots', () => {
    it('renders leading content when provided', () => {
      render(<ButtonRow title="T" leading={<span data-testid="lead">←</span>} />);
      expect(screen.getByTestId('lead')).toBeInTheDocument();
    });

    it('does not render leading slot when omitted', () => {
      render(<ButtonRow title="T" />);
      expect(screen.queryByTestId('lead')).toBeNull();
    });

    it('renders trailing content when provided', () => {
      render(<ButtonRow title="T" trailing={<span data-testid="trail">→</span>} />);
      expect(screen.getByTestId('trail')).toBeInTheDocument();
    });

    it('does not render trailing slot when omitted', () => {
      render(<ButtonRow title="T" />);
      expect(screen.queryByTestId('trail')).toBeNull();
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();

      render(<ButtonRow title="Action" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button', { name: /Action/ }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is set', () => {
      render(<ButtonRow title="Action" disabled />);
      expect(screen.getByRole('button', { name: /Action/ })).toBeDisabled();
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();

      render(<ButtonRow title="Action" onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole('button', { name: /Action/ }));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root element', () => {
      const { container } = render(<ButtonRow title="T" className="custom" />);

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<ButtonRow title="T" data-testid="btn-row" />);
      expect(screen.getByTestId('btn-row')).toBeInTheDocument();
    });
  });
});
