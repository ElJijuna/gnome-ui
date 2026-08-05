import { type HTMLAttributes, useCallback, useRef, useState } from 'react';

import { Tooltip, type TooltipPlacement } from '@/components/Tooltip';

import styles from './TextTruncate.module.css';

export interface TextTruncateProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The text to display, truncated with an ellipsis on overflow. */
  children: string;
  /**
   * Number of lines before truncating.
   * `1` (default) truncates to a single line; values above `1` clamp to
   * that many lines.
   */
  lines?: number;
  /** Tooltip placement when the text is truncated. Defaults to `"top"`. */
  tooltipPlacement?: TooltipPlacement;
}

/**
 * Single/multi-line text truncation with an automatic tooltip revealing the
 * full content on overflow — mirrors `GtkLabel`'s `ellipsize` property.
 *
 * The tooltip only appears when the text is actually clipped — measured via
 * `ResizeObserver`, so it stays accurate as the container is resized.
 */
export const TextTruncate = ({
  children,
  lines = 1,
  tooltipPlacement = 'top',
  className,
  ...props
}: TextTruncateProps) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(
    (el: HTMLSpanElement) => {
      const truncated =
        lines <= 1 ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight;

      setIsTruncated(truncated);
    },
    [lines],
  );

  // A callback ref (rather than `useEffect`) so the observer re-attaches
  // whenever the underlying node (re)mounts — which happens whenever this
  // component switches between returning a bare `<span>` and a
  // `<Tooltip>`-wrapped one, since that changes the root element type and
  // forces React to remount the subtree.
  const refCallback = useCallback(
    (node: HTMLSpanElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) {
        return;
      }

      measure(node);

      const observer = new ResizeObserver(() => measure(node));

      observer.observe(node);
      observerRef.current = observer;
    },
    [measure],
  );

  const text = (
    <span
      ref={refCallback}
      className={[styles.truncate, lines > 1 ? styles.clamp : null, className]
        .filter(Boolean)
        .join(' ')}
      style={lines > 1 ? { WebkitLineClamp: lines } : undefined}
      {...props}
    >
      {children}
    </span>
  );

  if (!isTruncated) {
    return text;
  }

  return (
    <Tooltip label={children} placement={tooltipPlacement}>
      {text}
    </Tooltip>
  );
};
