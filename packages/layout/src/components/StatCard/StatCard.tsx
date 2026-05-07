import type { HTMLAttributes, ReactNode } from "react";
import { Card, Skeleton, Text, useLocale } from "@gnome-ui/react";
import styles from "./StatCard.module.css";

export type StatCardTrendDirection = "up" | "down" | "neutral";

export interface StatCardTrend {
  direction: StatCardTrendDirection;
  value: number;
  period?: string;
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Metric label. */
  label: string;
  /** Primary value. */
  value: number | string;
  /** Optional unit suffix shown next to the value. */
  unit?: string;
  /** Optional trend indicator. */
  trend?: StatCardTrend;
  /** Optional visual element rendered in the top-right corner. */
  icon?: ReactNode;
  /** Render a skeleton loading state. */
  loading?: boolean;
}

const TREND_SYMBOL: Record<StatCardTrendDirection, string> = {
  up: "up",
  down: "down",
  neutral: "steady",
};

function formatValue(value: number | string, locale: string | undefined) {
  return typeof value === "number"
    ? new Intl.NumberFormat(locale).format(value)
    : value;
}

function formatTrendValue(value: number, locale: string | undefined) {
  return `${value > 0 ? "+" : ""}${new Intl.NumberFormat(locale).format(value)}%`;
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  const locale = useLocale();

  if (loading) {
    return (
      <Card
        className={[styles.card, styles.loading, className]
          .filter(Boolean)
          .join(" ")}
        aria-busy="true"
        {...props}
      >
        <div className={styles.header}>
          <Skeleton variant="rect" width={110} height={14} />
          {icon && <Skeleton variant="circle" size={30} />}
        </div>
        <Skeleton variant="rect" width={150} height={34} />
        <Skeleton variant="rect" width={120} height={14} />
      </Card>
    );
  }

  const displayValue = formatValue(value, locale);
  const accessibleValue = unit ? `${displayValue} ${unit}` : displayValue;

  return (
    <Card
      className={[styles.card, className].filter(Boolean).join(" ")}
      {...props}
    >
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

      <div
        className={styles.valueRow}
        aria-label={`${label}: ${accessibleValue}`}
      >
        <Text variant="title-2" as="span" className={styles.value}>
          {displayValue}
        </Text>
        {unit && (
          <Text variant="caption" as="span" color="dim" className={styles.unit}>
            {unit}
          </Text>
        )}
      </div>

      {trend && (
        <Text
          variant="caption"
          as="span"
          className={[styles.trend, styles[trend.direction]]
            .filter(Boolean)
            .join(" ")}
        >
          <span aria-hidden="true">{TREND_SYMBOL[trend.direction]}</span>
          <span className={styles.trendValue}>{formatTrendValue(trend.value, locale)}</span>
          {trend.period && (
            <span className={styles.period}>{trend.period}</span>
          )}
        </Text>
      )}
    </Card>
  );
}
