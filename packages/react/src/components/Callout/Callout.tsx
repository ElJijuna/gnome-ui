import { DialogInformation, DialogWarning } from '@gnome-ui/icons';
import type { HTMLAttributes, ReactNode } from 'react';

import { Icon } from '@/components/Icon';

import styles from './Callout.module.css';

export type CalloutVariant = 'info' | 'warning' | 'tip';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual emphasis level.
   * - `info` (default) — neutral, accent-colored. General contextual notes.
   * - `warning` — yellow. Recoverable problems or things to double-check.
   * - `tip` — green. Optional suggestions or shortcuts.
   */
  variant?: CalloutVariant;
  /** The message content. */
  children: ReactNode;
  /** When true a dismiss (×) button is shown at the trailing edge. */
  dismissible?: boolean;
  /** Called when the user clicks the dismiss button. */
  onDismiss?: () => void;
}

const VARIANT_ICON = {
  info: DialogInformation,
  warning: DialogWarning,
  tip: DialogInformation,
};

/**
 * Inline, dismissible admonition box for contextual help text within forms
 * and cards.
 *
 * Unlike `Banner` (a persistent, edge-to-edge strip at the top of a view)
 * and `Toast` (a temporary notification), `Callout` is a contained, tinted
 * box meant to sit inline alongside the content it annotates.
 */
export const Callout = ({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  className,
  ...props
}: CalloutProps) => {
  return (
    <div
      role="note"
      className={[styles.callout, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      <Icon icon={VARIANT_ICON[variant]} size="md" className={styles.icon} />

      <span className={styles.message}>{children}</span>

      {dismissible && (
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
            <path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </div>
  );
};
