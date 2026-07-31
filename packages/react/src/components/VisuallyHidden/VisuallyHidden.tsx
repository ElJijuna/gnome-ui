import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import styles from './VisuallyHidden.module.css';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Override the rendered HTML element. Defaults to `'span'`. */
  as?: ElementType;
  /**
   * Make the content visible again when it (or a descendant) receives
   * keyboard focus — the standard "sr-only-focusable" pattern used by
   * skip-links. Defaults to `false`.
   */
  focusable?: boolean;
}

/**
 * Reusable "sr-only" utility — visually hides content while keeping it in
 * the accessibility tree, so screen readers still announce it.
 *
 * Extracts the recipe previously duplicated inline inside `CopyButton`'s
 * live-region announcement. Prefer this over `aria-hidden`/`display: none`
 * when content should remain readable by assistive technology but not
 * take up visual space (e.g. a live-region status message, or extra
 * context for an icon-only control).
 */
export const VisuallyHidden = ({
  as: Tag = 'span',
  focusable = false,
  className,
  children,
  ...props
}: VisuallyHiddenProps) => {
  return (
    <Tag
      className={[styles.hidden, focusable ? styles.focusable : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
};
