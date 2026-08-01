import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OtpInput } from './OtpInput';

function cells() {
  return screen.getAllByRole('textbox') as HTMLInputElement[];
}

describe('OtpInput', () => {
  describe('rendering', () => {
    it('renders 6 cells by default', () => {
      render(<OtpInput value="" onChange={vi.fn()} />);
      expect(cells()).toHaveLength(6);
    });

    it('renders a custom number of cells', () => {
      render(<OtpInput value="" onChange={vi.fn()} length={4} />);
      expect(cells()).toHaveLength(4);
    });

    it('pre-fills cells from the value prop', () => {
      render(<OtpInput value="123" onChange={vi.fn()} length={6} />);
      const c = cells();

      expect(c[0]).toHaveValue('1');
      expect(c[1]).toHaveValue('2');
      expect(c[2]).toHaveValue('3');
      expect(c[3]).toHaveValue('');
    });

    it('labels each cell with its position', () => {
      render(<OtpInput value="" onChange={vi.fn()} length={4} />);
      expect(screen.getByLabelText('Digit 1 of 4')).toBeInTheDocument();
      expect(screen.getByLabelText('Digit 4 of 4')).toBeInTheDocument();
    });

    it('renders the label as a legend', () => {
      render(<OtpInput value="" onChange={vi.fn()} label="Verification code" />);
      expect(screen.getByText('Verification code').tagName).toBe('LEGEND');
    });

    it('renders helper text', () => {
      render(<OtpInput value="" onChange={vi.fn()} helperText="Check your email." />);
      expect(screen.getByText('Check your email.')).toBeInTheDocument();
    });

    it('renders error message instead of helper text', () => {
      render(<OtpInput value="" onChange={vi.fn()} helperText="Helper" error="Invalid code." />);
      expect(screen.getByText('Invalid code.')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('typing', () => {
    it('calls onChange with the digit placed at the correct position', () => {
      const onChange = vi.fn();

      render(<OtpInput value="" onChange={onChange} length={4} />);
      fireEvent.change(cells()[0], { target: { value: '5' } });

      expect(onChange).toHaveBeenCalledWith('5');
    });

    it('auto-advances focus to the next cell after typing a digit', () => {
      render(<OtpInput value="" onChange={vi.fn()} length={4} />);
      const c = cells();

      fireEvent.change(c[0], { target: { value: '5' } });

      expect(c[1]).toHaveFocus();
    });

    it('does not advance focus past the last cell', () => {
      render(<OtpInput value="12" onChange={vi.fn()} length={3} />);
      const c = cells();

      c[2].focus();
      fireEvent.change(c[2], { target: { value: '3' } });

      expect(c[2]).toHaveFocus();
    });

    it('strips non-digit characters', () => {
      const onChange = vi.fn();

      render(<OtpInput value="" onChange={onChange} length={4} />);
      fireEvent.change(cells()[0], { target: { value: 'a' } });

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('fills a middle cell when typed into directly, preserving other cells', () => {
      const onChange = vi.fn();

      render(<OtpInput value="1_3" onChange={onChange} length={4} />);
      // value[1] is '_' (non-digit placeholder in this test only, rendered as-is
      // since OtpInput does not validate the `value` prop itself)
      fireEvent.change(cells()[1], { target: { value: '2' } });

      expect(onChange).toHaveBeenCalledWith('123');
    });
  });

  describe('onComplete', () => {
    it('calls onComplete once the value reaches the configured length', () => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <OtpInput value="12345" onChange={vi.fn()} onComplete={onComplete} length={6} />,
      );

      rerender(<OtpInput value="123456" onChange={vi.fn()} onComplete={onComplete} length={6} />);

      expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');
    });

    it('does not call onComplete when the value is below length', () => {
      const onComplete = vi.fn();

      render(<OtpInput value="123" onChange={vi.fn()} onComplete={onComplete} length={6} />);

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('does not call onComplete again on re-renders with the same complete value', () => {
      const onComplete = vi.fn();

      const { rerender } = render(
        <OtpInput value="12345" onChange={vi.fn()} onComplete={onComplete} length={6} />,
      );

      rerender(<OtpInput value="123456" onChange={vi.fn()} onComplete={onComplete} length={6} />);
      rerender(<OtpInput value="123456" onChange={vi.fn()} onComplete={onComplete} length={6} />);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('backspace', () => {
    it('clears the current cell if it has a value', () => {
      const onChange = vi.fn();

      render(<OtpInput value="12" onChange={onChange} length={4} />);
      const c = cells();

      c[1].focus();
      fireEvent.keyDown(c[1], { key: 'Backspace' });

      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('clears the previous cell and moves focus back when the current cell is empty', () => {
      const onChange = vi.fn();

      render(<OtpInput value="12" onChange={onChange} length={4} />);
      const c = cells();

      c[2].focus();
      fireEvent.keyDown(c[2], { key: 'Backspace' });

      expect(onChange).toHaveBeenCalledWith('1');
      expect(c[1]).toHaveFocus();
    });

    it('does nothing on the first empty cell', () => {
      const onChange = vi.fn();

      render(<OtpInput value="" onChange={onChange} length={4} />);
      const c = cells();

      c[0].focus();
      fireEvent.keyDown(c[0], { key: 'Backspace' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('arrow navigation', () => {
    it('ArrowRight moves focus to the next cell', () => {
      render(<OtpInput value="" onChange={vi.fn()} length={4} />);
      const c = cells();

      c[0].focus();
      fireEvent.keyDown(c[0], { key: 'ArrowRight' });

      expect(c[1]).toHaveFocus();
    });

    it('ArrowLeft moves focus to the previous cell', () => {
      render(<OtpInput value="" onChange={vi.fn()} length={4} />);
      const c = cells();

      c[2].focus();
      fireEvent.keyDown(c[2], { key: 'ArrowLeft' });

      expect(c[1]).toHaveFocus();
    });
  });

  describe('paste', () => {
    it('distributes a pasted code across the cells starting at the focused cell', () => {
      const onChange = vi.fn();

      render(<OtpInput value="" onChange={onChange} length={6} />);
      fireEvent.paste(cells()[0], { clipboardData: { getData: () => '123456' } });

      expect(onChange).toHaveBeenCalledWith('123456');
    });

    it('truncates a pasted code that is longer than the remaining cells', () => {
      const onChange = vi.fn();

      render(<OtpInput value="1" onChange={onChange} length={4} />);
      fireEvent.paste(cells()[1], { clipboardData: { getData: () => '23456789' } });

      expect(onChange).toHaveBeenCalledWith('1234');
    });

    it('ignores a paste with no digits', () => {
      const onChange = vi.fn();

      render(<OtpInput value="" onChange={onChange} length={4} />);
      fireEvent.paste(cells()[0], { clipboardData: { getData: () => 'abc' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('masked', () => {
    it('renders text cells by default', () => {
      const { container } = render(<OtpInput value="" onChange={vi.fn()} />);
      expect(container.querySelectorAll('input[type="text"]')).toHaveLength(6);
    });

    it('renders password-type cells when masked', () => {
      const { container } = render(<OtpInput value="" onChange={vi.fn()} masked />);
      expect(container.querySelectorAll('input[type="password"]')).toHaveLength(6);
    });
  });

  describe('disabled', () => {
    it('disables every cell', () => {
      render(<OtpInput value="" onChange={vi.fn()} disabled />);

      for (const c of cells()) {
        expect(c).toBeDisabled();
      }
    });
  });

  describe('accessibility', () => {
    it('sets aria-invalid on cells when error is present', () => {
      render(<OtpInput value="" onChange={vi.fn()} error="Invalid code." />);

      for (const c of cells()) {
        expect(c).toHaveAttribute('aria-invalid', 'true');
      }
    });

    it('sets aria-describedby on the group when helperText is present', () => {
      const { container } = render(
        <OtpInput value="" onChange={vi.fn()} helperText="Check your email." />,
      );
      expect(container.querySelector('fieldset')).toHaveAttribute('aria-describedby');
    });
  });
});
