import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  type ButtonHTMLAttributes,
  type DragEvent,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { useSidebarCollapsed, SidebarFilterContext } from "./Sidebar";
import styles from "./Sidebar.module.css";

export interface SidebarMenuEntry {
  /** Label shown in the context menu. */
  label: string;
  /** Called when the entry is clicked. */
  onClick: () => void;
  /** Renders the entry in red. Use for destructive actions. */
  destructive?: boolean;
  /** Disables the entry. */
  disabled?: boolean;
}

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary label. */
  label: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Marks this item as the currently active view. */
  active?: boolean;
  /**
   * Trailing widget — any ReactNode (badge, button, icon…).
   * Supersedes `badge` when both are provided.
   */
  suffix?: ReactNode;
  /**
   * @deprecated Use `suffix` instead.
   */
  badge?: ReactNode;
  /**
   * Short tooltip shown when hovering the item.
   * Automatically shown when the sidebar is `collapsed`.
   */
  tooltip?: string;
  /**
   * Context-menu entries shown on right-click or the Menu key.
   */
  menuItems?: SidebarMenuEntry[];
  /**
   * Called when a dragged item is dropped onto this row.
   * Mirrors `AdwSidebar` per-row drop target support (libadwaita 1.9).
   */
  onDrop?: (e: DragEvent<HTMLButtonElement>) => void;
  /**
   * MIME types this row accepts as drop targets (e.g. `["text/plain"]`).
   * When provided, drops of other types are rejected via `e.preventDefault()`.
   * When omitted, all types are accepted.
   */
  acceptTypes?: string[];
}

/**
 * Individual navigation item inside a `Sidebar` or `SidebarSection`.
 *
 * **Tier 11 additions:**
 * - Automatically hidden when `Sidebar`'s `filter` / `searchable` is active
 *   and the `label` does not match (case-insensitive substring).
 * - `onDrop` / `acceptTypes` — HTML5 drag-and-drop target support.
 */
export function SidebarItem({
  label,
  icon,
  active = false,
  suffix,
  badge,
  tooltip,
  menuItems,
  onDrop,
  acceptTypes,
  className,
  ...props
}: SidebarItemProps) {
  const collapsed = useSidebarCollapsed();
  const filterValue = useContext(SidebarFilterContext);
  const trailing = suffix ?? badge;
  const effectiveTooltip = collapsed ? (tooltip ?? label) : tooltip;

  // ── Filter visibility ────────────────────────────────────────────────────
  const isFiltered =
    filterValue.length > 0 &&
    !label.toLowerCase().includes(filterValue.toLowerCase());

  // ── Drag-and-drop ────────────────────────────────────────────────────────
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    if (!onDrop) return;
    if (acceptTypes?.length) {
      const accepted = acceptTypes.some((t) => e.dataTransfer.types.includes(t));
      if (!accepted) return;
    }
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    if (!onDrop) return;
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e);
  };

  // ── Context menu ─────────────────────────────────────────────────────────
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback((x: number, y: number) => setMenu({ x, y }), []);
  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    if (!menu) return;
    const handleClick = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menu, closeMenu]);

  const handleContextMenu = (e: MouseEvent<HTMLButtonElement>) => {
    if (!menuItems?.length) return;
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  };

  const handleMenuKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
      if (!menuItems?.length) return;
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      openMenu(rect.right, rect.top);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const button = (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={[
        styles.itemBtn,
        active ? styles.active : null,
        collapsed ? styles.itemCollapsed : null,
        isDragOver ? styles.dragOver : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onContextMenu={handleContextMenu}
      onKeyDown={handleMenuKey}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      {icon && (
        <span className={styles.itemIcon}>
          <Icon icon={icon} size="md" aria-hidden />
        </span>
      )}
      {!collapsed && <span className={styles.itemLabel}>{label}</span>}
      {!collapsed && trailing && <span className={styles.itemSuffix}>{trailing}</span>}
    </button>
  );

  return (
    <li className={styles.item} hidden={isFiltered || undefined}>
      {effectiveTooltip
        ? <Tooltip label={effectiveTooltip} placement="right">{button}</Tooltip>
        : button}

      {menu && menuItems?.length && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.contextMenu}
            style={{ top: menu.y, left: menu.x }}
            role="menu"
          >
            {menuItems.map((entry) => (
              <button
                key={entry.label}
                type="button"
                role="menuitem"
                disabled={entry.disabled}
                className={[
                  styles.contextMenuItem,
                  entry.destructive ? styles.contextMenuDestructive : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  entry.onClick();
                  closeMenu();
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </li>
  );
}
