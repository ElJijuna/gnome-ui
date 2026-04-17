import {
  useRef,
  useEffect,
  useCallback,
  useId,
  useState,
  type KeyboardEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Search, Close } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { Spinner } from "../Spinner";
import styles from "./SearchBar.module.css";

export interface Suggestion {
  id: string;
  label: string;
}

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
   * Mirrors the `.inline` style class.
   */
  inline?: boolean;
  /** Suggestion items to show in the autocomplete popover. */
  suggestions?: Suggestion[];
  /** Called when the user selects a suggestion. */
  onSuggestionSelect?: (item: Suggestion) => void;
  /** Shows a spinner inside the suggestions popover while fetching async results. */
  loadingSuggestions?: boolean;
  /** Custom row renderer for each suggestion. */
  renderSuggestion?: (item: Suggestion) => ReactNode;
  /** `aria-label` for the suggestions listbox. Defaults to `"Suggestions"`. */
  suggestionsLabel?: string;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
}

/**
 * Collapsible search bar following the Adwaita `AdwSearchBar` pattern.
 *
 * - Slides in/out with a CSS height transition.
 * - Auto-focuses the input when `open` becomes `true`.
 * - Escape key calls `onClose`.
 * - Shows a clear (×) button whenever the input has a value.
 * - Optional `suggestions` / `loadingSuggestions` props show an autocomplete
 *   popover anchored below the bar — follows the GTK4 pattern of
 *   `AdwSearchBar` + `GtkPopover` + `GtkListView` (replaces `GtkEntryCompletion`).
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
  suggestions,
  onSuggestionSelect,
  loadingSuggestions = false,
  renderSuggestion,
  suggestionsLabel = "Suggestions",
  ...props
}: SearchBarProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const listboxId      = useId();
  const optionIdPrefix = useId();

  const [activeIndex,  setActiveIndex]  = useState(-1);
  const [dropdownPos,  setDropdownPos]  = useState<DropdownPos | null>(null);

  const hasSuggestions = (suggestions?.length ?? 0) > 0;
  const showDropdown   = open && (loadingSuggestions || hasSuggestions);

  // Reset active index whenever the suggestion list changes
  useEffect(() => { setActiveIndex(-1); }, [suggestions]);

  // Auto-focus when opening
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Position the suggestions dropdown below the wrapper
  useEffect(() => {
    if (!showDropdown || !wrapperRef.current) {
      setDropdownPos(null);
      return;
    }
    function updatePos() {
      if (!wrapperRef.current) return;
      const r = wrapperRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom, left: r.left, width: r.width });
    }
    updatePos();
    window.addEventListener("scroll", updatePos, { passive: true, capture: true });
    window.addEventListener("resize", updatePos, { passive: true });
    return () => {
      window.removeEventListener("scroll", updatePos, { capture: true });
      window.removeEventListener("resize", updatePos);
    };
  }, [showDropdown]);

  // Scroll the active option into view
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    (listboxRef.current.children[activeIndex] as HTMLElement | undefined)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (showDropdown && hasSuggestions && suggestions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, -1));
          return;
        }
        if (e.key === "Enter" && activeIndex >= 0) {
          e.preventDefault();
          onSuggestionSelect?.(suggestions[activeIndex]);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      props.onKeyDown?.(e);
    },
    [onClose, props, showDropdown, hasSuggestions, suggestions, activeIndex, onSuggestionSelect]
  );

  const hasValue       = value !== undefined && value !== "";
  const activeOptionId = activeIndex >= 0 && suggestions?.[activeIndex]
    ? `${optionIdPrefix}-${suggestions[activeIndex].id}`
    : undefined;

  const dropdown = showDropdown && dropdownPos
    ? createPortal(
        <ul
          ref={listboxRef}
          role="listbox"
          aria-label={suggestionsLabel}
          id={listboxId}
          className={styles.suggestionsPanel}
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
          onMouseDown={(e) => e.preventDefault()} // keep focus on input
        >
          {loadingSuggestions && (
            <li role="presentation" className={styles.suggestionsLoading}>
              <Spinner size="sm" label="Loading suggestions…" />
            </li>
          )}
          {!loadingSuggestions &&
            suggestions?.map((item, index) => (
              <li
                key={item.id}
                id={`${optionIdPrefix}-${item.id}`}
                role="option"
                aria-selected={index === activeIndex}
                className={[
                  styles.suggestionItem,
                  index === activeIndex ? styles.suggestionItemActive : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => onSuggestionSelect?.(item)}
              >
                {renderSuggestion ? renderSuggestion(item) : item.label}
              </li>
            ))}
        </ul>,
        document.body
      )
    : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={[styles.wrapper, open ? styles.open : null, className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!open}
      >
        <div
          className={[
            styles.bar,
            inline   ? styles.inline   : null,
            disabled ? styles.disabled : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.searchIcon} aria-hidden>
            <Icon icon={Search} size="md" />
          </span>

          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-activedescendant={activeOptionId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            tabIndex={open ? undefined : -1}
            className={styles.input}
            onKeyDown={handleKeyDown}
            {...props}
          />

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

        {children && <div className={styles.filterRow}>{children}</div>}
      </div>

      {typeof document !== "undefined" && dropdown}
    </>
  );
}
