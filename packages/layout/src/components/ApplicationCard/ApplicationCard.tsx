import type { HTMLAttributes, ReactNode } from "react";
import { Card, Text } from "@gnome-ui/react";
import styles from "./ApplicationCard.module.css";

export interface ApplicationCardStat {
  label: string;
  value: string;
}

export interface ApplicationCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar slot — unconstrained ReactNode. Use `<IconBadge size="xl">` here. */
  avatar: ReactNode;
  /** Application name — primary title. */
  name: string;
  /** Optional node rendered inline next to the name (e.g. `<StatusBadge>`). */
  badge?: ReactNode;
  /** Short description rendered below the name. */
  description?: string;
  /** Horizontal row of labeled key/value stat pairs. Omitted when empty. */
  stats?: ApplicationCardStat[];
  /** Action buttons rendered below the stats row. Omitted when undefined. */
  actions?: ReactNode;
}

export function ApplicationCard({
  avatar,
  name,
  badge,
  description,
  stats,
  actions,
  className,
  ...props
}: ApplicationCardProps) {
  return (
    <Card
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className={styles.header}>
        <div className={styles.avatarSlot}>{avatar}</div>

        <div className={styles.body}>
          <div className={styles.nameRow}>
            <Text variant="title-2" className={styles.name}>{name}</Text>
            {badge && <span className={styles.badge}>{badge}</span>}
          </div>

          {description && (
            <Text variant="caption" color="dim" className={styles.description}>
              {description}
            </Text>
          )}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <Text variant="caption" color="dim" className={styles.statLabel}>
                {s.label}
              </Text>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && <div className={styles.actions}>{actions}</div>}
    </Card>
  );
}
