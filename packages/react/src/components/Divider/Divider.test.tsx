import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Divider } from './Divider';

describe('Divider', () => {
  describe('without a label', () => {
    it('renders as role=separator', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('sets aria-orientation=horizontal', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('renders a single line and no label', () => {
      const { container } = render(<Divider />);

      expect(container.querySelectorAll("[class*='line']")).toHaveLength(1);
      expect(container.querySelector("[class*='label']")).not.toBeInTheDocument();
    });

    it('does not set an aria-label', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).not.toHaveAttribute('aria-label');
    });
  });

  describe('with a label', () => {
    it('renders the label text', () => {
      render(<Divider>OR</Divider>);
      expect(screen.getByText('OR')).toBeInTheDocument();
    });

    it('renders two lines flanking the label', () => {
      const { container } = render(<Divider>OR</Divider>);
      expect(container.querySelectorAll("[class*='line']")).toHaveLength(2);
    });

    it('sets aria-label to the string label', () => {
      render(<Divider>Continue with</Divider>);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-label', 'Continue with');
    });

    it('accepts a non-string label without setting aria-label', () => {
      render(
        <Divider>
          <span data-testid="custom">OR</span>
        </Divider>,
      );

      expect(screen.getByTestId('custom')).toBeInTheDocument();
      expect(screen.getByRole('separator')).not.toHaveAttribute('aria-label');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<Divider className="custom" />);
      expect(screen.getByRole('separator')).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes', () => {
      render(<Divider data-testid="my-divider" />);
      expect(screen.getByTestId('my-divider')).toBeInTheDocument();
    });
  });
});
