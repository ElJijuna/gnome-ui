import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordEntryRow } from './PasswordEntryRow';

describe('PasswordEntryRow', () => {
  describe('rendering', () => {
    it('renders an input labelled by title', () => {
      render(<PasswordEntryRow title="Password" />);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('defaults to type=password', () => {
      render(<PasswordEntryRow title="Password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('defaults autoComplete to current-password', () => {
      render(<PasswordEntryRow title="Password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    });

    it('accepts an autoComplete override for registration forms', () => {
      render(<PasswordEntryRow title="Password" autoComplete="new-password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    });

    it('renders a reveal toggle button', () => {
      render(<PasswordEntryRow title="Password" />);
      expect(screen.getByRole('button', { name: 'Reveal password' })).toBeInTheDocument();
    });

    it('renders additional trailing content alongside the reveal button', () => {
      render(<PasswordEntryRow title="Password" trailing={<span data-testid="extra">*</span>} />);

      expect(screen.getByTestId('extra')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reveal password' })).toBeInTheDocument();
    });
  });

  describe('reveal/conceal', () => {
    it('switches the input to type=text when revealed', async () => {
      render(<PasswordEntryRow title="Password" />);

      await userEvent.click(screen.getByRole('button', { name: 'Reveal password' }));

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Conceal password' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('switches back to type=password when concealed again', async () => {
      render(<PasswordEntryRow title="Password" />);

      await userEvent.click(screen.getByRole('button', { name: 'Reveal password' }));
      await userEvent.click(screen.getByRole('button', { name: 'Conceal password' }));

      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('does not focus/click through to the row when toggling reveal', async () => {
      const { container } = render(<PasswordEntryRow title="Password" />);

      await userEvent.click(screen.getByRole('button', { name: 'Reveal password' }));

      // stopPropagation on the reveal button means the row's own onClick
      // (which would refocus the input) never runs from this click.
      expect(container.querySelector('input')).not.toHaveFocus();
    });
  });

  describe('disabled', () => {
    it('disables both the input and the reveal button', () => {
      render(<PasswordEntryRow title="Password" disabled />);

      expect(screen.getByLabelText('Password')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reveal password' })).toBeDisabled();
    });
  });
});
