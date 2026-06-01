import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Chip } from './Chip';

describe('Chip', () => {
  describe('static mode', () => {
    it('renders the label', () => {
      render(<Chip label="React" />);
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('renders as a <span> when not selectable', () => {
      const { container } = render(<Chip label="React" />);

      expect(container.querySelector('span')).toBeInTheDocument();
      expect(container.querySelector('button')).toBeNull();
    });

    it('does not render a remove button when onRemove is omitted', () => {
      render(<Chip label="React" />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('removable mode', () => {
    it("renders a remove button with aria-label 'Remove <label>'", () => {
      render(<Chip label="React" onRemove={() => {}} />);
      expect(screen.getByRole('button', { name: 'Remove React' })).toBeInTheDocument();
    });

    it('calls onRemove when the remove button is clicked', () => {
      const onRemove = vi.fn();

      render(<Chip label="React" onRemove={onRemove} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('remove button is disabled when disabled=true', () => {
      render(<Chip label="React" onRemove={() => {}} disabled />);
      expect(screen.getByRole('button', { name: 'Remove React' })).toBeDisabled();
    });

    it('root remains a <span> in removable mode', () => {
      const { container } = render(<Chip label="React" onRemove={() => {}} />);

      expect(container.firstElementChild?.tagName).toBe('SPAN');
    });
  });

  describe('selectable mode', () => {
    it("renders as a button with role='checkbox'", () => {
      render(<Chip label="React" selectable selected={false} onToggle={() => {}} />);
      expect(screen.getByRole('checkbox', { name: 'React' })).toBeInTheDocument();
    });

    it('has aria-checked=false when not selected', () => {
      render(<Chip label="React" selectable selected={false} onToggle={() => {}} />);
      expect(screen.getByRole('checkbox', { name: 'React' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('has aria-checked=true when selected', () => {
      render(<Chip label="React" selectable selected onToggle={() => {}} />);
      expect(screen.getByRole('checkbox', { name: 'React' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn();

      render(<Chip label="React" selectable selected={false} onToggle={onToggle} />);
      fireEvent.click(screen.getByRole('checkbox', { name: 'React' }));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled=true', () => {
      render(<Chip label="React" selectable selected={false} onToggle={() => {}} disabled />);
      expect(screen.getByRole('checkbox', { name: 'React' })).toBeDisabled();
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className to the root element', () => {
      const { container } = render(<Chip label="Tag" className="custom" />);

      expect(container.firstElementChild).toHaveClass('custom');
    });

    it('forwards data attributes', () => {
      const { container } = render(<Chip label="Tag" data-testid="chip" />);

      expect(container.firstElementChild).toHaveAttribute('data-testid', 'chip');
    });
  });
});
