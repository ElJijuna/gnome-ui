import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CopyField } from './CopyField';

let user: ReturnType<typeof userEvent.setup>;
let writeTextSpy: MockInstance<Clipboard['writeText']>;

beforeEach(() => {
  user = userEvent.setup();
  writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CopyField', () => {
  describe('rendering', () => {
    it('renders the value in a read-only text input', () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      const input = screen.getByLabelText('API key') as HTMLInputElement;

      expect(input).toHaveValue('sk-abc123');
      expect(input).toHaveAttribute('readonly');
    });

    it('renders a label when provided', () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      expect(screen.getByLabelText('API key')).toBeInTheDocument();
    });

    it('renders helper text below the field', () => {
      render(<CopyField label="API key" value="sk-abc123" helperText="Keep this secret." />);
      expect(screen.getByText('Keep this secret.')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(
        <CopyField label="API key" value="sk-abc123" helperText="Helper" error="Key revoked." />,
      );
      expect(screen.getByText('Key revoked.')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });

    it('renders the copy button with the default label', () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    });

    it('accepts custom copy/copied labels', async () => {
      render(
        <CopyField label="API key" value="sk-abc123" copyLabel="Copy key" copiedLabel="Key copied!" />,
      );

      expect(screen.getByRole('button', { name: 'Copy key' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Copy key' }));
      expect(await screen.findByRole('button', { name: 'Key copied!' })).toBeInTheDocument();
    });
  });

  describe('copying', () => {
    it('writes the value to the clipboard when the copy button is clicked', async () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      await user.click(screen.getByRole('button', { name: 'Copy' }));

      expect(writeTextSpy).toHaveBeenCalledExactlyOnceWith('sk-abc123');
    });

    it('switches to the copied label after a successful copy', async () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      await user.click(screen.getByRole('button', { name: 'Copy' }));

      expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    });
  });

  describe('read-only behavior', () => {
    it('does not change the input value when typed into', async () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      const input = screen.getByLabelText('API key') as HTMLInputElement;

      await user.type(input, 'hello');
      expect(input).toHaveValue('sk-abc123');
    });
  });

  describe('monospace', () => {
    it('applies the monospace class by default', () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      expect(screen.getByLabelText('API key').className).toMatch(/monospace/);
    });

    it('omits the monospace class when monospace is false', () => {
      render(<CopyField label="API key" value="sk-abc123" monospace={false} />);
      expect(screen.getByLabelText('API key').className).not.toMatch(/monospace/);
    });
  });

  describe('accessibility', () => {
    it('associates label with the input via htmlFor/id', () => {
      render(<CopyField label="API key" value="sk-abc123" />);
      expect(screen.getByLabelText('API key')).toBeInTheDocument();
    });

    it('sets aria-describedby when helperText is present', () => {
      render(<CopyField label="API key" value="sk-abc123" helperText="Some hint" />);
      expect(screen.getByLabelText('API key')).toHaveAttribute('aria-describedby');
    });

    it('sets aria-invalid when error is present', () => {
      render(<CopyField label="API key" value="sk-abc123" error="Required" />);
      expect(screen.getByLabelText('API key')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('disabled state', () => {
    it('disables the input', () => {
      render(<CopyField label="API key" value="sk-abc123" disabled />);
      expect(screen.getByLabelText('API key')).toBeDisabled();
    });

    it('disables the copy button', () => {
      render(<CopyField label="API key" value="sk-abc123" disabled />);
      expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the input', () => {
      render(<CopyField label="API key" value="sk-abc123" className="custom" />);
      expect(screen.getByLabelText('API key')).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      render(<CopyField label="API key" value="sk-abc123" data-testid="my-field" />);
      expect(screen.getByTestId('my-field')).toBeInTheDocument();
    });
  });
});
