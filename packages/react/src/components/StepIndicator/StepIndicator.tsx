import { Check } from '@gnome-ui/icons';
import type { HTMLAttributes } from 'react';

import { Icon } from '../Icon';

import styles from './StepIndicator.module.css';

export type StepIndicatorOrientation = 'horizontal' | 'vertical';

export interface StepIndicatorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Total number of steps, or an array of per-step labels rendered beneath
   * each circle. Pass a plain number for an unlabelled sequence (only the
   * "Step X of Y" caption is shown); pass an array of strings to label each step.
   */
  steps: number | string[];
  /** Zero-based index of the current/active step. */
  currentStep: number;
  /**
   * Layout direction.
   * @default 'horizontal'
   */
  orientation?: StepIndicatorOrientation;
  /**
   * Called when a completed step's circle is clicked, letting the user jump
   * back to a step they've already finished. Omit to make steps non-interactive.
   * The current and upcoming steps are never clickable.
   */
  onStepClick?: (index: number) => void;
  /**
   * Accessible label for the indicator's `nav` landmark.
   * @default 'Progress'
   */
  label?: string;
}

/**
 * Numbered "Step X of Y" progress indicator for onboarding/wizard flows.
 *
 * Complements `CarouselIndicatorDots`/`CarouselIndicatorLines` with a
 * labelled, linear alternative — steps are numbered circles connected by a
 * progress line, with the completed portion tinted in the accent color.
 */
export const StepIndicator = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  label = 'Progress',
  className,
  ...props
}: StepIndicatorProps) => {
  const stepLabels = Array.isArray(steps) ? steps : undefined;
  const stepCount = Array.isArray(steps) ? steps.length : steps;
  const clampedCurrent = Math.max(0, Math.min(currentStep, stepCount - 1));

  return (
    <nav
      aria-label={label}
      className={[styles.nav, orientation === 'vertical' ? styles.vertical : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {!stepLabels && (
        <span className={styles.caption}>
          Step {clampedCurrent + 1} of {stepCount}
        </span>
      )}

      <ol className={styles.list}>
        {Array.from({ length: stepCount }, (_, i) => {
          const isCompleted = i < clampedCurrent;
          const isCurrent = i === clampedCurrent;
          const clickable = Boolean(onStepClick) && isCompleted;
          const stepLabel = stepLabels?.[i];
          const circleContent = isCompleted ? <Icon icon={Check} size="sm" aria-hidden /> : i + 1;

          return (
            <li
              key={i}
              className={[
                styles.stepItem,
                isCompleted ? styles.completed : null,
                isCurrent ? styles.current : null,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {clickable ? (
                <button
                  type="button"
                  className={styles.circle}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={stepLabel ?? `Step ${i + 1}`}
                  onClick={() => onStepClick?.(i)}
                >
                  {circleContent}
                </button>
              ) : (
                <span
                  className={styles.circle}
                  aria-current={isCurrent ? 'step' : undefined}
                  {...(stepLabel ? {} : { 'aria-label': `Step ${i + 1}` })}
                >
                  {circleContent}
                </span>
              )}

              {stepLabel && <span className={styles.stepLabel}>{stepLabel}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
