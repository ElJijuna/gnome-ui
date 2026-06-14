import {
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '../Dialog/dialogUtils';

import styles from './BottomSheet.module.css';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DRAG_CLOSE_THRESHOLD = 150;
const CLOSE_ANIM_DURATION = 200;

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the sheet is visible. */
  open: boolean;
  /**
   * Optional heading shown in the drag handle area.
   */
  title?: ReactNode;
  children?: ReactNode;
  /** Called when the user dismisses the sheet (Escape, backdrop click, or drag down). */
  onClose?: () => void;
  /**
   * Whether clicking the backdrop closes the sheet.
   * Defaults to `true`.
   */
  closeOnBackdrop?: boolean;
}

/**
 * Slide-up panel that overlays content from the bottom edge.
 *
 * Mirrors `AdwBottomSheet` (libadwaita 1.6+). Renders into a portal on
 * `document.body`. Traps focus, closes on Escape, backdrop click, or by
 * dragging the handle bar downward past 150 px. Plays slide-out animation on close.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.BottomSheet.html
 */
export const BottomSheet = ({
  open,
  title,
  children,
  onClose,
  closeOnBackdrop = true,
  className,
  ...props
}: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);

  // Animation state
  const [isVisible, setIsVisible] = useState(open);
  const [isEntering, setIsEntering] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const prevOpen = useRef(open);
  const dragClosing = useRef(false);

  // Drag state (refs avoid re-renders during drag)
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const sheetDragY = useRef(0);

  useBodyScrollLock(open);

  // Track open → closed transitions
  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;

    if (open) {
      setIsVisible(true);
      setIsEntering(true);
      setIsClosing(false);
    } else if (wasOpen && !dragClosing.current) {
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
    } else if (wasOpen && dragClosing.current) {
      dragClosing.current = false;
      setIsEntering(false);
      setIsVisible(false);
    }
  }, [open]);

  // Save / restore focus
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE);

      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  // Focus trap + Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();

        return;
      }

      if (e.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  // Unmount after exit animation duration elapses
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

  // ─── Drag-to-dismiss ─────────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    sheetDragY.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (sheetRef.current) {
      // Cancel any active entry animation immediately so inline style.transform
      // takes effect. CSS animations sit above the author cascade layer and would
      // otherwise override the inline transform set during drag.
      sheetRef.current.style.animation = 'none';
      sheetRef.current.classList.add(styles.dragging);
    }

    setIsEntering(false);
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) {
      return;
    }

    const delta = Math.max(0, e.clientY - dragStartY.current);

    sheetDragY.current = delta;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;

    const delta = sheetDragY.current;

    sheetDragY.current = 0;
    sheetRef.current?.classList.remove(styles.dragging);

    if (delta >= DRAG_CLOSE_THRESHOLD) {
      dragClosing.current = true;

      const reducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const sheet = sheetRef.current;
      const backdrop = backdropRef.current;

      if (!reducedMotion && sheet && backdrop) {
        sheet.style.transition = `transform ${CLOSE_ANIM_DURATION}ms ease`;
        sheet.style.transform = 'translateY(100%)';
        backdrop.style.transition = `opacity ${CLOSE_ANIM_DURATION}ms ease`;
        backdrop.style.opacity = '0';

        setTimeout(() => {
          sheet.style.transition = '';
          sheet.style.transform = '';
          backdrop.style.transition = '';
          backdrop.style.opacity = '';
          onClose?.();
        }, CLOSE_ANIM_DURATION);
      } else {
        onClose?.();
      }
    } else if (sheetRef.current) {
      // Snap back — restore animation override and clear transform so CSS transition animates to 0
      sheetRef.current.style.animation = '';
      sheetRef.current.style.transform = '';
    }
  }, [onClose]);

  if (!isVisible) {
    return null;
  }

  const node = (
    <div
      ref={backdropRef}
      className={[styles.backdrop, isClosing ? styles.closing : null].filter(Boolean).join(' ')}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={[
          styles.sheet,
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
        {/* Handle bar — drag downward to dismiss */}
        <div
          className={styles.handle}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className={styles.handleBar} />
        </div>

        {/* Optional title */}
        {title && (
          <div id={titleId} className={styles.title}>
            {title}
          </div>
        )}

        {/* Content */}
        {children && <div className={styles.content}>{children}</div>}
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return node;
  }

  return createPortal(node, document.body);
};
