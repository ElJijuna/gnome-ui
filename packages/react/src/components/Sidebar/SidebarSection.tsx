import {
  forwardRef,
  useImperativeHandle,
  useState,
  useContext,
  useId,
  isValidElement,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { IconDefinition } from "@gnome-ui/icons";
import { PanDown, PanUp } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import { useSidebarCollapsed, SidebarFilterContext } from "./Sidebar";
import styles from "./Sidebar.module.css";

// ─── Filter helper ────────────────────────────────────────────────────────────

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

// ─── Handle ───────────────────────────────────────────────────────────────────

export interface SidebarSectionHandle {
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SidebarSectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Section heading. Rendered in small caps above the items.
   * Omit for an untitled section (e.g. the first group in a sidebar).
   */
  title?: string;
  /** Icon rendered left of the title. Same type as `SidebarItem.icon`. */
  icon?: IconDefinition;
  /** Whether the section body can be toggled open/closed. Defaults to `false`. */
  collapsible?: boolean;
  /** Initial open state when `collapsible` is true. Defaults to `true`. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Named group of `SidebarItem` entries inside a `Sidebar`.
 *
 * Sections are separated by a thin divider. The title and icon are optional.
 * When `collapsible` is true the body can be toggled via the header button or
 * imperatively via a `ref` (`expand`, `collapse`, `toggle`).
 *
 * In rail (icon-only) mode the body is always visible regardless of open state.
 * When a sidebar filter is active and no children match, the section is hidden.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Sidebar.html
 */
export const SidebarSection = forwardRef<SidebarSectionHandle, SidebarSectionProps>(
  function SidebarSection(
    {
      title,
      icon,
      collapsible = false,
      defaultOpen = true,
      open: controlledOpen,
      onOpenChange,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const sidebarCollapsed = useSidebarCollapsed();
    const filterValue = useContext(SidebarFilterContext);
    const bodyId = useId();

    const setAndNotify = (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    useImperativeHandle(ref, () => ({
      expand: () => setAndNotify(true),
      collapse: () => setAndNotify(false),
      toggle: () => setAndNotify(!open),
    }));

    // Hide section entirely when filter is active and no children match
    const hasVisibleChildren =
      filterValue.length === 0 || countMatchingItems(children, filterValue) > 0;

    if (!hasVisibleChildren) return null;

    // In rail mode the body is always visible
    const isOpen = sidebarCollapsed ? true : open;

    const showHeader = !!(title || icon || (collapsible && !sidebarCollapsed));

    return (
      <section
        className={[styles.section, className].filter(Boolean).join(" ")}
        {...props}
      >
        {showHeader && (
          collapsible && !sidebarCollapsed ? (
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setAndNotify(!open)}
              aria-expanded={open}
              aria-controls={bodyId}
            >
              {icon && (
                <span className={styles.sectionHeaderIcon}>
                  <Icon icon={icon} size="sm" aria-hidden />
                </span>
              )}
              {title && <span className={styles.sectionTitle}>{title}</span>}
              <span className={styles.sectionChevron}>
                <Icon icon={open ? PanUp : PanDown} size="sm" aria-hidden />
              </span>
            </button>
          ) : (
            <div className={styles.sectionHeader}>
              {icon && (
                <span className={styles.sectionHeaderIcon}>
                  <Icon icon={icon} size="sm" aria-hidden />
                </span>
              )}
              {title && <span className={styles.sectionTitle}>{title}</span>}
            </div>
          )
        )}

        <div
          id={bodyId}
          className={[
            styles.sectionBody,
            !isOpen ? styles.sectionBodyCollapsed : null,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!isOpen || undefined}
        >
          <div className={styles.sectionBodyInner}>
            <ul role="list" className={styles.list}>
              {children}
            </ul>
          </div>
        </div>
      </section>
    );
  },
);
