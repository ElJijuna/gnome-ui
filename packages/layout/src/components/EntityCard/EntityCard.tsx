import type { HTMLAttributes, ReactNode } from "react";
import { Card, Text } from "@gnome-ui/react";
import styles from "./EntityCard.module.css";

export interface EntityCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar slot — any ReactNode. Use `<IconBadge>` or `<Avatar>` here. */
  avatar: ReactNode;
  /** Primary label — truncated with ellipsis on overflow. */
  title: string;
  /** Optional node rendered inline next to the title (e.g. a status badge). */
  badge?: ReactNode;
  /** Optional node pinned to the far right of the card. */
  trailing?: ReactNode;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Third line below subtitle — longer description text. */
  description?: string;
  /**
   * Up to two footer meta strings: first left-aligned, second right-aligned.
   * Footer row is omitted when undefined or empty.
   */
  meta?: [string?, string?];
  /** Delegates hover/active behavior to Card. Defaults to `true`. */
  interactive?: boolean;
}

export function EntityCard({
  avatar,
  title,
  badge,
  trailing,
  subtitle,
  description,
  meta,
  interactive = true,
  className,
  ...props
}: EntityCardProps) {
  const hasMeta = meta && (meta[0] || meta[1]);

  return (
    <Card
      interactive={interactive}
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className={styles.inner}>
        <div className={styles.avatarSlot}>{avatar}</div>

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{title}</span>
            {badge && <span className={styles.badge}>{badge}</span>}
            {trailing && <span className={styles.trailing}>{trailing}</span>}
          </div>

          {subtitle && (
            <Text variant="caption" color="dim" className={styles.subtitle}>
              {subtitle}
            </Text>
          )}

          {description && (
            <Text variant="caption" color="dim" className={styles.description}>
              {description}
            </Text>
          )}
        </div>
      </div>

      {hasMeta && (
        <div className={styles.footer}>
          {meta[0] && <Text variant="caption" color="dim">{meta[0]}</Text>}
          {meta[1] && <Text variant="caption" color="dim">{meta[1]}</Text>}
        </div>
      )}
    </Card>
  );
}
