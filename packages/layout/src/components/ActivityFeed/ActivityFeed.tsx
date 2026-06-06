import { Button, Skeleton, Spinner, Text, useLocale } from '@gnome-ui/react';
import { type HTMLAttributes, type ReactNode, useMemo, useState } from 'react';

import type { LoadingType } from '../StatCard';

import styles from './ActivityFeed.module.css';

export interface ActivityFeedItem {
  id: string;
  label: string;
  description?: string;
  timestamp: Date;
  icon?: ReactNode;
}

export interface ActivityFeedProps extends HTMLAttributes<HTMLDivElement> {
  /** Feed entries in descending chronological order. */
  items: ActivityFeedItem[];
  /** Truncate the list after N items; a "Show more" button reveals the rest. */
  maxItems?: number;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
  /** Content shown when `items` is empty. */
  emptyState?: ReactNode;
}

function formatRelativeTime(date: Date, rtf: Intl.RelativeTimeFormat): string {
  const diffMs = date.getTime() - Date.now();
  const absSec = Math.abs(diffMs) / 1000;

  if (absSec < 60) {
    return rtf.format(0, 'second');
  }

  if (absSec < 3_600) {
    return rtf.format(Math.round(diffMs / 60_000), 'minute');
  }

  if (absSec < 86_400) {
    return rtf.format(Math.round(diffMs / 3_600_000), 'hour');
  }

  return rtf.format(Math.round(diffMs / 86_400_000), 'day');
}

const SKELETON_COUNT = 4;

/**
 * Chronological list of recent events with relative timestamps,
 * optional icons, skeleton loading state, and a "Show more" affordance.
 *
 * @example
 * <ActivityFeed
 *   items={[
 *     { id: "1", label: "File uploaded", timestamp: new Date() },
 *   ]}
 *   maxItems={5}
 * />
 */
export const ActivityFeed = ({
  items,
  maxItems,
  loading = false,
  loadingType = 'skeleton',
  emptyState,
  className,
  ...props
}: ActivityFeedProps) => {
  const [expanded, setExpanded] = useState(false);
  const locale = useLocale();
  const rtf = useMemo(() => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }), [locale]);

  if (loading) {
    const rootClass = [styles.root, className].filter(Boolean).join(' ');

    if (loadingType === 'spinner') {
      return (
        <div className={rootClass} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </div>
      );
    }

    return (
      <div className={rootClass} aria-busy="true" {...props}>
        <ul className={styles.list} aria-label="Loading activity">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i} className={styles.item}>
              <Skeleton variant="circle" size={32} />
              <div className={styles.body}>
                <Skeleton variant="rect" width={140} height={14} />
                <Skeleton variant="rect" width={90} height={12} style={{ marginTop: 4 }} />
              </div>
              <Skeleton variant="rect" width={70} height={12} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={[styles.root, className].filter(Boolean).join(' ')} {...props}>
        {emptyState ?? null}
      </div>
    );
  }

  const truncated = maxItems !== undefined && !expanded && items.length > maxItems;
  const visible = truncated ? items.slice(0, maxItems) : items;
  const hiddenCount = items.length - (maxItems ?? items.length);

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} {...props}>
      <ul className={styles.list}>
        {visible.map((item) => (
          <li key={item.id} className={styles.item}>
            {item.icon ? (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            ) : (
              <span className={styles.dot} aria-hidden="true" />
            )}
            <div className={styles.body}>
              <Text variant="body" className={styles.label}>
                {item.label}
              </Text>
              {item.description && (
                <Text variant="caption" color="dim" className={styles.description}>
                  {item.description}
                </Text>
              )}
            </div>
            <time
              dateTime={item.timestamp.toISOString()}
              className={styles.timestamp}
              title={item.timestamp.toLocaleString()}
            >
              <Text variant="caption" color="dim">
                {formatRelativeTime(item.timestamp, rtf)}
              </Text>
            </time>
          </li>
        ))}
      </ul>
      {truncated && (
        <div className={styles.showMore}>
          <Button variant="flat" onClick={() => setExpanded(true)}>
            Show {hiddenCount} more
          </Button>
        </div>
      )}
    </div>
  );
};
