import { useState, Children, useId, type HTMLAttributes, type ReactNode } from "react";
import styles from "./ExpanderRow.module.css";

export interface ExpanderRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge of the header row. */
  leading?: ReactNode;
  /**
   * Widget placed at the trailing edge of the header row, before the chevron
   * (e.g. a value label or a Switch). Stop event propagation inside it so the
   * row's toggle isn't triggered.
   */
  trailing?: ReactNode;
  /**
   * Nested rows revealed when expanded. Use `ActionRow`, `ButtonRow`, or any
   * row-shaped element — separators are inserted automatically.
   */
  children?: ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Collapsible `ActionRow` that reveals nested rows on activation.
 *
 * Mirrors `AdwExpanderRow` — the header row toggles a reveal animation exposing
 * child rows. Supports both controlled and uncontrolled expand state.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ExpanderRow.html
 */
export function ExpanderRow({
  title,
  subtitle,
  leading,
  trailing,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  ...props
}: ExpanderRowProps) {
  const isControlled = controlledExpanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const panelId = useId();
  const headerId = useId();

  const toggle = () => {
    const next = !expanded;
    if (!isControlled) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  };

  const childItems = Children.toArray(children).filter(Boolean);

  return (
    <div
      className={[styles.expanderRow, expanded ? styles.expanded : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/* ─── Header (toggle button) ─────────────────────────────────────── */}
      <button
        id={headerId}
        className={styles.header}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        {leading && <span className={styles.leading}>{leading}</span>}

        <span className={styles.content}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>

        {trailing && <span className={styles.trailing}>{trailing}</span>}

        <span className={[styles.chevronWrap, expanded ? styles.chevronOpen : null].filter(Boolean).join(" ")} aria-hidden="true">
          <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" focusable="false">
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* ─── Reveal panel ───────────────────────────────────────────────── */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={styles.panel}
      >
        <div className={styles.panelInner}>
          {childItems.map((child, i) => (
            <div key={i} className={styles.childItem}>
              <div className={styles.divider} aria-hidden="true" />
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
