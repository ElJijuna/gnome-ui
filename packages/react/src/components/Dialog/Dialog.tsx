import {
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

export interface DialogButton {
  /** Button label. */
  label: string;
  /** Visual variant. Defaults to `"default"`. */
  variant?: "default" | "suggested" | "destructive";
  /** Called when the button is clicked. */
  onClick: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
}

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Dialog heading. Keep it short — a noun or verb phrase. */
  title: ReactNode;
  /** Body content. Can be a string or richer JSX. */
  children?: ReactNode;
  /**
   * Action buttons rendered at the bottom.
   * Displayed right-to-left (rightmost = primary action).
   * At most one button should have `variant="suggested"` or `"destructive"`.
   */
  buttons?: DialogButton[];
  /**
   * Called when the user dismisses the dialog without completing an action
   * (Escape key or clicking the backdrop).
   */
  onClose?: () => void;
  /**
   * Whether clicking the backdrop closes the dialog.
   * Defaults to `true`.
   */
  closeOnBackdrop?: boolean;
}

/** Focusable selectors for the focus-trap logic. */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Blocking modal dialog following the Adwaita `AdwDialog` / `AdwAlertDialog` pattern.
 *
 * - Renders into a portal (`document.body`).
 * - Traps focus inside the dialog while open.
 * - Closes on Escape or backdrop click (configurable).
 * - `aria-modal`, `role="dialog"`, `aria-labelledby` wired automatically.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Dialog.html
 */
export function Dialog({
  open,
  title,
  children,
  buttons = [],
  onClose,
  closeOnBackdrop = true,
  className,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `dialog-title-${Math.random().toString(36).slice(2, 9)}`;
  const titleIdRef = useRef(titleId);

  // Focus first focusable element on open
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    el?.focus();
  }, [open]);

  // Restore focus to the previously focused element on close
  const previouslyFocused = useRef<Element | null>(null);
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  if (!open) return null;

  const node = (
    <div
      className={styles.backdrop}
      onClick={closeOnBackdrop ? onClose : undefined}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleIdRef.current}
        className={[styles.dialog, className].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Title */}
        <div id={titleIdRef.current} className={styles.title}>
          {title}
        </div>

        {/* Body */}
        {children && (
          <div className={styles.body}>{children}</div>
        )}

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className={styles.footer}>
            {buttons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                disabled={btn.disabled}
                className={[
                  styles.btn,
                  styles[`btn-${btn.variant ?? "default"}`],
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={btn.onClick}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
