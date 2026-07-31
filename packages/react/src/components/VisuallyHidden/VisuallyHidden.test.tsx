import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  describe('rendering', () => {
    it('renders its children', () => {
      render(<VisuallyHidden>Copied to clipboard</VisuallyHidden>);
      expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
    });

    it('renders a <span> by default', () => {
      const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders the element passed via "as"', () => {
      const { container } = render(<VisuallyHidden as="div">Hidden</VisuallyHidden>);
      expect(container.querySelector('div')).toBeInTheDocument();
      expect(container.querySelector('span')).not.toBeInTheDocument();
    });

    it('applies the hidden class', () => {
      const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);
      expect(container.firstElementChild?.className).toMatch(/hidden/);
    });
  });

  describe('focusable', () => {
    it('does not apply the focusable class by default', () => {
      const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>);
      expect(container.firstElementChild?.className).not.toMatch(/focusable/);
    });

    it('applies the focusable class when focusable is true', () => {
      const { container } = render(<VisuallyHidden focusable>Skip to content</VisuallyHidden>);
      expect(container.firstElementChild?.className).toMatch(/focusable/);
    });
  });

  describe('composition', () => {
    it('can wrap a focusable descendant, e.g. a skip-link', () => {
      render(
        <VisuallyHidden as="div" focusable>
          <a href="#main">Skip to content</a>
        </VisuallyHidden>,
      );

      expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<VisuallyHidden className="custom">Hidden</VisuallyHidden>);
      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards aria-live and role for status announcements', () => {
      render(
        <VisuallyHidden role="status" aria-live="polite">
          Copied!
        </VisuallyHidden>,
      );

      expect(screen.getByRole('status')).toHaveTextContent('Copied!');
    });

    it('forwards data attributes', () => {
      render(<VisuallyHidden data-testid="sr-text">Hidden</VisuallyHidden>);
      expect(screen.getByTestId('sr-text')).toBeInTheDocument();
    });
  });
});
