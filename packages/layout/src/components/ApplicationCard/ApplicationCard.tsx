import { Card, Skeleton, Spinner, Text } from '@gnome-ui/react';
import type { HTMLAttributes, ReactNode } from 'react';

import { LoadingStatus } from '../LoadingStatus';
import type { LoadingType } from '../StatCard';

import styles from './ApplicationCard.module.css';

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
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
}

export const ApplicationCard = ({
  avatar,
  name,
  badge,
  description,
  stats,
  actions,
  loading = false,
  loadingType = 'skeleton',
  className,
  ...props
}: ApplicationCardProps) => {
  if (loading) {
    const cardClass = [styles.card, className].filter(Boolean).join(' ');

    if (loadingType === 'spinner') {
      return (
        <Card className={cardClass} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </Card>
      );
    }

    return (
      <Card className={cardClass} aria-busy="true" {...props}>
        <LoadingStatus />
        <div className={styles.header}>
          <div className={styles.avatarSlot}>
            <Skeleton variant="circle" size={64} />
          </div>
          <div className={styles.body}>
            <Skeleton variant="rect" width={160} height={22} />
            <Skeleton variant="rect" width={220} height={12} style={{ marginTop: 4 }} />
          </div>
        </div>
        <div className={styles.stats}>
          {[80, 60, 90].map((w, i) => (
            <div key={i} className={styles.stat}>
              <Skeleton variant="rect" width={w * 0.6} height={10} />
              <Skeleton variant="rect" width={w} height={14} style={{ marginTop: 2 }} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={[styles.card, className].filter(Boolean).join(' ')} {...props}>
      <div className={styles.header}>
        <div className={styles.avatarSlot}>{avatar}</div>

        <div className={styles.body}>
          <div className={styles.nameRow}>
            <Text variant="title-2" className={styles.name}>
              {name}
            </Text>
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
};
