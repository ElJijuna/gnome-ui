import { useState, useMemo, type CSSProperties, type ReactNode } from "react";
import { useBreakpoint } from "@gnome-ui/hooks";
import {
  ViewSwitcherBar,
  ViewSwitcherItem,
  ViewSwitcherSidebar,
  ViewSwitcherSidebarItem,
  BottomSheet,
  Icon,
} from "@gnome-ui/react";
import type { IconDefinition } from "@gnome-ui/icons";
import styles from "./AdaptiveLayout.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdaptiveNavItem {
  /** Unique identifier — matched against `value`. */
  id: string;
  /** Display label. */
  label: string;
  /** Icon from `@gnome-ui/icons`. */
  icon: IconDefinition;
  /** Optional badge count. */
  badge?: number | null;
  /**
   * Group name. Items sharing the same string are wrapped in a named section
   * on desktop/tablet. On mobile they collapse into a single group button that
   * opens a BottomSheet. Items without `group` appear at root level.
   */
  group?: string;
}

export type GnomeColor =
  | "white" | "blue" | "green" | "yellow" | "orange" | "red" | "purple" | "brown";

export type GnomeColorShade = 1 | 2 | 3 | 4 | 5;

export interface AdaptiveLayoutProps {
  /** Navigation items rendered in the bar (mobile) or sidebar (tablet/desktop). */
  items: AdaptiveNavItem[];
  /** Id of the currently active item. */
  value: string;
  /** Called with the id of the newly selected item. */
  onValueChange: (id: string) => void;
  /** Content for the top HeaderBar zone — spans full width. */
  topBar?: ReactNode;
  /**
   * Content shown at the top of the sidebar in expanded mode (desktop).
   * Typically a `UserCard` with name and avatar. Hidden on mobile.
   */
  sidebarHeader?: ReactNode;
  /**
   * Content shown at the top of the sidebar in collapsed (icon-only) mode.
   * Typically just an `Avatar`. Falls back to `sidebarHeader` when omitted.
   */
  sidebarHeaderCollapsed?: ReactNode;
  /** Main scrollable content area. */
  children?: ReactNode;
  /**
   * Background color from the gnome color palette.
   * Defaults to white (`#ffffff`) when omitted.
   */
  bgColor?: GnomeColor;
  /**
   * Shade of the selected `bgColor` (1–5, lightest to darkest).
   * Defaults to `3`.
   */
  bgShade?: GnomeColorShade;
  /**
   * Opacity of the background color (0–1).
   * Defaults to `1` (fully opaque).
   */
  bgOpacity?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;

// ─── Mobile bar slot types ────────────────────────────────────────────────────

type ItemSlot  = { type: "item";  item: AdaptiveNavItem };
type GroupSlot = { type: "group"; groupName: string; icon: IconDefinition; groupItems: AdaptiveNavItem[] };
type BarSlot   = ItemSlot | GroupSlot;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Application shell that automatically switches between a bottom
 * `ViewSwitcherBar` (mobile) and a collapsible `ViewSwitcherSidebar`
 * (tablet / desktop) based on the current viewport width.
 *
 * Breakpoints:
 * - **Mobile** (≤ 400 px): `ViewSwitcherBar` pinned at the bottom.
 * - **Tablet** (401–860 px): `ViewSwitcherSidebar` collapsed (icon-only).
 * - **Desktop** (> 860 px): `ViewSwitcherSidebar` expanded (icon + label).
 *
 * Mobile overflow: when there are more than 4 bar slots the first 3 are shown
 * and a "More" button opens a `BottomSheet` for the rest.
 */
export function AdaptiveLayout({
  items,
  value,
  onValueChange,
  topBar,
  sidebarHeader,
  sidebarHeaderCollapsed,
  children,
  bgColor,
  bgShade = 3,
  bgOpacity = 1,
}: AdaptiveLayoutProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState<string | undefined>();
  const [sheetItems, setSheetItems] = useState<AdaptiveNavItem[]>([]);

  // Tablet always icon-only; desktop expanded by default, user can toggle.
  const sidebarCollapsed = isTablet || (userCollapsed ?? false);

  const bgStyle: CSSProperties =
    !bgColor || bgColor === "white"
      ? bgOpacity < 1
        ? { background: `rgba(255, 255, 255, ${bgOpacity})` }
        : {}
      : { background: `color-mix(in srgb, var(--gnome-${bgColor}-${bgShade}) ${bgOpacity * 100}%, transparent)` };

  // ── Mobile: compute bar slots ──────────────────────────────────────────────
  const barSlots = useMemo<BarSlot[]>(() => {
    const slots: BarSlot[] = [];
    const seenGroups = new Set<string>();
    for (const item of items) {
      if (!item.group) {
        slots.push({ type: "item", item });
      } else if (!seenGroups.has(item.group)) {
        seenGroups.add(item.group);
        const groupItems = items.filter((i) => i.group === item.group);
        slots.push({ type: "group", groupName: item.group, icon: groupItems[0].icon, groupItems });
      }
    }
    return slots;
  }, [items]);

  const hasOverflow   = barSlots.length > 4;
  const visibleSlots  = hasOverflow ? barSlots.slice(0, MAX_VISIBLE) : barSlots;
  const overflowSlots = hasOverflow ? barSlots.slice(MAX_VISIBLE) : [];

  const overflowItems = useMemo(
    () => overflowSlots.flatMap((s) => (s.type === "item" ? [s.item] : s.groupItems)),
    [overflowSlots],
  );
  const moreIsActive = overflowItems.some((i) => i.id === value);

  // ── Sheet helpers ──────────────────────────────────────────────────────────
  function openGroupSheet(groupName: string, groupItems: AdaptiveNavItem[]) {
    setSheetTitle(groupName);
    setSheetItems(groupItems);
    setSheetOpen(true);
  }

  function openMoreSheet() {
    setSheetTitle(undefined);
    setSheetItems(overflowItems);
    setSheetOpen(true);
  }

  function handleSheetSelect(id: string) {
    onValueChange(id);
    setSheetOpen(false);
  }

  // ── Sidebar header node ────────────────────────────────────────────────────
  const headerNode = sidebarCollapsed
    ? (sidebarHeaderCollapsed ?? sidebarHeader)
    : sidebarHeader;

  // ── Sidebar items (ungrouped + grouped sections) ───────────────────────────
  const ungroupedItems = items.filter((i) => !i.group);
  const groupNames = [...new Set(items.filter((i) => i.group).map((i) => i.group as string))];

  // ── Mobile render ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div className={styles.root} style={bgStyle}>
          {topBar && <div className={styles.topBarSlot}>{topBar}</div>}
          <div className={styles.contentSlot}>{children}</div>

          <ViewSwitcherBar>
            {visibleSlots.map((slot) => {
              if (slot.type === "item") {
                return (
                  <ViewSwitcherItem
                    key={slot.item.id}
                    label={slot.item.label}
                    icon={slot.item.icon}
                    active={slot.item.id === value}
                    onClick={() => onValueChange(slot.item.id)}
                  />
                );
              }
              const groupActive = slot.groupItems.some((i) => i.id === value);
              return (
                <ViewSwitcherItem
                  key={slot.groupName}
                  label={slot.groupName}
                  icon={slot.icon}
                  active={groupActive}
                  onClick={() => openGroupSheet(slot.groupName, slot.groupItems)}
                />
              );
            })}

            {hasOverflow && (
              <button
                type="button"
                className={[styles.moreBtn, moreIsActive ? styles.moreBtnActive : null]
                  .filter(Boolean).join(" ")}
                onClick={openMoreSheet}
                aria-label="More navigation items"
              >
                <span className={styles.moreDots} aria-hidden="true">···</span>
                <span className={styles.moreLabel}>More</span>
              </button>
            )}
          </ViewSwitcherBar>
        </div>

        <BottomSheet
          open={sheetOpen}
          title={sheetTitle}
          onClose={() => setSheetOpen(false)}
        >
          <ul className={styles.sheetList}>
            {sheetItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    styles.sheetItem,
                    item.id === value ? styles.sheetItemActive : null,
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSheetSelect(item.id)}
                >
                  <Icon icon={item.icon} size="md" aria-hidden className={styles.sheetItemIcon} />
                  <span className={styles.sheetItemLabel}>{item.label}</span>
                  {item.badge != null && (
                    <span className={styles.sheetItemBadge}>{item.badge > 99 ? "99+" : item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </BottomSheet>
      </>
    );
  }

  // ── Collapse toggle footer ─────────────────────────────────────────────────
  const collapseFooter = (
    <button
      type="button"
      className={styles.collapseBtn}
      onClick={() => setUserCollapsed(!sidebarCollapsed)}
      aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span>
      {!sidebarCollapsed && <span className={styles.collapseBtnLabel}>Compress</span>}
    </button>
  );

  // ── Tablet / Desktop ───────────────────────────────────────────────────────
  return (
    <div className={styles.root} style={bgStyle}>
      {topBar && <div className={styles.topBarSlot}>{topBar}</div>}

      <div className={styles.body}>
        <ViewSwitcherSidebar
          value={value}
          onValueChange={onValueChange}
          collapsed={sidebarCollapsed}
          header={headerNode}
          footer={collapseFooter}
        >
          {ungroupedItems.map((item) => (
            <ViewSwitcherSidebarItem
              key={item.id}
              name={item.id}
              label={item.label}
              icon={item.icon}
              count={item.badge ?? undefined}
            />
          ))}

          {groupNames.map((groupName) => {
            const groupItems = items.filter((i) => i.group === groupName);
            return (
              <li key={groupName} className={styles.sidebarGroup}>
                {!sidebarCollapsed && (
                  <span className={styles.sidebarGroupLabel}>{groupName}</span>
                )}
                {groupItems.map((item) => (
                  <ViewSwitcherSidebarItem
                    key={item.id}
                    name={item.id}
                    label={item.label}
                    icon={item.icon}
                    count={item.badge ?? undefined}
                  />
                ))}
              </li>
            );
          })}
        </ViewSwitcherSidebar>

        <div className={styles.contentSlot}>{children}</div>
      </div>
    </div>
  );
}
