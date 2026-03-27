import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ButtonHTMLAttributes,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import type { IconDefinition } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { useSidebarCollapsed } from "./Sidebar";
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
   * Kept for backward compatibility.
   */
  badge?: ReactNode;
  /**
   * Short tooltip shown when hovering the item.
   * Useful for icon-only sidebars or when the label is truncated.
   */
  tooltip?: string;
  /**
   * Context-menu entries shown on right-click or the Menu key.
   * Mirrors the per-row context menu support in `AdwSidebar` (GNOME 50).
   */
  menuItems?: SidebarMenuEntry[];
}

/**
 * Individual navigation item inside a `Sidebar` or `SidebarSection`.
 *
 * Updated for libadwaita 1.9 / GNOME 50:
 * - `suffix` — general trailing widget (supersedes `badge`).
 * - `tooltip` — shown on hover via the `Tooltip` component.
 * - `menuItems` — context menu on right-click or Menu key.
 */
export function SidebarItem({
  label,
  icon,
  active = false,
  suffix,
  badge,
  tooltip,
  menuItems,
  className,
  ...props
}: SidebarItemProps) {
  const collapsed = useSidebarCollapsed();
  const trailing = suffix ?? badge;
  // When collapsed, always show a tooltip (fall back to the item label)
  const effectiveTooltip = collapsed ? (tooltip ?? label) : tooltip;

  // ── Context menu state ──────────────────────────────────────────────────
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback((x: number, y: number) => {
    setMenu({ x, y });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  // Close on click outside or Escape
  useEffect(() => {
    if (!menu) return;
    const handleClick = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
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

  // ── Handlers ────────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────────
  const button = (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={[
        styles.itemBtn,
        active ? styles.active : null,
        collapsed ? styles.itemCollapsed : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onContextMenu={handleContextMenu}
      onKeyDown={handleMenuKey}
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
    <li className={styles.item}>
      {effectiveTooltip
        ? <Tooltip label={effectiveTooltip} placement="right">{button}</Tooltip>
        : button}

      {/* Context menu portal */}
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
