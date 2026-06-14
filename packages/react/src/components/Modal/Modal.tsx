import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { FOCUSABLE, trapFocus, useBodyScrollLock, useVisualViewport } from '../Dialog/dialogUtils';

import styles from './Modal.module.css';

const CLOSE_ANIM_DURATION = 200;

export interface ModalAction {
  label: string;
  variant?: 'default' | 'suggested' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
}

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is visible. */
  open: boolean;
  /** Modal heading — also used as the accessible name. */
  title?: ReactNode;
  /** Body content. Can be any React node; the body scrolls independently. */
  children?: ReactNode;
  /**
   * Single primary action rendered rightmost in the header.
   * Defaults to the `"suggested"` variant when `variant` is omitted.
   */
  primaryAction?: ModalAction;
  /**
   * One or more secondary actions rendered between the title and primary action.
   * Defaults to the `"default"` variant when `variant` is omitted.
   */
  secondaryActions?: ModalAction[];
  /** Called when the user closes the modal (× button, Escape, or backdrop click). */
  onClose?: () => void;
  /** Whether clicking the backdrop closes the modal. Defaults to `true`. */
  closeOnBackdrop?: boolean;
}

/**
 * Large overlay for rich content, forms, and settings.
 *
 * Unlike `Dialog` (confirmations / alerts), `Modal` provides a wider card
 * (up to 720 px), a scrollable body region, and a header bar with an
 * integrated close button plus optional primary and secondary actions.
 *
 * Renders into a portal on `document.body`. Traps focus, closes on Escape,
 * and plays slide+fade animations on entry and exit.
 */
export const Modal = ({
  open,
  title,
  children,
  primaryAction,
  secondaryActions,
  onClose,
  closeOnBackdrop = true,
  className,
  ...props
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);

  // Animation state
  const [isVisible, setIsVisible] = useState(open);
  const [isEntering, setIsEntering] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const prevOpen = useRef(open);

  const viewportStyle = useVisualViewport();
  useBodyScrollLock(open);

  // Track open ↔ closed transitions
  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;

    if (open) {
      setIsVisible(true);
      setIsEntering(true);
      setIsClosing(false);
    } else if (wasOpen) {
      setIsEntering(false);

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

  // Unmount after exit animation — using setTimeout instead of onAnimationEnd
  // because React 18 portals render into document.body, outside the root
  // container where event delegation is registered, so animationend events
  // on portal children do not bubble through the synthetic event system.
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

  // Save / restore focus around open/close
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      trapFocus(e, modalRef);
    },
    [onClose],
  );

  if (!isVisible) {
    return null;
  }

  const hasActions = primaryAction ?? (secondaryActions && secondaryActions.length > 0);

  const node = (
    <div
      className={[styles.backdrop, isClosing ? styles.closing : null].filter(Boolean).join(' ')}
      style={viewportStyle}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={[
          styles.modal,
          isEntering ? styles.entering : null,
          isClosing ? styles.closing : null,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && isEntering) {
            setIsEntering(false);
          }
        }}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div className={styles.header}>
          <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
            ×
          </button>

          {/* Title grows to fill center — always rendered so actions stay right-aligned */}
          <div id={title ? titleId : undefined} className={styles.title}>
            {title}
          </div>

          {hasActions && (
            <div className={styles.actions}>
              {secondaryActions?.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  disabled={action.disabled}
                  className={[styles.btn, styles[`btn-${action.variant ?? 'default'}`]]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
              {primaryAction && (
                <button
                  type="button"
                  disabled={primaryAction.disabled}
                  className={[styles.btn, styles[`btn-${primaryAction.variant ?? 'suggested'}`]]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {children && <div className={styles.body}>{children}</div>}
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return node;
  }

  return createPortal(node, document.body);
};
