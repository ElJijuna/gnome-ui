import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./PreferencesDialog.module.css";
import type { PreferencesPageProps } from "../PreferencesPage/PreferencesPage";

// ─── Focus trap ───────────────────────────────────────────────────────────────

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(
  e: KeyboardEvent<HTMLDivElement>,
  ref: React.RefObject<HTMLDivElement | null>
) {
  if (e.key !== "Tab") return;
  const focusable = Array.from(
    ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
  );
  if (!focusable.length) return;
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
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreferencesDialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the user requests to close the dialog. */
  onClose: () => void;
  /**
   * `PreferencesPage` children. Each page appears as a sidebar entry.
   * When only one page is provided the sidebar is hidden.
   */
  children?: ReactNode;
  /**
   * Whether to show a search bar in the header.
   * When `true` the user can filter group/row content by typing.
   * Defaults to `true`.
   */
  searchable?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Multi-page settings dialog using `PreferencesPage` tabs.
 *
 * Renders a wide modal with an optional sidebar listing pages. Each
 * `PreferencesPage` child becomes a navigation entry. Supports built-in
 * search when `searchable` is `true` (the default).
 *
 * Mirrors `AdwPreferencesDialog`.
 *
 * @example
 * ```tsx
 * <PreferencesDialog open={open} onClose={() => setOpen(false)}>
 *   <PreferencesPage title="General" iconName="preferences-system-symbolic">
 *     <PreferencesGroup title="Appearance">
 *       <BoxedList>
 *         <SwitchRow title="Dark mode" />
 *       </BoxedList>
 *     </PreferencesGroup>
 *   </PreferencesPage>
 * </PreferencesDialog>
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.PreferencesDialog.html
 */
export function PreferencesDialog({
  open,
  onClose,
  children,
  searchable = true,
  className,
  ...props
}: PreferencesDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const pages = Children.toArray(children).filter(
    (c): c is ReactElement<PreferencesPageProps> =>
      isValidElement(c)
  ) as ReactElement<PreferencesPageProps>[];

  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setSearchQuery("");
      // Focus search or first focusable after open animation
      const id = requestAnimationFrame(() => {
        if (searchable && searchRef.current) {
          searchRef.current.focus();
        } else {
          const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
          first?.focus();
        }
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open, searchable]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      trapFocus(e, dialogRef);
    },
    [onClose]
  );

  const multiPage = pages.length > 1;
  const activePage = pages[activeIndex] ?? pages[0];

  // Filter content by search query
  const query = searchQuery.trim().toLowerCase();

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          styles.dialog,
          multiPage ? styles.dialogMulti : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close preferences"
          >
            ✕
          </button>
          <span id={titleId} className={styles.title}>
            Preferences
          </span>
          {searchable && (
            <div className={styles.searchWrap}>
              <input
                ref={searchRef}
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search preferences"
              />
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className={styles.body}>
          {/* Sidebar — only shown when there are multiple pages */}
          {multiPage && (
            <nav className={styles.sidebar} aria-label="Preferences pages">
              <ul role="tablist" className={styles.navList}>
                {pages.map((page, i) => (
                  <li key={i} role="presentation">
                    <button
                      role="tab"
                      type="button"
                      aria-selected={i === activeIndex}
                      className={[
                        styles.navItem,
                        i === activeIndex ? styles.navItemActive : null,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setActiveIndex(i)}
                    >
                      {page.props.iconName && (
                        <span
                          className={[
                            styles.navIcon,
                            "icon",
                            page.props.iconName,
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      )}
                      <span className={styles.navLabel}>
                        {page.props.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Page content */}
          <div className={styles.pageWrap}>
            {activePage &&
              cloneElement(activePage, {
                "data-search-query": query || undefined,
              } as Partial<PreferencesPageProps>)}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
