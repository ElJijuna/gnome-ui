import type { HTMLAttributes } from 'react';

import { Avatar, type AvatarColor, type AvatarSize } from '../Avatar';

import styles from './AvatarGroup.module.css';

export interface AvatarGroupItem {
  name?: string;
  src?: string;
  alt?: string;
  color?: AvatarColor;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {
  avatars: AvatarGroupItem[];
  /** Max visible avatars before showing overflow chip. Defaults to `5`. */
  max?: number;
  /** Size applied to all avatars and the overflow chip. Defaults to `"md"`. */
  size?: AvatarSize;
}

export const AvatarGroup = ({
  avatars,
  max = 5,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  ...props
}: AvatarGroupProps) => {
  const visible = avatars.length > max ? avatars.slice(0, max) : avatars;
  const overflowCount = avatars.length > max ? avatars.length - max : 0;

  const allNames = avatars
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ');

  const label =
    ariaLabel ??
    (allNames
      ? overflowCount > 0
        ? `${allNames} and ${overflowCount} more`
        : allNames
      : 'Avatar group');

  const classes = [styles.group, styles[size], className].filter(Boolean).join(' ');

  return (
    <span role="group" aria-label={label} className={classes} {...props}>
      {visible.map((item, index) => (
        <Avatar
          key={`${item.name ?? ''}-${item.src ?? ''}-${index}`}
          name={item.name}
          src={item.src}
          alt={item.alt ?? item.name}
          color={item.color}
          size={size}
          className={styles.item}
        />
      ))}
      {overflowCount > 0 && (
        <span
          aria-label={`+${overflowCount} more`}
          className={[styles.overflow, styles[size]].filter(Boolean).join(' ')}
        >
          <span aria-hidden="true">+{overflowCount}</span>
        </span>
      )}
    </span>
  );
};
