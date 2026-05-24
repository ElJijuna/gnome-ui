import type { HTMLAttributes, ReactNode } from "react";
import { Avatar, Card, Skeleton, Spinner, Text } from "@gnome-ui/react";
import type { AvatarColor } from "@gnome-ui/react";
import type { LoadingType } from "../StatCard";
import styles from "./ProfileCard.module.css";

export interface ProfileCardStat {
  label: string;
  value: string | number;
}

export type ProfileCardStatus = "online" | "offline" | "away" | "busy";

export interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Full display name. Also drives the avatar initials and color. */
  name: string;
  /** Handle or secondary identifier shown below the name (e.g. `"@rcronald"`). */
  username: string;
  /** Avatar image URL. Falls back to initials when omitted. */
  avatarSrc?: string;
  /** Override the auto-derived avatar background color. */
  avatarColor?: AvatarColor;
  /** Presence dot overlaid on the bottom-right corner of the avatar. */
  status?: ProfileCardStatus;
  /** Optional row of metric items shown below the username. */
  stats?: ProfileCardStat[];
  /** Decorative chart or visual rendered behind the card content. */
  backgroundChart?: ReactNode;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
  /** When true the card becomes clickable (Adwaita `.activatable`). */
  interactive?: boolean;
  /** Click handler for interactive cards. */
  onClick?: () => void;
}

export function ProfileCard({
  name,
  username,
  avatarSrc,
  avatarColor,
  status,
  stats,
  backgroundChart,
  loading = false,
  loadingType = "skeleton",
  className,
  ...props
}: ProfileCardProps) {
  if (loading) {
    const rootClass = [styles.card, className].filter(Boolean).join(" ");

    if (loadingType === "spinner") {
      return (
        <Card className={rootClass} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </Card>
      );
    }

    return (
      <Card className={rootClass} aria-busy="true" {...props}>
        <div className={styles.content}>
          <Skeleton variant="circle" size={48} />
          <div className={styles.identity}>
            <Skeleton variant="rect" width={120} height={14} />
            <Skeleton variant="rect" width={90} height={12} style={{ marginTop: 2 }} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={[
        styles.card,
        backgroundChart ? styles.withChart : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {backgroundChart && (
        <div className={styles.backgroundChart} aria-hidden="true">
          {backgroundChart}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.avatarWrapper}>
          <Avatar name={name} src={avatarSrc} color={avatarColor} size="lg" />
          {status && (
            <span
              className={[styles.statusDot, styles[status]].join(" ")}
              role="img"
              aria-label={status}
            />
          )}
        </div>

        <div className={styles.identity}>
          <Text variant="body" className={styles.name}>
            {name}
          </Text>
          <Text variant="caption" color="dim" className={styles.username}>
            {username}
          </Text>

          {stats && stats.length > 0 && (
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <Text variant="body" as="span" className={styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text
                    variant="caption"
                    color="dim"
                    as="span"
                    className={styles.statLabel}
                  >
                    {stat.label}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
