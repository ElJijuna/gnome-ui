import type { IconDefinition } from '@gnome-ui/icons';
import type { ButtonHTMLAttributes } from 'react';

import { Icon } from '../Icon';

import { useInlineViewSwitcher } from './InlineViewSwitcher';
import styles from './InlineViewSwitcher.module.css';

export interface InlineViewSwitcherItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** String identifier — used as the switcher's `value` when this item is active. */
  name: string;
  /** Visible label. */
  label?: string;
  /** Icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
}

/**
 * Individual view option inside an `InlineViewSwitcher`.
 *
 * Can be icon-only, label-only, or icon + label. For icon-only items always
 * provide an `aria-label` so screen readers can identify the view.
 */
export const InlineViewSwitcherItem = ({
  name,
  label,
  icon,
  disabled,
  className,
  ...props
}: InlineViewSwitcherItemProps) => {
  const { value, onValueChange, compact } = useInlineViewSwitcher();
  const active = value === name;
  // In compact mode, hide the label when an icon is present as a fallback
  const showLabel = !!label && !(compact && icon);
  const isIconOnly = !!icon && !showLabel;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(name)}
      className={[
        styles.item,
        active ? styles.active : null,
        isIconOnly ? styles.iconOnly : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && (
        <span className={styles.itemIcon}>
          <Icon icon={icon} size="md" aria-hidden />
        </span>
      )}
      {showLabel && <span className={styles.itemLabel}>{label}</span>}
    </button>
  );
};

InlineViewSwitcherItem.displayName = 'InlineViewSwitcherItem';
