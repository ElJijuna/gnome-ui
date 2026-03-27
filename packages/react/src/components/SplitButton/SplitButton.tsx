import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ButtonHTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./SplitButton.module.css";

export type SplitButtonVariant = "default" | "suggested" | "destructive";

export interface SplitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Label shown in the primary button. */
  label: string;
  /** Visual style. Applies to both the primary and toggle halves. */
  variant?: SplitButtonVariant;
  /** Content rendered inside the dropdown panel when the arrow is clicked. */
  dropdownContent: ReactNode;
  /** Accessible label for the dropdown toggle button. Defaults to "More options". */
  dropdownLabel?: string;
  /** Whether both halves are disabled. */
  disabled?: boolean;
}

/**
 * Primary action button with an attached dropdown arrow.
 *
 * Clicking the label half fires `onClick`; clicking the arrow half opens a
 * floating panel with `dropdownContent` (menus, options, etc.).
 *
 * Mirrors `AdwSplitButton` — supports `suggested` and `destructive` variants.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SplitButton.html
 */
export function SplitButton({
  label,
  variant = "default",
  dropdownContent,
  dropdownLabel = "More options",
  disabled = false,
  onClick,
  className,
  ...props
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Position dropdown below the toggle button
  const place = useCallback(() => {
    if (!toggleRef.current || !panelRef.current) return;
    const triggerRect = toggleRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    let left = triggerRect.right - panelRect.width;
    if (left < 8) left = 8;
    if (left + panelRect.width > vw - 8) left = vw - panelRect.width - 8;

    setDropdownStyle({
      top: triggerRect.bottom + 6,
      left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      place();
      window.addEventListener("scroll", place, { passive: true, capture: true });
      window.addEventListener("resize", place, { passive: true });
    });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  const handlePanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      toggleRef.current?.focus();
    }
  };

  const containerClass = [
    styles.container,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={dropdownLabel}
      tabIndex={-1}
      className={[styles.dropdown, open ? styles.dropdownVisible : null]
        .filter(Boolean)
        .join(" ")}
      style={
        Object.keys(dropdownStyle).length
          ? { ...dropdownStyle, position: "fixed" }
          : { visibility: "hidden", pointerEvents: "none", top: -9999, left: -9999, position: "fixed" }
      }
      onKeyDown={handlePanelKeyDown}
    >
      {dropdownContent}
    </div>
  );

  return (
    <>
      <div ref={containerRef} className={containerClass}>
        <button
          className={styles.primary}
          disabled={disabled}
          onClick={onClick}
          {...props}
        >
          {label}
        </button>

        <span className={styles.separator} aria-hidden="true" />

        <button
          ref={toggleRef}
          className={styles.toggle}
          disabled={disabled}
          aria-label={dropdownLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className={styles.chevron}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open &&
        (typeof document !== "undefined"
          ? createPortal(panel, document.body)
          : panel)}
    </>
  );
}
