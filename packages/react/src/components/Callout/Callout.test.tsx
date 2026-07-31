import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Callout } from './Callout';

describe('Callout', () => {
  describe('rendering', () => {
    it('renders the message', () => {
      render(<Callout>Save your work before continuing.</Callout>);
      expect(screen.getByText('Save your work before continuing.')).toBeInTheDocument();
    });

    it('renders with role=note', () => {
      render(<Callout>Message</Callout>);
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('renders a decorative icon hidden from the accessibility tree', () => {
      const { container } = render(<Callout>Message</Callout>);
      const icon = container.querySelector('svg');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render a dismiss button by default', () => {
      render(<Callout>Message</Callout>);
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    });

    it('renders a dismiss button when dismissible is true', () => {
      render(<Callout dismissible>Message</Callout>);
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it.each(['info', 'warning', 'tip'] as const)('applies %s variant class', (variant) => {
      render(<Callout variant={variant}>Message</Callout>);
      expect(screen.getByRole('note').className).toMatch(new RegExp(variant));
    });

    it('defaults to info variant', () => {
      render(<Callout>Message</Callout>);
      expect(screen.getByRole('note').className).toMatch(/info/);
    });
  });

  describe('interactions', () => {
    it('calls onDismiss when the dismiss button is clicked', async () => {
      const onDismiss = vi.fn();

      render(
        <Callout dismissible onDismiss={onDismiss}>
          Message
        </Callout>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      render(<Callout className="custom">Message</Callout>);
      expect(screen.getByRole('note')).toHaveClass('custom');
    });

    it('forwards arbitrary HTML attributes', () => {
      render(<Callout data-testid="my-callout">Message</Callout>);
      expect(screen.getByTestId('my-callout')).toBeInTheDocument();
    });
  });
});
