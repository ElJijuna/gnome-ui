import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SpinButton } from './SpinButton';

describe('SpinButton', () => {
  describe('rendering', () => {
    it('renders a role=spinbutton with the current value', () => {
      render(<SpinButton value={5} onChange={vi.fn()} aria-label="Volume" />);
      const spin = screen.getByRole('spinbutton');

      expect(spin).toHaveAttribute('aria-valuenow', '5');
      expect(spin).toHaveAttribute('aria-valuemin', '0');
      expect(spin).toHaveAttribute('aria-valuemax', '100');
    });

    it('formats the displayed value using decimals derived from step', () => {
      render(<SpinButton value={1} step={0.1} onChange={vi.fn()} aria-label="Volume" />);
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });

    it('honors an explicit decimals override', () => {
      render(<SpinButton value={1} decimals={2} onChange={vi.fn()} aria-label="Volume" />);
      expect(screen.getByText('1.00')).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('increments the value when + is clicked', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={5} onChange={onChange} aria-label="Volume" />);
      await userEvent.click(screen.getByText('+'));

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('decrements the value when − is clicked', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={5} onChange={onChange} aria-label="Volume" />);
      await userEvent.click(screen.getByText('−'));

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('disables the + button at max and the − button at min', () => {
      render(<SpinButton value={0} min={0} max={1} onChange={vi.fn()} aria-label="Volume" />);

      expect(screen.getByText('−').closest('button')).toBeDisabled();
      expect(screen.getByText('+').closest('button')).not.toBeDisabled();
    });

    it('clamps to the configured min/max (via keyboard, since the +/− buttons self-disable at the bounds)', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={100} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('spinbutton').focus();
      await userEvent.keyboard('{ArrowUp}');

      expect(onChange).toHaveBeenCalledWith(100);
    });
  });

  describe('keyboard interactions', () => {
    it('ArrowUp/ArrowDown step by step', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={5} step={2} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('spinbutton').focus();

      await userEvent.keyboard('{ArrowUp}');
      expect(onChange).toHaveBeenLastCalledWith(7);
    });

    it('PageUp/PageDown step by step*10', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={50} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('spinbutton').focus();

      await userEvent.keyboard('{PageUp}');
      expect(onChange).toHaveBeenLastCalledWith(60);

      await userEvent.keyboard('{PageDown}');
      expect(onChange).toHaveBeenLastCalledWith(40);
    });

    it('Home/End jump to min/max', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={50} min={0} max={100} onChange={onChange} aria-label="Volume" />);
      screen.getByRole('spinbutton').focus();

      await userEvent.keyboard('{End}');
      expect(onChange).toHaveBeenLastCalledWith(100);

      await userEvent.keyboard('{Home}');
      expect(onChange).toHaveBeenLastCalledWith(0);
    });
  });

  describe('disabled', () => {
    it('marks the spinbutton aria-disabled and untabbable', () => {
      render(<SpinButton value={5} disabled onChange={vi.fn()} aria-label="Volume" />);
      const spin = screen.getByRole('spinbutton');

      expect(spin).toHaveAttribute('aria-disabled', 'true');
      expect(spin).toHaveAttribute('tabIndex', '-1');
    });

    it('disables the increment/decrement buttons', () => {
      render(<SpinButton value={5} disabled onChange={vi.fn()} aria-label="Volume" />);

      expect(screen.getByText('−').closest('button')).toBeDisabled();
      expect(screen.getByText('+').closest('button')).toBeDisabled();
    });

    it('ignores keyboard input when disabled', async () => {
      const onChange = vi.fn();

      render(<SpinButton value={5} disabled onChange={onChange} aria-label="Volume" />);
      const spin = screen.getByRole('spinbutton');

      spin.focus();
      await userEvent.keyboard('{ArrowUp}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(
        <SpinButton value={5} onChange={vi.fn()} aria-label="Volume" className="custom" />,
      );

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards aria-labelledby', () => {
      render(<SpinButton value={5} onChange={vi.fn()} aria-labelledby="label-id" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-labelledby', 'label-id');
    });
  });
});
