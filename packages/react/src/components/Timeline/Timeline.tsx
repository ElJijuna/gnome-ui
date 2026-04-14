import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Timeline.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineVariant = "default" | "dotted" | "none";

export interface TimelineItem {
  /** Icon rendered inside the timeline node. */
  icon?: ReactNode;
  /**
   * Content at the leading edge of the node.
   * - **Vertical:** rendered to the left of the connector track.
   * - **Horizontal:** rendered above the node.
   *
   * Typical use: timestamp, badge, short label.
   */
  leading?: ReactNode;
  /** Main event content rendered adjacent to the node (title, description…). */
  content: ReactNode;
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  /** Ordered list of timeline events. */
  items: TimelineItem[];
  /**
   * Axis direction of the connector line.
   * - `"vertical"` — events stack top-to-bottom (default).
   * - `"horizontal"` — events flow left-to-right (stepper / progress pattern).
   */
  orientation?: TimelineOrientation;
  /**
   * Visual style of the connector between nodes.
   * - `"default"` — solid thin line.
   * - `"dotted"` — dotted line; useful for future or pending events.
   * - `"none"` — no connector; each node stands alone.
   */
  variant?: TimelineVariant;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Ordered sequence of events connected by a visual timeline.
 *
 * Supports two orientations — vertical (activity feed, history log) and
 * horizontal (stepper, progress indicator) — and three connector styles.
 *
 * ```tsx
 * <Timeline
 *   items={[
 *     {
 *       leading: <Text variant="caption" color="dim">10:32</Text>,
 *       icon: <Icon icon={Check} />,
 *       content: <Text variant="body">Approved</Text>,
 *     },
 *   ]}
 * />
 *
 * <Timeline orientation="horizontal" variant="dotted" items={steps} />
 * ```
 */
export function Timeline({
  items,
  orientation = "vertical",
  variant = "default",
  className,
  ...props
}: TimelineProps) {
  const horizontal = orientation === "horizontal";
  const showLine = variant !== "none";

  return (
    <div
      role="list"
      className={[
        styles.root,
        horizontal ? styles.horizontal : styles.vertical,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;

        const lineClass = [
          styles.line,
          variant === "dotted" ? styles.lineDotted : null,
        ]
          .filter(Boolean)
          .join(" ");

        const node = (
          <div
            className={[
              styles.node,
              item.icon ? styles.nodeWithIcon : styles.nodeDot,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.icon && (
              <span className={styles.iconWrap} aria-hidden="true">
                {item.icon}
              </span>
            )}
          </div>
        );

        return (
          <div key={i} role="listitem" className={styles.item}>
            {/* ── Leading (timestamp / label) ── */}
            {/* Always rendered — even when empty — so every item has the same
                3 children (leading · nodeTrack · content) that map to the
                subgrid columns (vertical) or rows (horizontal). */}
            <div className={styles.leading}>{item.leading}</div>

            {/* ── Node track ── */}
            {horizontal ? (
              /*
               * Always render both half-lines so the node stays centered in
               * the item regardless of its position. Edge lines are hidden
               * with visibility:hidden (take space, invisible).
               */
              <div className={styles.nodeTrack}>
                <div
                  className={[
                    styles.line,
                    variant === "dotted" ? styles.lineDotted : null,
                    (isFirst || !showLine) ? styles.lineInvisible : null,
                  ].filter(Boolean).join(" ")}
                  aria-hidden="true"
                />
                {node}
                <div
                  className={[
                    styles.line,
                    variant === "dotted" ? styles.lineDotted : null,
                    (isLast || !showLine) ? styles.lineInvisible : null,
                  ].filter(Boolean).join(" ")}
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className={styles.nodeTrack}>
                {node}
                {!isLast && showLine && (
                  <div className={lineClass} aria-hidden="true" />
                )}
              </div>
            )}

            {/* ── Content ── */}
            <div className={styles.content}>{item.content}</div>
          </div>
        );
      })}
    </div>
  );
}
