import {
  createContext,
  useContext,
  useState,
  isValidElement,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { SearchBar } from "../SearchBar";
import { StatusPage } from "../StatusPage";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import styles from "./Sidebar.module.css";

// ─── Contexts ─────────────────────────────────────────────────────────────────

/** Provides the collapsed state to all descendant `SidebarItem` components. */
export const SidebarCollapsedContext = createContext(false);

/** Returns `true` when the nearest `Sidebar` is in collapsed (icon-only) mode. */
export function useSidebarCollapsed() {
  return useContext(SidebarCollapsedContext);
}

/** Provides the active filter string to all descendant `SidebarItem` components. */
export const SidebarFilterContext = createContext("");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively count items whose `label` matches `filter` (case-insensitive). */
function countMatchingItems(children: ReactNode, filter: string): number {
  let count = 0;
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as Record<string, unknown>;
    if (typeof props.label === "string") {
      if (props.label.toLowerCase().includes(filter.toLowerCase())) count++;
    } else if (props.children) {
      count += countMatchingItems(props.children as ReactNode, filter);
    }
  });
  return count;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * When `true`, collapses the sidebar to icon-only mode (rail/mini).
   * Labels, suffixes, and section titles are hidden; tooltips appear on hover.
   */
  collapsed?: boolean;
  /**
   * Renders a built-in `SearchBar` inside the sidebar and manages the filter
   * state internally (uncontrolled). Combine with `filter` + `onFilterChange`
   * for controlled mode.
   */
  searchable?: boolean;
  /**
   * Controlled filter string. Items whose `label` does not match
   * (case-insensitive substring) are hidden. Does not render a `SearchBar`
   * on its own — use `searchable` for the built-in search input.
   */
  filter?: string;
  /** Called when the built-in search value changes. */
  onFilterChange?: (value: string) => void;
  /**
   * Layout mode:
   * - `"sidebar"` — fixed-width panel with a border (default).
   * - `"page"` — full-width boxed-list layout for narrow viewports.
   *
   * When omitted the sidebar auto-switches to `"page"` at ≤ 400 sp,
   * mirroring `AdwSidebar` mobile behaviour.
   */
  mode?: "sidebar" | "page";
}

/**
 * Lateral navigation panel following the Adwaita `.navigation-sidebar` style.
 *
 * **Tier 11 — libadwaita 1.9 completeness:**
 * - `searchable` — built-in `SearchBar` with automatic item filtering.
 * - `filter` / `onFilterChange` — controlled external filtering.
 * - `mode` — `"sidebar"` (default) or `"page"` (boxed-list layout).
 *   Auto-switches to `"page"` at ≤ 400 sp when `mode` is unset.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 */
export function Sidebar({
  children,
  collapsed = false,
  searchable,
  filter: controlledFilter,
  onFilterChange,
  mode,
  className,
  ...props
}: SidebarProps) {
  const [internalFilter, setInternalFilter] = useState("");
  const { isNarrow } = useBreakpoint();

  const isControlled = controlledFilter !== undefined;
  const filterValue = isControlled ? controlledFilter : internalFilter;

  const handleFilterChange = (v: string) => {
    if (!isControlled) setInternalFilter(v);
    onFilterChange?.(v);
  };

  const isFilterActive = filterValue.length > 0;
  const effectiveMode = mode ?? (isNarrow ? "page" : "sidebar");
  const hasMatches = !isFilterActive || countMatchingItems(children, filterValue) > 0;

  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      <SidebarFilterContext.Provider value={filterValue}>
        <nav
          className={[
            styles.sidebar,
            collapsed ? styles.collapsed : null,
            effectiveMode === "page" ? styles.pageMode : null,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {searchable && (
            <div className={styles.searchWrap}>
              <SearchBar
                open
                value={filterValue}
                onChange={(e) => handleFilterChange(e.target.value)}
                onClose={() => handleFilterChange("")}
                onClear={() => handleFilterChange("")}
                inline
              />
            </div>
          )}

          {isFilterActive && !hasMatches ? (
            <StatusPage
              title="No Results"
              description="No items match your search."
              compact
            />
          ) : (
            children
          )}
        </nav>
      </SidebarFilterContext.Provider>
    </SidebarCollapsedContext.Provider>
  );
}
