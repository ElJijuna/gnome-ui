import { type HTMLAttributes, type MouseEvent, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../Dialog/dialogUtils';

import styles from './Overlay.module.css';

const CLOSE_ANIM_DURATION = 200;

export interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the overlay is visible. */
  open: boolean;
  /** Called when the backdrop itself (not its content) is clicked. */
  onDismiss?: () => void;
  /** Portal mount target. Defaults to `document.body`. */
  container?: Element;
}

/**
 * Standalone backdrop/scrim layer with a fade transition and
 * click-to-dismiss — the shared building block behind `Modal`, `Dialog`,
 * and `BottomSheet`'s backdrops, extracted for building custom overlay UI.
 *
 * Deliberately minimal: no focus trap, no Escape handling, no dialog role.
 * Use `Modal` or `Dialog` directly when you need those.
 *
 * Renders into a portal, locks body scroll while open, and respects
 * `prefers-reduced-motion` by skipping straight to the end state.
 */
export const Overlay = ({
  open,
  onDismiss,
  container,
  children,
  className,
  ...props
}: OverlayProps) => {
  const [isVisible, setIsVisible] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const prevOpen = useRef(open);

  useBodyScrollLock(open);

  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;

    if (open) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (wasOpen) {
      const reducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        setIsVisible(false);
      } else {
        setIsClosing(true);
      }
    }
  }, [open]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const id = window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, CLOSE_ANIM_DURATION);

    return () => window.clearTimeout(id);
  }, [isClosing]);

  if (!isVisible) {
    return null;
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onDismiss?.();
    }
  };

  const node = (
    <div
      className={[styles.backdrop, isClosing ? styles.closing : null, className]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );

  return createPortal(node, container ?? document.body);
};
