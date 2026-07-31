import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SpinRow } from './SpinRow';

describe('SpinRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', () => {
      render(<SpinRow title="Volume" subtitle="Output level" />);

      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('Output level')).toBeInTheDocument();
    });

    it('renders leading content', () => {
      render(<SpinRow title="Volume" leading={<span data-testid="leading">V</span>} />);
      expect(screen.getByTestId('leading')).toBeInTheDocument();
    });

    it('renders a role=spinbutton widget with the current value', () => {
      render(<SpinRow title="Volume" defaultValue={5} />);
      const spin = screen.getByRole('spinbutton');

      expect(spin).toHaveAttribute('aria-valuenow', '5');
      expect(spin).toHaveAttribute('aria-valuemin', '0');
      expect(spin).toHaveAttribute('aria-valuemax', '100');
    });

    it('defaults to value 0', () => {
      render(<SpinRow title="Volume" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '0');
    });

    it('formats the displayed value using decimals derived from step', () => {
      render(<SpinRow title="Volume" defaultValue={1} step={0.1} />);
      expect(screen.getByText('1.0')).toBeInTheDocument();
    });

    it('honors an explicit decimals override', () => {
      render(<SpinRow title="Volume" defaultValue={1} decimals={2} />);
      expect(screen.getByText('1.00')).toBeInTheDocument();
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('reflects a controlled value prop', () => {
      render(<SpinRow title="Volume" value={42} onValueChange={() => {}} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '42');
    });

    it('calls onValueChange but does not change the displayed value when controlled', async () => {
      const onValueChange = vi.fn();

      render(<SpinRow title="Volume" value={10} onValueChange={onValueChange} />);
      await userEvent.click(screen.getByText('+'));

      expect(onValueChange).toHaveBeenCalledWith(11);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '10');
    });
  });

  describe('button interactions', () => {
    it('increments the value when + is clicked', async () => {
      render(<SpinRow title="Volume" defaultValue={5} />);
      await userEvent.click(screen.getByText('+'));

      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '6');
    });

    it('decrements the value when − is clicked', async () => {
      render(<SpinRow title="Volume" defaultValue={5} />);
      await userEvent.click(screen.getByText('−'));

      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '4');
    });

    it('disables the + button at max and the − button at min', () => {
      render(<SpinRow title="Volume" defaultValue={0} min={0} max={1} />);

      expect(screen.getByText('−').closest('button')).toBeDisabled();
      expect(screen.getByText('+').closest('button')).not.toBeDisabled();
    });

    it('clamps to the configured min/max', async () => {
      render(<SpinRow title="Volume" defaultValue={100} min={0} max={100} />);
      await userEvent.click(screen.getByText('+'));

      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('keyboard interactions', () => {
    it('ArrowUp/ArrowDown step by step', async () => {
      render(<SpinRow title="Volume" defaultValue={5} step={2} />);
      const spin = screen.getByRole('spinbutton');

      spin.focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(spin).toHaveAttribute('aria-valuenow', '7');

      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(spin).toHaveAttribute('aria-valuenow', '3');
    });

    it('PageUp/PageDown step by step*10', async () => {
      render(<SpinRow title="Volume" defaultValue={50} step={1} />);
      const spin = screen.getByRole('spinbutton');

      spin.focus();
      await userEvent.keyboard('{PageUp}');
      expect(spin).toHaveAttribute('aria-valuenow', '60');

      await userEvent.keyboard('{PageDown}{PageDown}');
      expect(spin).toHaveAttribute('aria-valuenow', '40');
    });

    it('Home/End jump to min/max', async () => {
      render(<SpinRow title="Volume" defaultValue={50} min={0} max={100} />);
      const spin = screen.getByRole('spinbutton');

      spin.focus();
      await userEvent.keyboard('{End}');
      expect(spin).toHaveAttribute('aria-valuenow', '100');

      await userEvent.keyboard('{Home}');
      expect(spin).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('disabled', () => {
    it('marks the spinbutton aria-disabled and untabbable', () => {
      render(<SpinRow title="Volume" disabled />);
      const spin = screen.getByRole('spinbutton');

      expect(spin).toHaveAttribute('aria-disabled', 'true');
      expect(spin).toHaveAttribute('tabIndex', '-1');
    });

    it('disables the increment/decrement buttons', () => {
      render(<SpinRow title="Volume" defaultValue={5} disabled />);

      expect(screen.getByText('−').closest('button')).toBeDisabled();
      expect(screen.getByText('+').closest('button')).toBeDisabled();
    });

    it('ignores keyboard input when disabled', async () => {
      render(<SpinRow title="Volume" defaultValue={5} disabled />);
      const spin = screen.getByRole('spinbutton');

      spin.focus();
      await userEvent.keyboard('{ArrowUp}');

      expect(spin).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<SpinRow title="Volume" className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
