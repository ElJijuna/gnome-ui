import type { HTMLAttributes, ReactNode } from "react";
import styles from "./StatusBadge.module.css";

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "new"
  | "accent"
  | "neutral";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style. Defaults to `"neutral"`.
   * - `success` — green (`--gnome-success-*`), for published / active states.
   * - `warning` — yellow (`--gnome-warning-*`), for beta / pending states.
   * - `error`   — red (`--gnome-error-*`), for failed / rejected states.
   * - `new`     — purple (`--gnome-new-*`), for newly released / featured items.
   * - `accent`  — blue (`--gnome-accent-*`), for highlighted / primary states.
   * - `neutral` — muted overlay, for draft / archived / inactive states.
   */
  variant?: StatusBadgeVariant;
  children: ReactNode;
}

/**
 * Pill-shaped text label for entity status — published, beta, new, etc.
 *
 * Unlike `Badge` (which is for numeric counts), `StatusBadge` is designed
 * for short human-readable state labels.
 *
 * ```tsx
 * <StatusBadge variant="success">published</StatusBadge>
 * <StatusBadge variant="warning">beta</StatusBadge>
 * <StatusBadge variant="new">new</StatusBadge>
 * ```
 */
export function StatusBadge({
  variant = "neutral",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
