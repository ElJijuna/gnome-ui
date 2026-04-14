import {
  forwardRef,
  useImperativeHandle,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Card, Icon, Separator, Text } from "@gnome-ui/react";
import { PanDown, PanUp } from "@gnome-ui/icons";
import styles from "./PanelCard.module.css";

// ─── Handle ───────────────────────────────────────────────────────────────────

/** Imperative handle exposed via `ref` to control the panel from outside. */
export interface PanelCardHandle {
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PanelCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  // ── Header ──────────────────────────────────────────────────────────────────
  /** Icon placed at the leading edge of the header. */
  icon?: ReactNode;
  /** Primary title text of the panel. */
  title: ReactNode;
  /** Controls rendered at the trailing edge of the header, before the chevron. */
  headerActions?: ReactNode;

  // ── Collapse (managed internally; controlled imperatively via ref) ──────────
  /**
   * Whether the panel starts expanded.
   * Defaults to `true`.
   */
  defaultExpanded?: boolean;
  /**
   * Show the collapse/expand chevron toggle in the header.
   * Set to `false` to make the panel non-collapsible.
   * Defaults to `true`.
   */
  collapsible?: boolean;
  /**
   * Notification callback fired whenever the internal expanded state changes.
   * The parent observes — it does NOT control the state.
   * Use the imperative handle (`ref`) to drive expansion from outside.
   */
  onExpandedChange?: (expanded: boolean) => void;

  // ── Body ────────────────────────────────────────────────────────────────────
  children?: ReactNode;

  // ── Footer ──────────────────────────────────────────────────────────────────
  /**
   * Leading content of the footer bar (feedback text, status badge, etc.).
   * The footer zone is only rendered when `footer` or `footerActions` is set.
   */
  footer?: ReactNode;
  /** Controls at the trailing edge of the footer bar. */
  footerActions?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Card with a structured header / body / footer layout.
 *
 * The body (and footer) can be collapsed and expanded. State is managed
 * internally; use a `ref` to drive it imperatively from a parent component:
 *
 * ```tsx
 * const panelRef = useRef<PanelCardHandle>(null);
 *
 * <button onClick={() => panelRef.current?.toggle()}>Toggle panel</button>
 *
 * <PanelCard
 *   ref={panelRef}
 *   icon={<Icon icon={FolderOpen} />}
 *   title="My Panel"
 *   headerActions={<Button variant="flat">Edit</Button>}
 *   onExpandedChange={(open) => console.log("panel:", open)}
 *   footer={<Text variant="caption" color="dim">Saved 2 min ago</Text>}
 *   footerActions={<Button variant="suggested">Save</Button>}
 * >
 *   <p>Panel body content</p>
 * </PanelCard>
 * ```
 */
export const PanelCard = forwardRef<PanelCardHandle, PanelCardProps>(
  function PanelCard(
    {
      icon,
      title,
      headerActions,
      defaultExpanded = true,
      collapsible = true,
      onExpandedChange,
      children,
      footer,
      footerActions,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const setAndNotify = (next: boolean) => {
      setExpanded(next);
      onExpandedChange?.(next);
    };

    useImperativeHandle(ref, () => ({
      expand: () => setAndNotify(true),
      collapse: () => setAndNotify(false),
      toggle: () =>
        setExpanded((prev) => {
          const next = !prev;
          onExpandedChange?.(next);
          return next;
        }),
    }));

    const hasFooter = footer !== undefined || footerActions !== undefined;

    return (
      <Card
        padding="none"
        className={[styles.root, className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}

          <div className={styles.title}>
            {typeof title === "string" ? (
              <Text variant="heading" className={styles.titleText}>
                {title}
              </Text>
            ) : (
              title
            )}
          </div>

          <div className={styles.trailing}>
            {headerActions && (
              <div className={styles.headerActions}>{headerActions}</div>
            )}
            {collapsible && (
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setAndNotify(!expanded)}
                aria-expanded={expanded}
                aria-label={expanded ? "Collapse panel" : "Expand panel"}
              >
                <Icon icon={expanded ? PanUp : PanDown} size="sm" />
              </button>
            )}
          </div>
        </div>

        {/* ── Body + Footer (collapsible zone) ── */}
        <div
          className={[
            styles.bodyWrapper,
            !expanded ? styles.bodyCollapsed : null,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!expanded || undefined}
        >
          <div className={styles.bodyInner}>
            <Separator />
            <div className={styles.body}>{children}</div>

            {hasFooter && (
              <>
                <Separator />
                <div className={styles.footer}>
                  <div className={styles.footerContent}>{footer}</div>
                  {footerActions && (
                    <div className={styles.footerActions}>{footerActions}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  },
);
