import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ExpanderRow } from './ExpanderRow';

describe('ExpanderRow', () => {
  describe('rendering', () => {
    it('renders title and subtitle', () => {
      render(<ExpanderRow title="Advanced" subtitle="More options" />);

      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('renders leading and trailing content', () => {
      render(
        <ExpanderRow
          title="Advanced"
          leading={<span data-testid="leading">L</span>}
          trailing={<span data-testid="trailing">T</span>}
        />,
      );

      expect(screen.getByTestId('leading')).toBeInTheDocument();
      expect(screen.getByTestId('trailing')).toBeInTheDocument();
    });

    it('renders a toggle button controlling a labelled region', () => {
      render(<ExpanderRow title="Advanced" />);
      const button = screen.getByRole('button', { name: 'Advanced' });
      const region = screen.getByRole('region');

      expect(button).toHaveAttribute('aria-controls', region.id);
      expect(region).toHaveAttribute('aria-labelledby', button.id);
    });

    it('renders nested child rows', () => {
      render(
        <ExpanderRow title="Advanced">
          <div>Child one</div>
          <div>Child two</div>
        </ExpanderRow>,
      );

      expect(screen.getByText('Child one')).toBeInTheDocument();
      expect(screen.getByText('Child two')).toBeInTheDocument();
    });

    it('filters out falsy children', () => {
      render(
        <ExpanderRow title="Advanced">
          {null}
          <div>Only child</div>
          {false}
        </ExpanderRow>,
      );

      expect(screen.getAllByText('Only child')).toHaveLength(1);
    });
  });

  describe('expanded state', () => {
    it('is collapsed by default', () => {
      render(<ExpanderRow title="Advanced" />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('is expanded when defaultExpanded is true', () => {
      render(<ExpanderRow title="Advanced" defaultExpanded />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('reflects a controlled expanded prop', () => {
      render(<ExpanderRow title="Advanced" expanded onExpandedChange={() => {}} />);
      expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('does not change on click when controlled', async () => {
      const onExpandedChange = vi.fn();

      render(<ExpanderRow title="Advanced" expanded={false} onExpandedChange={onExpandedChange} />);
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
      render(<ExpanderRow title="Advanced" />);
      const button = screen.getByRole('button', { name: 'Advanced' });

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('calls onExpandedChange with the next value', async () => {
      const onExpandedChange = vi.fn();

      render(<ExpanderRow title="Advanced" onExpandedChange={onExpandedChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Advanced' }));

      expect(onExpandedChange).toHaveBeenCalledExactlyOnceWith(true);
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className', () => {
      const { container } = render(<ExpanderRow title="Advanced" className="custom" />);
      expect(container.firstElementChild).toHaveClass('custom');
    });
  });
});
