import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EntryRow } from './EntryRow';

describe('EntryRow', () => {
  describe('rendering', () => {
    it('renders an input labelled by title', () => {
      render(<EntryRow title="Display name" />);
      expect(screen.getByLabelText('Display name')).toBeInTheDocument();
    });

    it('renders leading and trailing content', () => {
      render(
        <EntryRow
          title="Display name"
          leading={<span data-testid="leading">L</span>}
          trailing={<span data-testid="trailing">T</span>}
        />,
      );

      expect(screen.getByTestId('leading')).toBeInTheDocument();
      expect(screen.getByTestId('trailing')).toBeInTheDocument();
    });

    it('associates the label with the input via a generated id', () => {
      render(<EntryRow title="Display name" />);
      const input = screen.getByLabelText('Display name');

      expect(input.id).toBeTruthy();
    });

    it('uses an explicit id over the generated one', () => {
      render(<EntryRow title="Display name" id="display-name" />);
      expect(screen.getByLabelText('Display name')).toHaveAttribute('id', 'display-name');
    });
  });

  describe('value', () => {
    it('is empty by default', () => {
      render(<EntryRow title="Display name" />);
      expect(screen.getByLabelText('Display name')).toHaveValue('');
    });

    it('renders defaultValue', () => {
      render(<EntryRow title="Display name" defaultValue="Ada" />);
      expect(screen.getByLabelText('Display name')).toHaveValue('Ada');
    });

    it('reflects a controlled value', () => {
      render(<EntryRow title="Display name" value="Ada" onChange={() => {}} />);
      expect(screen.getByLabelText('Display name')).toHaveValue('Ada');
    });
  });

  describe('interactions', () => {
    it('updates the value on typing when uncontrolled', async () => {
      render(<EntryRow title="Display name" />);
      const input = screen.getByLabelText('Display name');

      await userEvent.type(input, 'Ada');
      expect(input).toHaveValue('Ada');
    });

    it('calls onValueChange and onChange while typing', async () => {
      const onValueChange = vi.fn();
      const onChange = vi.fn();

      render(<EntryRow title="Display name" onValueChange={onValueChange} onChange={onChange} />);
      await userEvent.type(screen.getByLabelText('Display name'), 'A');

      expect(onValueChange).toHaveBeenCalledWith('A');
      expect(onChange).toHaveBeenCalledOnce();
    });

    it('focuses the input when the row container itself is clicked', async () => {
      const { container } = render(<EntryRow title="Display name" />);
      const input = screen.getByLabelText('Display name');

      await userEvent.click(container.firstElementChild as HTMLElement);
      expect(input).toHaveFocus();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<EntryRow title="Display name" className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('disables the input when disabled prop is set', () => {
      render(<EntryRow title="Display name" disabled />);
      expect(screen.getByLabelText('Display name')).toBeDisabled();
    });
  });
});
