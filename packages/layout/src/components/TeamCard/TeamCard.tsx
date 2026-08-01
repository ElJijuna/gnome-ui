import type { AvatarGroupItem, AvatarSize } from '@gnome-ui/react';
import { AvatarGroup, Card, Skeleton, Spinner, Text } from '@gnome-ui/react';
import type { HTMLAttributes, ReactNode } from 'react';

import { LoadingStatus } from '../LoadingStatus';
import type { LoadingType } from '../StatCard';

import styles from './TeamCard.module.css';

export interface TeamCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Team name. */
  name: string;
  /** Optional secondary line describing the team's purpose. */
  description?: string;
  /** Members rendered in the `AvatarGroup`. */
  members: AvatarGroupItem[];
  /** Avatar size within the group. Defaults to `"md"`. */
  avatarSize?: AvatarSize;
  /** Max visible avatars before the overflow chip. Defaults to `5`. */
  maxAvatars?: number;
  /** Optional trailing action rendered next to the member count (e.g. a "View team" button). */
  action?: ReactNode;
  /** Delegates hover/active behavior to `Card`. Defaults to `true`. */
  interactive?: boolean;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
}

/**
 * Group identity card: avatar group, team name, and member count.
 *
 * Distinct from `UserCard`, which represents a single user's identity —
 * `TeamCard` is for teams, groups, or shared workspaces.
 *
 * ```tsx
 * <TeamCard
 *   name="Design"
 *   description="Product design and research"
 *   members={[{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }]}
 *   action={<Button size="sm">View team</Button>}
 * />
 * ```
 */
export const TeamCard = ({
  name,
  description,
  members,
  avatarSize = 'md',
  maxAvatars = 5,
  action,
  interactive = true,
  loading = false,
  loadingType = 'skeleton',
  className,
  ...props
}: TeamCardProps) => {
  const cardClass = [styles.card, className].filter(Boolean).join(' ');
  // `Card` renders as a <button> when interactive, which would nest the
  // `action` button/link inside it — always invalid HTML. Force non-interactive
  // whenever an action slot is present, regardless of what the caller passes.
  const cardInteractive = action ? false : interactive;

  if (loading) {
    if (loadingType === 'spinner') {
      return (
        <Card interactive={false} className={cardClass} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </Card>
      );
    }

    return (
      <Card interactive={false} className={cardClass} aria-busy="true" {...props}>
        <LoadingStatus />
        <Skeleton variant="rect" width={120} height={16} />
        <Skeleton variant="rect" width={180} height={12} style={{ marginTop: 4 }} />
        <div className={styles.avatarRow} style={{ marginTop: 12 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="circle" size={32} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card interactive={cardInteractive} className={cardClass} {...props}>
      <div className={styles.header}>
        <Text variant="body" className={styles.name}>
          {name}
        </Text>
        {description && (
          <Text variant="caption" color="dim" className={styles.description}>
            {description}
          </Text>
        )}
      </div>

      <AvatarGroup
        avatars={members}
        size={avatarSize}
        max={maxAvatars}
        className={styles.avatarGroup}
      />

      <div className={styles.footer}>
        <Text variant="caption" color="dim">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </Text>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </Card>
  );
};
