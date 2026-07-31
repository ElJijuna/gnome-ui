import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SplitButton } from './SplitButton';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);

    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

describe('SplitButton', () => {
  describe('rendering', () => {
    it('renders the primary label button', () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders a toggle button labelled "More options" by default', () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);
      expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument();
    });

    it('accepts a custom dropdownLabel', () => {
      render(
        <SplitButton label="Save" dropdownContent={<div>Options</div>} dropdownLabel="Save as…" />,
      );
      expect(screen.getByRole('button', { name: 'Save as…' })).toBeInTheDocument();
    });

    it('applies a variant class to the container', () => {
      const { container } = render(
        <SplitButton label="Save" variant="suggested" dropdownContent={<div>Options</div>} />,
      );
      expect(container.firstElementChild?.className).toMatch(/suggested/);
    });

    it('the dropdown panel is closed by default', () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);
      expect(screen.getByRole('button', { name: 'More options' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('primary action', () => {
    it('calls onClick when the primary button is clicked', async () => {
      const onClick = vi.fn();

      render(<SplitButton label="Save" onClick={onClick} dropdownContent={<div>Options</div>} />);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not open the dropdown when the primary button is clicked', async () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('dropdown toggle', () => {
    it('opens the dropdown panel with its content on toggle click', async () => {
      render(<SplitButton label="Save" dropdownContent={<div>Save as PDF</div>} />);

      await userEvent.click(screen.getByRole('button', { name: 'More options' }));

      expect(screen.getByRole('button', { name: 'More options' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Save as PDF')).toBeInTheDocument();
    });

    it('closes the dropdown when the toggle is clicked again', async () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);
      const toggle = screen.getByRole('button', { name: 'More options' });

      await userEvent.click(toggle);
      await userEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape and refocuses the toggle', async () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);

      await userEvent.click(screen.getByRole('button', { name: 'More options' }));
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('button', { name: 'More options' })).toHaveFocus();
    });

    it('closes when clicking outside', async () => {
      render(<SplitButton label="Save" dropdownContent={<div>Options</div>} />);

      await userEvent.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('disabled', () => {
    it('disables both halves', () => {
      render(<SplitButton label="Save" disabled dropdownContent={<div>Options</div>} />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'More options' })).toBeDisabled();
    });
  });
});
