import type { AvatarColor, AvatarSize } from '@gnome-ui/react';
import { Avatar, Separator, Skeleton, Spinner, Text } from '@gnome-ui/react';
import type { CSSProperties, HTMLAttributes } from 'react';

import type { LoadingType } from '../StatCard';

import styles from './UserCard.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserCardAction {
  label: string;
  onClick?: () => void;
  /** `"destructive"` renders the label in the danger color. */
  variant?: 'default' | 'destructive';
}

export interface UserCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Full display name. Also drives the avatar initials and color. */
  name: string;
  /** Optional secondary line (e-mail, role, handle…). */
  email?: string;
  /** Avatar image URL. Falls back to initials when omitted. */
  avatarSrc?: string;
  /** Override the auto-derived avatar background color. */
  avatarColor?: AvatarColor;
  /**
   * Avatar size.
   * Defaults to `"md"` (32 px) — works well inside a Popover.
   * Use `"lg"` for a standalone profile card.
   */
  avatarSize?: AvatarSize;
  /**
   * Layout orientation of the identity header.
   * - `"vertical"` (default) — avatar centered on top, name/email centered below.
   * - `"horizontal"` — avatar on the left, name/email on the right.
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Action items rendered below the identity header.
   * A separator is automatically inserted before the first
   * `"destructive"` action when non-destructive actions precede it.
   */
  actions?: UserCardAction[];
  /** Minimum width of the card. Defaults to `200`. */
  minWidth?: number;
  /** Render a loading placeholder. */
  loading?: boolean;
  /** Loading placeholder style. Defaults to `"skeleton"`. */
  loadingType?: LoadingType;
  style?: CSSProperties;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * User identity panel for popovers, sidebar footers, and profile pages.
 *
 * Renders an `Avatar`, a display name, an optional sub-line, and a list of
 * action buttons. A separator is automatically inserted before any
 * `"destructive"` actions.
 *
 * The component has **no card chrome** — place it inside a `Popover` or wrap
 * it in `<Card>` depending on context.
 *
 * ```tsx
 * <UserCard
 *   name="Ada Lovelace"
 *   email="ada@gnome.org"
 *   actions={[
 *     { label: "View Profile",     onClick: () => {} },
 *     { label: "Account Settings", onClick: () => {} },
 *     { label: "Sign Out",         onClick: () => {}, variant: "destructive" },
 *   ]}
 * />
 * ```
 */
const AVATAR_PX: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 48, xl: 64 };

export const UserCard = ({
  name,
  email,
  avatarSrc,
  avatarColor,
  avatarSize = 'md',
  orientation = 'vertical',
  actions = [],
  minWidth = 200,
  loading = false,
  loadingType = 'skeleton',
  className,
  style,
  ...props
}: UserCardProps) => {
  const isVertical = orientation === 'vertical';
  const avatarPx = AVATAR_PX[avatarSize] ?? 32;

  if (loading) {
    const rootClass = [styles.root, className].filter(Boolean).join(' ');

    if (loadingType === 'spinner') {
      return (
        <div className={rootClass} style={{ minWidth, ...style }} aria-busy="true" {...props}>
          <div className={styles.spinnerWrapper}>
            <Spinner size="md" />
          </div>
        </div>
      );
    }

    return (
      <div className={rootClass} style={{ minWidth, ...style }} aria-busy="true" {...props}>
        <div
          className={[styles.header, isVertical ? styles.headerVertical : null]
            .filter(Boolean)
            .join(' ')}
        >
          <Skeleton variant="circle" size={avatarPx} />
          <div
            className={[styles.identity, isVertical ? styles.identityVertical : null]
              .filter(Boolean)
              .join(' ')}
          >
            <Skeleton variant="rect" width={120} height={14} />
            <Skeleton variant="rect" width={160} height={12} style={{ marginTop: 2 }} />
          </div>
        </div>
      </div>
    );
  }

  // Insert a separator before the first destructive action when there are
  // non-destructive actions above it.
  const hasNonDestructiveBefore = (index: number) =>
    actions.slice(0, index).some((a) => a.variant !== 'destructive');

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ minWidth, ...style }}
      {...props}
    >
      {/* ── Header ── */}
      <div
        className={[styles.header, isVertical ? styles.headerVertical : null]
          .filter(Boolean)
          .join(' ')}
      >
        <Avatar name={name} src={avatarSrc} color={avatarColor} size={avatarSize} />
        <div
          className={[styles.identity, isVertical ? styles.identityVertical : null]
            .filter(Boolean)
            .join(' ')}
        >
          <Text variant="body" className={styles.name}>
            {name}
          </Text>
          {email && (
            <Text variant="caption" color="dim" className={styles.email}>
              {email}
            </Text>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      {actions.length > 0 && (
        <>
          <Separator />
          <div className={styles.actions} role="list">
            {actions.map((action, i) => (
              <div key={action.label} role="listitem">
                {action.variant === 'destructive' && hasNonDestructiveBefore(i) && <Separator />}
                <button
                  type="button"
                  className={[
                    styles.action,
                    action.variant === 'destructive' ? styles.destructive : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
