import { Star, StarOutline } from '@gnome-ui/icons';
import { type HTMLAttributes, type KeyboardEvent, useState } from 'react';

import { Icon, type IconSize } from '@/components/Icon';

import styles from './RatingStars.module.css';

export interface RatingStarsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current rating, between `0` and `max`. */
  value: number;
  /** Number of stars. Defaults to `5`. */
  max?: number;
  /**
   * Called when the user picks a rating. Omit to render a read-only
   * display (e.g. an average rating) instead of an interactive input.
   */
  onChange?: (value: number) => void;
  /** Star size. Defaults to `"md"`. */
  size?: IconSize;
  /** Disables interaction without hiding the current value. */
  disabled?: boolean;
  /** Accessible label. Defaults to `"Rating"` (interactive) or a generated `"N out of M stars"` (read-only). */
  'aria-label'?: string;
}

/**
 * Star rating display and input.
 *
 * Renders `role="radiogroup"` of `role="radio"` stars when `onChange` is
 * provided (roving tabindex, arrow-key navigation), or a static
 * `role="img"` when it isn't — for showing an average/read-only rating.
 */
export const RatingStars = ({
  value,
  max = 5,
  onChange,
  size = 'md',
  disabled = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: RatingStarsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = Boolean(onChange) && !disabled;
  const clamped = Math.min(max, Math.max(0, value));
  const displayValue = hovered ?? clamped;
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (!interactive) {
    return (
      <div
        role="img"
        aria-label={ariaLabel ?? `${clamped} out of ${max} stars`}
        className={[styles.group, className].filter(Boolean).join(' ')}
        {...props}
      >
        {stars.map((star) => (
          <Icon
            key={star}
            icon={star <= clamped ? Star : StarOutline}
            size={size}
            className={styles.star}
            data-filled={star <= clamped}
          />
        ))}
      </div>
    );
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const all = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
    );
    const focused = document.activeElement as HTMLButtonElement;
    const idx = all.indexOf(focused);

    if (idx === -1) {
      return;
    }

    let next = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = Math.min(all.length - 1, idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = Math.max(0, idx - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      next = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      next = all.length - 1;
    }

    if (next >= 0 && next !== idx) {
      all[next].focus();
      onChange?.(next + 1);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? 'Rating'}
      className={[styles.group, className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === clamped}
          aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
          className={styles.button}
          tabIndex={star === (clamped || 1) ? 0 : -1}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(null)}
        >
          <Icon
            icon={star <= displayValue ? Star : StarOutline}
            size={size}
            className={styles.star}
            data-filled={star <= displayValue}
          />
        </button>
      ))}
    </div>
  );
};
