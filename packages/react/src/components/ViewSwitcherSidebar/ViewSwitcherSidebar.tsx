import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./ViewSwitcherSidebar.module.css";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ViewSwitcherSidebarContextValue {
  value: string;
  onValueChange: (value: string) => void;
  collapsed: boolean;
}

const ViewSwitcherSidebarContext =
  createContext<ViewSwitcherSidebarContextValue | null>(null);

export function useViewSwitcherSidebar() {
  const ctx = useContext(ViewSwitcherSidebarContext);
  if (!ctx)
    throw new Error(
      "ViewSwitcherSidebarItem must be used inside ViewSwitcherSidebar",
    );
  return ctx;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ViewSwitcherSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Name of the currently active view. */
  value: string;
  /** Called with the new view name when the user selects an item. */
  onValueChange: (value: string) => void;
  /** Accessible label for the group. Defaults to `"Views"`. */
  "aria-label"?: string;
  /**
   * When `true`, items render icon-only (labels hidden) and the sidebar
   * shrinks to its compact width. Used by `AdaptiveLayout` on tablet viewports.
   */
  collapsed?: boolean;
  /** Rendered above the scrollable item list (e.g. user card). */
  header?: ReactNode;
  /** Rendered below the scrollable item list (e.g. collapse toggle). */
  footer?: ReactNode;
  /** Show the separator line below the header slot. Defaults to `true`. */
  showHeaderSeparator?: boolean;
  /** Show the separator line above the footer slot. Defaults to `true`. */
  showFooterSeparator?: boolean;
  children?: ReactNode;
}

/**
 * Sidebar-style view switcher for apps with more than 4 top-level views,
 * or when the sidebar layout fits better than a header-bar `ViewSwitcher`.
 *
 * Mirrors `AdwViewSwitcherSidebar` (libadwaita 1.9 / GNOME 50), the modern
 * replacement for `GtkStackSidebar`.
 *
 * Compose with `ViewSwitcherSidebarItem` for each view. The active item is
 * highlighted with the accent colour; keyboard ↑ / ↓ cycles through items.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ViewSwitcherSidebar.html
 *
 * @example
 * ```tsx
 * <ViewSwitcherSidebar value={view} onValueChange={setView}>
 *   <ViewSwitcherSidebarItem name="photos" label="Photos" icon={MediaPlay} />
 *   <ViewSwitcherSidebarItem name="albums" label="Albums" icon={Star} count={12} />
 * </ViewSwitcherSidebar>
 * ```
 */
export function ViewSwitcherSidebar({
  value,
  onValueChange,
  "aria-label": ariaLabel = "Views",
  collapsed = false,
  header,
  footer,
  showHeaderSeparator = true,
  showFooterSeparator = true,
  children,
  className,
  ...props
}: ViewSwitcherSidebarProps) {
  const groupRef = useRef<HTMLUListElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    const items = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role=radio]:not(:disabled)",
      ) ?? [],
    );
    const idx = items.findIndex((el) => el === document.activeElement);
    if (idx === -1) return;

    let next = idx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = (idx + 1) % items.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;

    e.preventDefault();
    items[next].focus();
    items[next].click();
  }

  return (
    <ViewSwitcherSidebarContext.Provider value={{ value, onValueChange, collapsed }}>
      <nav
        className={[
          styles.sidebar,
          collapsed ? styles.sidebarCollapsed : null,
          !showHeaderSeparator ? styles.noHeaderSeparator : null,
          !showFooterSeparator ? styles.noFooterSeparator : null,
          className,
        ].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {header && <div className={styles.header}>{header}</div>}
        <ul
          ref={groupRef}
          role="radiogroup"
          aria-label={ariaLabel}
          className={styles.list}
        >
          {children}
        </ul>
        {footer && <div className={styles.footer}>{footer}</div>}
      </nav>
    </ViewSwitcherSidebarContext.Provider>
  );
}
