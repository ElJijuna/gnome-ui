import styles from './LoadingStatus.module.css';

export interface LoadingStatusProps {
  /** Announcement read by screen readers. Defaults to `"Loading…"`. */
  label?: string;
}

/**
 * Visually hidden live region announcing a skeleton loading state.
 *
 * `aria-busy` alone is not announced by most screen readers, and the
 * `Skeleton` placeholders are intentionally `aria-hidden` — this span is what
 * actually communicates "Loading…" to assistive technology.
 */
export const LoadingStatus = ({ label = 'Loading…' }: LoadingStatusProps) => (
  <span role="status" className={styles.srOnly}>
    {label}
  </span>
);
