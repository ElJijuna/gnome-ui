import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Expander } from './Expander';

describe('Expander', () => {
  describe('rendering', () => {
    it('renders the label', () => {
      render(<Expander label="Show advanced options" />);
      expect(screen.getByText('Show advanced options')).toBeInTheDocument();
    });

    it('accepts a non-string label', () => {
      render(<Expander label={<span data-testid="custom-label">Advanced</span>}>Content</Expander>);
      expect(screen.getByTestId('custom-label')).toBeInTheDocument();
    });

    it('renders a toggle button controlling a labelled region', () => {
      render(<Expander label="Advanced" />);
      const button = screen.getByRole('button', { name: 'Advanced' });
      const region = screen.getByRole('region');

      expect(button).toHaveAttribute('aria-controls', region.id);
      expect(region).toHaveAttribute('aria-labelledby', button.id);
    });

    it('renders children', () => {
      render(
        <Expander label="Advanced">
          <div>Nested content</div>
        </Expander>,
      );
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('keeps children in the DOM while collapsed (CSS-driven reveal)', () => {
      render(
        <Expander label="Advanced">
          <div>Nested content</div>
        </Expander>,
      );
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });

  describe('expanded state', () => {
    it('is collapsed by default', () => {
      render(<Expander label="Advanced" />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('is expanded when defaultExpanded is true', () => {
      render(<Expander label="Advanced" defaultExpanded />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('reflects a controlled expanded prop', () => {
      render(<Expander label="Advanced" expanded onExpandedChange={() => {}} />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('does not change on click when controlled', async () => {
      const onExpandedChange = vi.fn();

      render(<Expander label="Advanced" expanded={false} onExpandedChange={onExpandedChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Advanced' }));

      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('interactions', () => {
    it('toggles expanded state on header click when uncontrolled', async () => {
      render(<Expander label="Advanced" />);
      const button = screen.getByRole('button', { name: 'Advanced' });

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('calls onExpandedChange with the next value', async () => {
      const onExpandedChange = vi.fn();

      render(<Expander label="Advanced" onExpandedChange={onExpandedChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Advanced' }));

      expect(onExpandedChange).toHaveBeenCalledExactlyOnceWith(true);
    });
  });

  describe('disabled', () => {
    it('disables the toggle button', () => {
      render(<Expander label="Advanced" disabled />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toBeDisabled();
    });

    it('does not toggle on click when disabled', async () => {
      render(<Expander label="Advanced" disabled />);
      const button = screen.getByRole('button', { name: 'Advanced' });

      await userEvent.click(button, { pointerEventsCheck: 0 });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<Expander label="Advanced" className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
