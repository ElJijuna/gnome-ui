import {
  useEffect,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { trapFocus, FOCUSABLE, useVisualViewport } from "./dialogUtils";
import styles from "./Dialog.module.css";

// ─── AlertDialog types ────────────────────────────────────────────────────────

export type AlertDialogResponseVariant = "default" | "suggested" | "destructive";

export interface AlertDialogResponse {
  /**
   * Unique identifier returned via `onResponse`.
   * Use `"cancel"` by convention for the dismissive action.
   */
  id: string;
  /** Button label. */
  label: string;
  /** Visual emphasis. Defaults to `"default"`. */
  variant?: AlertDialogResponseVariant;
  /** Disables the button. */
  disabled?: boolean;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

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

  // ── Standard dialog ──────────────────────────────────────────────────────

  /** Dialog heading. */
  title?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Action buttons (standard dialog API). */
  buttons?: DialogButton[];
  /** Called on Escape or backdrop click. */
  onClose?: () => void;
  /** Whether clicking the backdrop closes the dialog. Defaults to `true`. */
  closeOnBackdrop?: boolean;

  // ── AlertDialog extension ─────────────────────────────────────────────────

  /**
   * ARIA role. Use `"alertdialog"` for confirmations and destructive warnings —
   * screen readers announce it immediately. Defaults to `"dialog"`.
   *
   * When using `role="alertdialog"`, prefer the `responses`/`onResponse` API
   * over `buttons`/`onClick` for semantic clarity.
   */
  role?: "dialog" | "alertdialog";

  /**
   * Response buttons (AlertDialog API). Alternative to `buttons` — each
   * response has a semantic `id` returned via `onResponse`.
   * Escape and backdrop click fire the first non-destructive response.
   */
  responses?: AlertDialogResponse[];

  /**
   * Called with the `id` of the response button clicked.
   * Required when `responses` is provided.
   */
  onResponse?: (id: string) => void;
}

/**
 * Blocking modal dialog following the Adwaita pattern.
 *
 * **Standard** — `title` + `children` + `buttons[]`.
 *
 * **Alert** — add `role="alertdialog"` + `responses[]` + `onResponse`.
 * Uses a semantic response id instead of per-button `onClick`.
 * Escape / backdrop fire the first non-destructive response.
 * Mirrors `AdwAlertDialog`.
 *
 * For the app-info dialog, use `<AboutDialog />` instead.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Dialog.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.AlertDialog.html
 */
export function Dialog({
  open,
  title,
  children,
  buttons = [],
  onClose,
  closeOnBackdrop = true,
  role = "dialog",
  responses,
  onResponse,
  className,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);

  const isAlert = !!responses;
  const viewportStyle = useVisualViewport();

  // ── Focus management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  // ── Dismiss helpers ────────────────────────────────────────────────────────
  const dismissAlert = useCallback(() => {
    const cancel = responses?.find((r) => r.variant !== "destructive" && !r.disabled);
    if (cancel) onResponse?.(cancel.id);
  }, [responses, onResponse]);

  const handleBackdrop = isAlert ? dismissAlert : closeOnBackdrop ? onClose : undefined;

  // ── Keyboard ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isAlert) dismissAlert();
        else onClose?.();
        return;
      }
      trapFocus(e, dialogRef);
    },
    [isAlert, dismissAlert, onClose]
  );

  if (!open) return null;

  // ── Render buttons (standard or alert) ────────────────────────────────────
  const renderButtons = () => {
    if (isAlert && responses) {
      return (
        <div className={styles.footer}>
          {responses.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={r.disabled}
              className={[styles.btn, styles[`btn-${r.variant ?? "default"}`]].filter(Boolean).join(" ")}
              onClick={() => onResponse?.(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      );
    }
    if (buttons.length > 0) {
      return (
        <div className={styles.footer}>
          {buttons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={btn.disabled}
              className={[styles.btn, styles[`btn-${btn.variant ?? "default"}`]].filter(Boolean).join(" ")}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  const node = (
    <div
      className={styles.backdrop}
      style={viewportStyle}
      onClick={handleBackdrop}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className={[styles.dialog, className].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && <div id={titleId} className={styles.title}>{title}</div>}
        {children && <div className={styles.body}>{children}</div>}
        {renderButtons()}
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
