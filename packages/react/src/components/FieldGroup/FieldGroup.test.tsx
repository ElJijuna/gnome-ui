import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FieldGroup } from './FieldGroup';

describe('FieldGroup', () => {
  describe('rendering', () => {
    it('renders a fieldset', () => {
      const { container } = render(<FieldGroup label="Notifications">content</FieldGroup>);
      expect(container.querySelector('fieldset')).toBeInTheDocument();
    });

    it('renders the label as a legend', () => {
      render(<FieldGroup label="Notifications">content</FieldGroup>);
      expect(screen.getByText('Notifications').tagName).toBe('LEGEND');
    });

    it('renders its children', () => {
      render(
        <FieldGroup label="Notifications">
          <button type="button">Enable</button>
        </FieldGroup>,
      );
      expect(screen.getByRole('button', { name: 'Enable' })).toBeInTheDocument();
    });

    it('renders helper text below the label', () => {
      render(
        <FieldGroup label="Notifications" helperText="Choose how you want to be notified.">
          content
        </FieldGroup>,
      );
      expect(screen.getByText('Choose how you want to be notified.')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <FieldGroup label="Notifications" helperText="Helper" error="Select at least one option.">
          content
        </FieldGroup>,
      );
      expect(screen.getByText('Select at least one option.')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('does not render a hint element when neither helperText nor error is set', () => {
      const { container } = render(<FieldGroup label="Notifications">content</FieldGroup>);
      expect(container.querySelector("[id$='-help']")).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('sets aria-describedby on the fieldset when helperText is present', () => {
      const { container } = render(
        <FieldGroup label="Notifications" helperText="Hint">
          content
        </FieldGroup>,
      );
      expect(container.querySelector('fieldset')).toHaveAttribute('aria-describedby');
    });

    it('does not set aria-describedby when neither helperText nor error is set', () => {
      const { container } = render(<FieldGroup label="Notifications">content</FieldGroup>);
      expect(container.querySelector('fieldset')).not.toHaveAttribute('aria-describedby');
    });

    it('gives the error message role="alert"', () => {
      render(
        <FieldGroup label="Notifications" error="Select at least one option.">
          content
        </FieldGroup>,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Select at least one option.');
    });

    it('does not give helper text role="alert"', () => {
      render(
        <FieldGroup label="Notifications" helperText="Hint">
          content
        </FieldGroup>,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('disables the fieldset', () => {
      const { container } = render(
        <FieldGroup label="Notifications" disabled>
          content
        </FieldGroup>,
      );
      expect(container.querySelector('fieldset')).toBeDisabled();
    });

    it('disables descendant form controls for free via native fieldset behavior', () => {
      render(
        <FieldGroup label="Notifications" disabled>
          <button type="button">Enable</button>
        </FieldGroup>,
      );
      expect(screen.getByRole('button', { name: 'Enable' })).toBeDisabled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the fieldset', () => {
      const { container } = render(
        <FieldGroup label="Notifications" className="custom">
          content
        </FieldGroup>,
      );
      expect(container.querySelector('fieldset')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(
        <FieldGroup label="Notifications" data-testid="notif-group">
          content
        </FieldGroup>,
      );
      expect(screen.getByTestId('notif-group')).toBeInTheDocument();
    });
  });
});
