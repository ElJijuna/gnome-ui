import { type ReactNode, type RefObject, useEffect, useState } from 'react';

import { CoachMark } from './CoachMark';
import type { CoachMarkPlacement } from './coachMarkUtils';

export interface CoachMarkStep {
  /** The element this step highlights. */
  targetRef: RefObject<HTMLElement | null>;
  /** Heading for the step. */
  title?: ReactNode;
  /** Body copy for the step. */
  description?: ReactNode;
  /** Preferred bubble side for this step. Defaults to the tour's placement. */
  placement?: CoachMarkPlacement;
}

export interface CoachMarkTourProps {
  /** Ordered steps of the tour. */
  steps: CoachMarkStep[];
  /** Whether the tour is running. */
  open: boolean;
  /** Step to start on when the tour opens. Defaults to `0`. */
  startIndex?: number;
  /** Called after the primary action on the final step. */
  onFinish?: () => void;
  /** Called when the user skips (Skip button or Escape) before finishing. */
  onSkip?: () => void;
  /** Called with the new index whenever the active step changes. */
  onStepChange?: (index: number) => void;
  /** Default preferred bubble side for steps that don't set their own. Defaults to `'bottom'`. */
  placement?: CoachMarkPlacement;
  /** Spotlight the target. Defaults to `true`. */
  spotlight?: boolean;
  /** Close the tour when the dimmed backdrop is clicked. Defaults to `false`. */
  dismissOnBackdrop?: boolean;
  /** Override the action-button labels (for i18n). */
  labels?: Partial<{ next: string; back: string; skip: string; finish: string }>;
  /** Portal mount target. Defaults to `document.body`. */
  container?: Element;
}

const DEFAULT_LABELS = { next: 'Next', back: 'Back', skip: 'Skip', finish: 'Done' };

/**
 * Sequential onboarding tour built from `CoachMark` steps. Renders the mark for
 * the active step, wires Next/Back/Skip/Done and the "X of N" counter, and
 * advances through `steps` until finished or skipped.
 *
 * Uncontrolled step index: the tour tracks its own position and resets to
 * `startIndex` each time it opens. Drive visibility with `open`; react to
 * completion with `onFinish`/`onSkip`.
 */
export const CoachMarkTour = ({
  steps,
  open,
  startIndex = 0,
  onFinish,
  onSkip,
  onStepChange,
  placement = 'bottom',
  spotlight = true,
  dismissOnBackdrop = false,
  labels,
  container,
}: CoachMarkTourProps) => {
  const [index, setIndex] = useState(startIndex);

  // Restart from the top each time the tour opens.
  useEffect(() => {
    if (open) {
      setIndex(startIndex);
    }
  }, [open, startIndex]);

  if (!open || steps.length === 0) {
    return null;
  }

  const clampedIndex = Math.min(index, steps.length - 1);
  const step = steps[clampedIndex];
  const isFirst = clampedIndex === 0;
  const isLast = clampedIndex === steps.length - 1;
  const text = { ...DEFAULT_LABELS, ...labels };

  const goTo = (next: number) => {
    setIndex(next);
    onStepChange?.(next);
  };

  const primaryAction = {
    label: isLast ? text.finish : text.next,
    onClick: () => (isLast ? onFinish?.() : goTo(clampedIndex + 1)),
  };

  // Later steps offer Back; the first step offers Skip in the same slot.
  const secondaryAction = isFirst
    ? { label: text.skip, onClick: () => onSkip?.() }
    : { label: text.back, onClick: () => goTo(clampedIndex - 1) };

  return (
    <CoachMark
      open={open}
      targetRef={step.targetRef}
      title={step.title}
      description={step.description}
      placement={step.placement ?? placement}
      spotlight={spotlight}
      dismissOnBackdrop={dismissOnBackdrop}
      step={clampedIndex + 1}
      stepCount={steps.length}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      onDismiss={() => onSkip?.()}
      container={container}
    />
  );
};
