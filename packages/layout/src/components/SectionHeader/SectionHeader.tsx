import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "@gnome-ui/react";
import styles from "./SectionHeader.module.css";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Section title text. */
  title: string;
  /** Optional supporting text shown below the title. */
  subtitle?: string;
  /** Optional trailing action — button, link, or menu trigger. */
  action?: ReactNode;
}

/**
 * Title row for dashboard sections with optional subtitle and trailing action slot.
 *
 * @example
 * <SectionHeader
 *   title="Recent Activity"
 *   subtitle="Last 24 hours"
 *   action={<Button variant="flat" size="sm">View all</Button>}
 * />
 */
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className={styles.text}>
        <Text variant="title-4" className={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="dim" className={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
