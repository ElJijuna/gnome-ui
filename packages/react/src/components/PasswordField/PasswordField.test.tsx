import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PasswordField } from './PasswordField';

describe('PasswordField', () => {
  describe('rendering', () => {
    it('renders a password input', () => {
      const { container } = render(<PasswordField label="Password" />);

      expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    it('renders a label when provided', () => {
      render(<PasswordField label="Password" />);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('does not render a label when omitted', () => {
      const { container } = render(<PasswordField />);
      expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('renders helper text below the input', () => {
      render(<PasswordField label="Password" helperText="Must be at least 8 characters." />);
      expect(screen.getByText('Must be at least 8 characters.')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <PasswordField label="Password" helperText="Helper" error="Passwords do not match." />,
      );
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('renders the peek toggle button by default', () => {
      render(<PasswordField label="Password" />);
      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    });

    it('omits the peek toggle button when revealable is false', () => {
      render(<PasswordField label="Password" revealable={false} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('reveal/conceal toggle', () => {
    it('switches the input to type="text" when the toggle is clicked', async () => {
      const { container } = render(<PasswordField label="Password" />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Show password' }));

      expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
    });

    it('switches back to type="password" when clicked again', async () => {
      const { container } = render(<PasswordField label="Password" />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'Show password' }));
      await user.click(screen.getByRole('button', { name: 'Hide password' }));

      expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    });

    it('accepts custom reveal/conceal labels', async () => {
      render(<PasswordField label="Password" revealLabel="Mostrar" concealLabel="Ocultar" />);
      const user = userEvent.setup();

      expect(screen.getByRole('button', { name: 'Mostrar' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Mostrar' }));
      expect(screen.getByRole('button', { name: 'Ocultar' })).toBeInTheDocument();
    });

    it('has type="button" so it does not submit an enclosing form', () => {
      render(<PasswordField label="Password" />);
      expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
        'type',
        'button',
      );
    });

    it('is disabled when the field is disabled', () => {
      render(<PasswordField label="Password" disabled />);
      expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('associates label with input via htmlFor/id', () => {
      render(<PasswordField label="Password" />);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('sets aria-describedby when helperText is present', () => {
      const { container } = render(<PasswordField label="Password" helperText="Some hint" />);
      const input = container.querySelector('input');

      expect(input).toHaveAttribute('aria-describedby');
    });

    it('sets aria-invalid when error is present', () => {
      const { container } = render(<PasswordField label="Password" error="Required" />);
      expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid without error', () => {
      const { container } = render(<PasswordField label="Password" />);
      expect(container.querySelector('input')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('disabled state', () => {
    it('disables the input', () => {
      const { container } = render(<PasswordField label="Password" disabled />);
      expect(container.querySelector('input')).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('accepts typed input', async () => {
      const { container } = render(<PasswordField label="Password" />);
      const input = container.querySelector('input') as HTMLInputElement;

      await userEvent.type(input, 'hunter2');
      expect(input).toHaveValue('hunter2');
    });

    it('calls onChange on input', async () => {
      const onChange = vi.fn();
      const { container } = render(<PasswordField label="Password" onChange={onChange} />);

      await userEvent.type(container.querySelector('input') as HTMLInputElement, 'a');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards placeholder', () => {
      const { container } = render(<PasswordField label="Password" placeholder="Enter password" />);
      expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Enter password');
    });

    it('forwards className to the input', () => {
      const { container } = render(<PasswordField label="Password" className="custom" />);
      expect(container.querySelector('input')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<PasswordField label="Password" data-testid="my-field" />);
      expect(screen.getByTestId('my-field')).toBeInTheDocument();
    });
  });
});
