import type { HTMLAttributes } from "react";
import { Text } from "@gnome-ui/react";
import styles from "./StatusIndicator.module.css";

export type StatusIndicatorStatus =
  | "online"
  | "offline"
  | "warning"
  | "error"
  | "loading";

export type StatusIndicatorSize = "sm" | "md";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Current status — drives the dot color. */
  status: StatusIndicatorStatus;
  /** Service or resource name. */
  label: string;
  /** Optional detail text shown below the label. */
  description?: string;
  /** Indicator dot size. Defaults to `"md"`. */
  size?: StatusIndicatorSize;
}

const STATUS_LABELS: Record<StatusIndicatorStatus, string> = {
  online: "Online",
  offline: "Offline",
  warning: "Warning",
  error: "Error",
  loading: "Loading",
};

export function StatusIndicator({
  status,
  label,
  description,
  size = "md",
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div
        className={[
          styles.dot,
          styles[status],
          styles[size],
        ].join(" ")}
        role="img"
        aria-label={STATUS_LABELS[status]}
      />
      <div className={styles.content}>
        <Text variant={size === "sm" ? "caption" : "body"} className={styles.label}>
          {label}
        </Text>
        {description && (
          <Text variant="caption" color="dim" className={styles.description}>
            {description}
          </Text>
        )}
      </div>
    </div>
  );
}
