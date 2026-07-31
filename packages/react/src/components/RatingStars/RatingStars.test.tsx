import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RatingStars } from './RatingStars';

describe('RatingStars', () => {
  describe('read-only mode (no onChange)', () => {
    it('renders as role=img', () => {
      render(<RatingStars value={3} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('generates a default aria-label describing the rating', () => {
      render(<RatingStars value={3} max={5} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '3 out of 5 stars');
    });

    it('accepts a custom aria-label', () => {
      render(<RatingStars value={3} aria-label="Average rating" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Average rating');
    });

    it('renders max stars, filled up to value', () => {
      const { container } = render(<RatingStars value={3} max={5} />);
      const stars = container.querySelectorAll('svg');

      expect(stars).toHaveLength(5);
      expect(container.querySelectorAll('svg[data-filled="true"]')).toHaveLength(3);
      expect(container.querySelectorAll('svg[data-filled="false"]')).toHaveLength(2);
    });

    it('renders no interactive elements', () => {
      render(<RatingStars value={3} />);
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('clamps a value above max', () => {
      render(<RatingStars value={9} max={5} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '5 out of 5 stars');
    });

    it('clamps a negative value to 0', () => {
      render(<RatingStars value={-2} max={5} />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '0 out of 5 stars');
    });

    it('renders as read-only when disabled, even with onChange provided', () => {
      render(<RatingStars value={3} onChange={vi.fn()} disabled />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
    });
  });

  describe('interactive mode (onChange provided)', () => {
    it('renders as role=radiogroup with role=radio stars', () => {
      render(<RatingStars value={3} onChange={vi.fn()} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(5);
    });

    it('defaults the radiogroup aria-label to "Rating"', () => {
      render(<RatingStars value={3} onChange={vi.fn()} />);
      expect(screen.getByRole('radiogroup')).toHaveAccessibleName('Rating');
    });

    it('marks only the current value as checked', () => {
      render(<RatingStars value={3} onChange={vi.fn()} />);

      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(screen.getByRole('radio', { name: '4 stars' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });

    it('uses singular "star" label for the value 1', () => {
      render(<RatingStars value={0} onChange={vi.fn()} />);
      expect(screen.getByRole('radio', { name: '1 star' })).toBeInTheDocument();
    });

    it('calls onChange with the clicked star value', async () => {
      const onChange = vi.fn();

      render(<RatingStars value={2} onChange={onChange} />);
      await userEvent.click(screen.getByRole('radio', { name: '4 stars' }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(4);
    });

    it('gives only the current-value star tabIndex 0 (roving tabindex)', () => {
      render(<RatingStars value={3} onChange={vi.fn()} />);

      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute('tabIndex', '0');
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('tabIndex', '-1');
    });

    it('rolls the roving tabindex onto the first star when value is 0', () => {
      render(<RatingStars value={0} onChange={vi.fn()} />);
      expect(screen.getByRole('radio', { name: '1 star' })).toHaveAttribute('tabIndex', '0');
    });

    describe('keyboard navigation', () => {
      it('ArrowRight moves to and selects the next star', async () => {
        render(<RatingStars value={2} onChange={vi.fn()} />);

        screen.getByRole('radio', { name: '2 stars' }).focus();
        await userEvent.keyboard('{ArrowRight}');

        expect(screen.getByRole('radio', { name: '3 stars' })).toHaveFocus();
      });

      it('ArrowLeft moves to and selects the previous star', async () => {
        const onChange = vi.fn();

        render(<RatingStars value={3} onChange={onChange} />);
        screen.getByRole('radio', { name: '3 stars' }).focus();
        await userEvent.keyboard('{ArrowLeft}');

        expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
      });

      it('does not go below the first star', async () => {
        const onChange = vi.fn();

        render(<RatingStars value={1} onChange={onChange} />);
        screen.getByRole('radio', { name: '1 star' }).focus();
        await userEvent.keyboard('{ArrowLeft}');

        expect(onChange).not.toHaveBeenCalled();
      });

      it('does not go above the last star', async () => {
        const onChange = vi.fn();

        render(<RatingStars value={5} max={5} onChange={onChange} />);
        screen.getByRole('radio', { name: '5 stars' }).focus();
        await userEvent.keyboard('{ArrowRight}');

        expect(onChange).not.toHaveBeenCalled();
      });

      it('Home jumps to and selects the first star', async () => {
        const onChange = vi.fn();

        render(<RatingStars value={4} onChange={onChange} />);
        screen.getByRole('radio', { name: '4 stars' }).focus();
        await userEvent.keyboard('{Home}');

        expect(onChange).toHaveBeenCalledExactlyOnceWith(1);
      });

      it('End jumps to and selects the last star', async () => {
        const onChange = vi.fn();

        render(<RatingStars value={2} max={5} onChange={onChange} />);
        screen.getByRole('radio', { name: '2 stars' }).focus();
        await userEvent.keyboard('{End}');

        expect(onChange).toHaveBeenCalledExactlyOnceWith(5);
      });
    });

    describe('hover preview', () => {
      it('previews the hovered star fill without calling onChange', async () => {
        const onChange = vi.fn();
        const { container } = render(<RatingStars value={2} onChange={onChange} />);

        await userEvent.hover(screen.getByRole('radio', { name: '4 stars' }));

        expect(container.querySelectorAll('svg[data-filled="true"]')).toHaveLength(4);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('reverts to the actual value when the pointer leaves', async () => {
        const { container } = render(<RatingStars value={2} onChange={vi.fn()} />);
        const star4 = screen.getByRole('radio', { name: '4 stars' });

        await userEvent.hover(star4);
        await userEvent.unhover(star4);

        expect(container.querySelectorAll('svg[data-filled="true"]')).toHaveLength(2);
      });
    });
  });

  describe('sizes', () => {
    it('forwards the size prop to the underlying icons', () => {
      const { container } = render(<RatingStars value={3} size="lg" />);
      const star = container.querySelector('svg');

      expect(star).toHaveAttribute('width', '20');
    });
  });

  describe('HTML attribute forwarding', () => {
    it('forwards className in read-only mode', () => {
      render(<RatingStars value={3} className="custom" />);
      expect(screen.getByRole('img')).toHaveClass('custom');
    });

    it('forwards className in interactive mode', () => {
      render(<RatingStars value={3} onChange={vi.fn()} className="custom" />);
      expect(screen.getByRole('radiogroup')).toHaveClass('custom');
    });
  });
});
