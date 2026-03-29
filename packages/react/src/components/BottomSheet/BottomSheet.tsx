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
import styles from "./BottomSheet.module.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the sheet is visible. */
  open: boolean;
  /**
   * Optional heading shown in the drag handle area.
   */
  title?: ReactNode;
  children?: ReactNode;
  /** Called when the user dismisses the sheet (Escape or backdrop click). */
  onClose?: () => void;
  /**
   * Whether clicking the backdrop closes the sheet.
   * Defaults to `true`.
   */
  closeOnBackdrop?: boolean;
}

/**
 * Slide-up panel that overlays content from the bottom edge.
 *
 * Mirrors `AdwBottomSheet` (libadwaita 1.6+). Renders into a portal on
 * `document.body`. Traps focus, closes on Escape or backdrop click.
 * The handle bar is decorative — drag-to-close is not implemented.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.BottomSheet.html
 */
export function BottomSheet({
  open,
  title,
  children,
  onClose,
  closeOnBackdrop = true,
  className,
  ...props
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);

  // Save / restore focus
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  // Focus trap + Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
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
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={[styles.sheet, className].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Handle bar */}
        <div className={styles.handle} aria-hidden="true">
          <div className={styles.handleBar} />
        </div>

        {/* Optional title */}
        {title && (
          <div id={titleId} className={styles.title}>{title}</div>
        )}

        {/* Content */}
        {children && (
          <div className={styles.content}>{children}</div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
