import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Close } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./Toast.module.css";

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The notification message. Keep it short — one sentence. */
  title: ReactNode;
  /**
   * Auto-dismiss timeout in milliseconds.
   * - Set to `0` to disable auto-dismiss (user must click action or dismiss).
   * - Defaults to `3000`.
   */
  duration?: number;
  /** Called when the toast should be removed — after timeout or user action. */
  onDismiss?: () => void;
  /** Label for the optional action button. */
  actionLabel?: string;
  /** Called when the user clicks the action button. */
  onAction?: () => void;
  /** Whether to show a manual dismiss (×) button. */
  dismissible?: boolean;
}

/**
 * Non-blocking temporary notification following the Adwaita `AdwToast` pattern.
 *
 * - Auto-dismisses after `duration` ms (default 3 s). Set `duration={0}` to disable.
 * - Timer pauses while the toast is hovered or focused.
 * - Use inside `<Toaster>` for correct positioning and stacking.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Toast.html
 */
export function Toast({
  title,
  duration = 3000,
  onDismiss,
  actionLabel,
  onAction,
  dismissible = false,
  className,
  ...props
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (ms: number) => {
    if (ms <= 0 || !onDismiss) return;
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(), ms);
  };

  // Start auto-dismiss on mount
  useEffect(() => {
    if (duration > 0) {
      remainingRef.current = duration;
      startTimer(duration);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // Pause timer on hover/focus
  const handleMouseEnter = () => {
    if (timerRef.current) {
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clearTimer();
    }
  };

  const handleMouseLeave = () => {
    startTimer(remainingRef.current);
  };

  const handleAction = () => {
    clearTimer();
    onAction?.();
    onDismiss?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={[styles.toast, className].filter(Boolean).join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      <span className={styles.title}>{title}</span>

      {(actionLabel || dismissible) && (
        <span className={styles.actions}>
          {actionLabel && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleAction}
            >
              {actionLabel}
            </button>
          )}
          {dismissible && (
            <button
              type="button"
              className={styles.dismissBtn}
              aria-label="Dismiss"
              onClick={() => { clearTimer(); onDismiss?.(); }}
            >
              <Icon icon={Close} size="md" aria-hidden />
            </button>
          )}
        </span>
      )}
    </div>
  );
}
