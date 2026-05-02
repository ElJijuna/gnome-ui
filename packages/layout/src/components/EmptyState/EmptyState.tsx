import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "@gnome-ui/react";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Illustrative icon displayed large and muted at the top. */
  icon?: ReactNode;
  /** Primary empty state message. */
  title: string;
  /** Optional supporting text below the title. */
  description?: string;
  /** Optional call-to-action element (button, link…). */
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <Text variant="heading" className={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="body" color="dim" className={styles.description}>
          {description}
        </Text>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
