import { type HTMLAttributes, type ReactNode, useId, useState } from 'react';

import styles from './Expander.module.css';

export interface ExpanderProps extends HTMLAttributes<HTMLDivElement> {
  /** Clickable header label. */
  label: ReactNode;
  /** Content revealed when expanded. */
  children?: ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Disables the toggle. */
  disabled?: boolean;
}

/**
 * Standalone disclosure triangle + collapsible content — mirrors `GtkExpander`.
 *
 * A bare, unstyled counterpart to `ExpanderRow`, which is a `BoxedList`-row
 * variant. Use `Expander` outside a settings-row context, e.g. "Show
 * advanced options" or "Show details" in a form or dialog.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Expander.html
 */
export const Expander = ({
  label,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  className,
  ...props
}: ExpanderProps) => {
  const isControlled = controlledExpanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const panelId = useId();
  const headerId = useId();

  const toggle = () => {
    const next = !expanded;

    if (!isControlled) {
      setUncontrolledExpanded(next);
    }

    onExpandedChange?.(next);
  };

  return (
    <div
      className={[styles.expander, expanded ? styles.expanded : null, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <button
        id={headerId}
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        aria-controls={panelId}
        disabled={disabled}
        onClick={toggle}
      >
        <span
          className={[styles.chevronWrap, expanded ? styles.chevronOpen : null]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          <svg
            className={styles.chevron}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            focusable="false"
          >
            <path
              d="M6 4l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className={styles.label}>{label}</span>
      </button>

      <div id={panelId} role="region" aria-labelledby={headerId} className={styles.panel}>
        <div className={styles.panelInner}>{children}</div>
      </div>
    </div>
  );
};
