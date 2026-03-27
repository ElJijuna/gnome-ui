import {
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Search, Close } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./SearchBar.module.css";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Whether the search bar is visible/expanded.
   * When `false` the bar collapses to zero height and is hidden from AT.
   */
  open: boolean;
  /** Called when the user presses Escape or clicks the clear button with empty value. */
  onClose?: () => void;
  /** Called when the clear (×) button is clicked. Also clears the input value. */
  onClear?: () => void;
  /**
   * Content to render below the search bar (e.g. filter chips).
   * Only visible while `open` is true.
   */
  children?: ReactNode;
  /**
   * Removes the header-bar background so the bar blends into any surface.
   * Use inside cards, content areas, or custom containers.
   * Mirrors the `.inline` style class.
   */
  inline?: boolean;
}

/**
 * Collapsible search bar following the Adwaita `AdwSearchBar` pattern.
 *
 * - Slides in/out with a CSS height transition.
 * - Auto-focuses the input when `open` becomes `true`.
 * - Escape key calls `onClose`.
 * - Shows a clear (×) button whenever the input has a value.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.SearchBar.html
 */
export function SearchBar({
  open,
  onClose,
  onClear,
  children,
  value,
  onChange,
  placeholder = "Search…",
  disabled,
  inline = false,
  className,
  ...props
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when opening
  useEffect(() => {
    if (open) {
      // Defer so the CSS transition has begun and the element is interactable
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      props.onKeyDown?.(e);
    },
    [onClose, props]
  );

  const hasValue = value !== undefined && value !== "";

  return (
    <div
      className={[styles.wrapper, open ? styles.open : null, className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!open}
    >
      <div className={[styles.bar, inline ? styles.inline : null, disabled ? styles.disabled : null].filter(Boolean).join(" ")}>
        {/* Search icon */}
        <span className={styles.searchIcon} aria-hidden>
          <Icon icon={Search} size="md" />
        </span>

        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          tabIndex={open ? undefined : -1}
          className={styles.input}
          onKeyDown={handleKeyDown}
          {...props}
        />

        {/* Clear button — shown only when there is a value */}
        {hasValue && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear search"
            tabIndex={open ? undefined : -1}
            disabled={disabled}
            onClick={() => {
              onClear?.();
              inputRef.current?.focus();
            }}
          >
            <Icon icon={Close} size="md" />
          </button>
        )}
      </div>

      {children && (
        <div className={styles.filterRow}>{children}</div>
      )}
    </div>
  );
}
