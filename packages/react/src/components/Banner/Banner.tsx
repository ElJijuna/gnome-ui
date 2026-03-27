import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Banner.module.css";

export type BannerVariant = "info" | "warning" | "error" | "success";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual emphasis level.
   * - `info` (default) — neutral, accent-colored. Use for tips and notices.
   * - `warning` — yellow. Use for recoverable problems.
   * - `error` — red. Use for failures that need attention.
   * - `success` — green. Use for confirmations.
   */
  variant?: BannerVariant;
  /** The message text. Keep it short — one or two sentences. */
  children: ReactNode;
  /**
   * Label for the optional action button placed at the trailing end.
   * When provided, `onAction` should also be supplied.
   */
  actionLabel?: string;
  /** Called when the user clicks the action button. */
  onAction?: () => void;
  /**
   * When true a dismiss (×) button is shown at the trailing edge.
   * Provide `onDismiss` to handle removal from the DOM.
   */
  dismissible?: boolean;
  /** Called when the user clicks the dismiss button. */
  onDismiss?: () => void;
}

/**
 * Persistent message strip displayed at the top of a view.
 *
 * Mirrors the Adwaita `AdwBanner` pattern. Use for important information
 * that persists until the user acts or explicitly dismisses it.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Banner.html
 * @see https://developer.gnome.org/hig/patterns/feedback/banners.html
 */
export function Banner({
  variant = "info",
  children,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  className,
  ...props
}: BannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[styles.banner, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className={styles.message}>{children}</span>

      {(actionLabel || dismissible) && (
        <span className={styles.actions}>
          {actionLabel && (
            <button
              type="button"
              className={[styles.actionBtn, styles[`actionBtn-${variant}`]]
                .filter(Boolean)
                .join(" ")}
              onClick={onAction}
            >
              {actionLabel}
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              className={styles.dismissBtn}
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              {/* × close icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </span>
      )}
    </div>
  );
}
