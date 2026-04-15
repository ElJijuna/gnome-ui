import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./PathBar.module.css";

export interface PathBarSegment {
  /** Display label for this path segment. */
  label: string;
  /** Opaque path value passed to `onNavigate` when the segment is clicked. */
  path: string;
  /** Optional icon placed before the label (e.g. a folder icon). */
  icon?: ReactNode;
}

export interface PathBarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Ordered path segments from root to current location.
   * The last segment is the current folder and is rendered non-interactive.
   */
  segments: PathBarSegment[];
  /**
   * Called when the user clicks on a non-current segment.
   * Receives the `path` and zero-based `index` of the clicked segment.
   */
  onNavigate?: (path: string, index: number) => void;
}

/**
 * Breadcrumb path bar for navigating a hierarchical location.
 *
 * Mirrors the location bar in GNOME Files (Nautilus). Segments are separated
 * by chevron dividers. All segments except the last are interactive — clicking
 * them calls `onNavigate`. The last segment represents the current location and
 * is rendered as a static label.
 *
 * @see https://developer.gnome.org/hig/patterns/nav/search.html
 */
export function PathBar({ segments, onNavigate, className, ...props }: PathBarProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={[styles.pathBar, className].filter(Boolean).join(" ")}
      {...props}
    >
      <ol className={styles.list} aria-label="Path segments">
        {segments.map((segment, index) => {
          const isCurrent = index === segments.length - 1;
          return (
            <li key={segment.path} className={styles.item}>
              {/* Separator chevron (not before the first segment) */}
              {index > 0 && (
                <span className={styles.separator} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" focusable="false">
                    <path
                      d="M4 2l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              {isCurrent ? (
                /* Current folder — non-interactive */
                <span
                  className={styles.current}
                  aria-current="page"
                >
                  {segment.icon && (
                    <span className={styles.icon} aria-hidden="true">{segment.icon}</span>
                  )}
                  {segment.label}
                </span>
              ) : (
                /* Ancestor folder — clickable */
                <button
                  type="button"
                  className={styles.segment}
                  onClick={() => onNavigate?.(segment.path, index)}
                >
                  {segment.icon && (
                    <span className={styles.icon} aria-hidden="true">{segment.icon}</span>
                  )}
                  {segment.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
