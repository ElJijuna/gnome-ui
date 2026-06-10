import { Card, ProgressBar, Skeleton, Spinner, Text } from '@gnome-ui/react';
import type { HTMLAttributes, ReactNode } from 'react';

import { LoadingStatus } from '../LoadingStatus';
import type { LoadingType } from '../StatCard';

import styles from './ProgressCard.module.css';

export interface ProgressCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Resource name shown above the bar. */
  label: string;
  /** Amount currently used. */
  used: number;
  /** Total capacity. */
  total: number;
  /** Unit label appended to the usage text (e.g. `"GB"`, `"%"`). */
  unit: string;
  /** Optional leading icon. Rendered as decorative. */
  icon?: ReactNode;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
}

function getVariant(ratio: number) {
  if (ratio >= 0.9) {
    return 'error';
  }

  if (ratio >= 0.75) {
    return 'warning';
  }

  return 'accent';
}

export const ProgressCard = ({
  label,
  used,
  total,
  unit,
  icon,
  loading = false,
  loadingType = 'skeleton',
  className,
  ...props
}: ProgressCardProps) => {
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
          <Skeleton variant="rect" width={90} height={14} />
          {icon && <Skeleton variant="circle" size={24} />}
        </div>
        <Skeleton variant="rect" height={8} style={{ borderRadius: 4 }} />
        <Skeleton variant="rect" width={110} height={12} />
      </Card>
    );
  }

  const ratio = Math.min(1, used / total);
  const variant = getVariant(ratio);

  return (
    <Card className={[styles.card, className].filter(Boolean).join(' ')} {...props}>
      <div className={styles.header}>
        <Text variant="caption" color="dim" className={styles.label}>
          {label}
        </Text>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <ProgressBar value={ratio} variant={variant} aria-label={label} />

      <Text variant="caption" color="dim" className={styles.usage}>
        {`${used} / ${total} ${unit}`}
      </Text>
    </Card>
  );
};
