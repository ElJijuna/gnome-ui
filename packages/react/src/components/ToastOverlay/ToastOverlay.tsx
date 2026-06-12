import type { HTMLAttributes, ReactNode } from 'react';

import styles from './ToastOverlay.module.css';

export interface ToastOverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Main view content. */
  children?: ReactNode;
  /** Toast elements to overlay above the content. */
  toasts?: ReactNode;
  /** Toast stack position. Defaults to `bottom`. */
  position?: 'bottom' | 'top';
}

/**
 * Local overlay container for `Toast` notifications.
 *
 * Use this when toast positioning should be scoped to a view instead of using
 * the global `Toaster` portal.
 */
export const ToastOverlay = ({
  children,
  toasts,
  position = 'bottom',
  className,
  ...props
}: ToastOverlayProps) => {
  return (
    <div className={[styles.overlay, className].filter(Boolean).join(' ')} {...props}>
      {children}
      {toasts && (
        <div
          aria-label="Notifications"
          className={[styles.stack, position === 'top' ? styles.top : styles.bottom].join(' ')}
        >
          {toasts}
        </div>
      )}
    </div>
  );
};
