import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Banner.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
export type BannerType = "default" | "info" | "success" | "warning" | "error";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Defaults to `"default"`. */
  type?: BannerType;
  /** Optional single action button. */
  action?: { label: string; onClick: () => void };
  /**
   * When provided, a dismiss button is rendered at the trailing edge.
   * Use this to let users hide a banner they've acknowledged.
   */
  onDismiss?: () => void;
  children: ReactNode;
}

// ─── Internal ────────────────────────────────────────────────────────────────
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TYPE_ICONS: Record<BannerType, string> = {
  default: "",
  info:    "i",
  success: "✓",
  warning: "!",
  error:   "✕",
};

const TYPE_ARIA: Record<BannerType, string> = {
  default: "",
  info:    "Info",
  success: "Success",
  warning: "Warning",
  error:   "Error",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function Banner({
  type = "default",
  action,
  onDismiss,
  children,
  className,
  ...props
}: BannerProps) {
  const icon = TYPE_ICONS[type];

  return (
    <div
      className={[styles.banner, styles[`type${cap(type)}`], className]
        .filter(Boolean)
        .join(" ")}
      role={type === "error" ? "alert" : "status"}
      {...props}
    >
      {icon && (
        <span
          className={[styles.icon, styles[`icon${cap(type)}`]].join(" ")}
          aria-label={TYPE_ARIA[type]}
          aria-hidden={TYPE_ARIA[type] ? undefined : "true"}
        >
          {icon}
        </span>
      )}
      <span className={styles.content}>{children}</span>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={styles.dismiss}
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}
    </div>
  );
}
