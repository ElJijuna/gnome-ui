import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/Button';
import { Portal } from '@/components/Portal';

import styles from './CoachMark.module.css';
import {
  type BubblePosition,
  type CoachMarkPlacement,
  computeBubblePosition,
  padRect,
  type Rect,
} from './coachMarkUtils';

export interface CoachMarkAction {
  label: string;
  onClick: () => void;
}

export interface CoachMarkProps {
  /** Whether the coach mark is shown. */
  open: boolean;
  /** The element to highlight and anchor to. */
  targetRef: RefObject<HTMLElement | null>;
  /** Heading text. */
  title?: ReactNode;
  /** Body copy explaining the highlighted element. */
  description?: ReactNode;
  /** Preferred side of the target for the bubble. Flips to stay on-screen. Defaults to `'bottom'`. */
  placement?: CoachMarkPlacement;
  /** Dim the rest of the screen and cut a spotlight around the target. Defaults to `true`. */
  spotlight?: boolean;
  /** Extra px around the target inside the spotlight cutout. Defaults to `8`. */
  spotlightPadding?: number;
  /** Close when the dimmed backdrop is clicked. Defaults to `false` (guided). */
  dismissOnBackdrop?: boolean;
  /** 1-based index of this step within a tour, for the "X of N" counter. */
  step?: number;
  /** Total number of steps in the tour. */
  stepCount?: number;
  /** Primary (suggested) action, e.g. Next / Got it. */
  primaryAction?: CoachMarkAction;
  /** Secondary (flat) action, e.g. Back. */
  secondaryAction?: CoachMarkAction;
  /** Called on Escape or backdrop dismissal. */
  onDismiss?: () => void;
  /** Portal mount target. Defaults to `document.body`. */
  container?: Element;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rectOf = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

/**
 * A single onboarding coach mark: it spotlights a target element and anchors a
 * callout bubble (title, description, step counter, actions) beside it, guiding
 * a user to one feature. Compose several with `CoachMarkTour`, or drive one
 * directly with `open`.
 *
 * Not a GNOME HIG widget — a pragmatic feature-discovery pattern for web apps,
 * built on the same tokens and primitives (`Button`, `Portal`) as the rest of
 * the library. Renders into a portal, positions with a viewport-aware flip,
 * traps focus in the bubble, closes on Escape, and honours reduced motion.
 */
export const CoachMark = ({
  open,
  targetRef,
  title,
  description,
  placement = 'bottom',
  spotlight = true,
  spotlightPadding = 8,
  dismissOnBackdrop = false,
  step,
  stepCount,
  primaryAction,
  secondaryAction,
  onDismiss,
  container,
  className,
}: CoachMarkProps) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const [pos, setPos] = useState<BubblePosition | null>(null);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);

  const titleId = useId();
  const descId = useId();

  const place = useCallback(() => {
    const target = targetRef.current;
    const bubble = bubbleRef.current;
    if (!target || !bubble) {
      return;
    }
    const targetRect = rectOf(target);
    setSpotRect(padRect(targetRect, spotlightPadding));
    setPos(
      computeBubblePosition(
        targetRect,
        { width: bubble.offsetWidth, height: bubble.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
        placement,
      ),
    );
  }, [targetRef, placement, spotlightPadding]);

  // Measure + position after the bubble mounts, and keep it pinned to the target
  // as the page scrolls or resizes.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      setSpotRect(null);
      return;
    }
    place();
    window.addEventListener('scroll', place, { passive: true, capture: true });
    window.addEventListener('resize', place, { passive: true });
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  // Save / restore focus and move it into the bubble on open.
  useEffect(() => {
    if (!open) {
      return;
    }
    previouslyFocused.current = document.activeElement;
    const raf = requestAnimationFrame(() => {
      const first = bubbleRef.current?.querySelector<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      (first ?? bubbleRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onDismiss?.();
      return;
    }
    if (e.key !== 'Tab') {
      return;
    }
    // Minimal focus trap: keep Tab cycling within the bubble.
    const focusables = bubbleRef.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) {
      return;
    }
    const [first] = focusables;
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) {
    return null;
  }

  const reduced = prefersReducedMotion();
  const ready = pos !== null;

  return (
    <Portal container={container}>
      {spotlight && (
        // Dimmed backdrop with a transparent cutout produced by a huge spread
        // shadow; the cutout ring shows exactly which element is being taught.
        <div
          data-coachmark-backdrop=""
          className={[
            styles.backdrop,
            reduced ? null : styles.animated,
            ready ? styles.visible : null,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
          onClick={dismissOnBackdrop ? onDismiss : undefined}
        >
          {spotRect && (
            <div
              className={styles.spotlight}
              style={{
                top: spotRect.top,
                left: spotRect.left,
                width: spotRect.width,
                height: spotRect.height,
              }}
            />
          )}
        </div>
      )}

      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={[
          styles.bubble,
          pos ? styles[pos.placement] : null,
          reduced ? null : styles.animated,
          ready ? styles.visible : null,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden', top: -9999, left: -9999 }
        }
        onKeyDown={handleKeyDown}
      >
        <div
          className={styles.arrow}
          aria-hidden="true"
          style={
            pos
              ? pos.placement === 'top' || pos.placement === 'bottom'
                ? { left: pos.arrowOffset }
                : { top: pos.arrowOffset }
              : undefined
          }
        />

        {step !== undefined && stepCount !== undefined && (
          <span className={styles.counter}>
            {step} of {stepCount}
          </span>
        )}

        {title && (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        )}

        {description && (
          <p id={descId} className={styles.description}>
            {description}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className={styles.actions}>
            {secondaryAction && (
              <Button variant="flat" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button variant="suggested" size="sm" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Portal>
  );
};
