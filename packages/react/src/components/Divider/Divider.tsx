import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Divider.module.css';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional centred label (e.g. `"OR"`, `"Continue with"`). */
  children?: ReactNode;
}

/**
 * Horizontal rule with an optional centred label — common auth/login-form
 * pattern ("Sign in" / **OR** / "Continue with Google").
 *
 * For a bare dividing line with no label, use `Separator` instead — it also
 * supports a vertical orientation, which `Divider` does not.
 */
export const Divider = ({ children, className, ...props }: DividerProps) => {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={typeof children === 'string' ? children : undefined}
      className={[styles.divider, className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className={styles.line} aria-hidden="true" />
      {children && <span className={styles.label}>{children}</span>}
      {children && <span className={styles.line} aria-hidden="true" />}
    </div>
  );
};
