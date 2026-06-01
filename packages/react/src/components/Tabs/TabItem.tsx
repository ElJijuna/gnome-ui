import type { IconDefinition } from '@gnome-ui/icons';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { memo } from 'react';

import { Badge } from '../Badge';
import { Icon } from '../Icon';

import styles from './Tabs.module.css';

export interface TabItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tab label. */
  label: string;
  /** Optional icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Marks this tab as the currently selected one. */
  active?: boolean;
  /**
   * id of the `TabPanel` this tab controls.
   * Sets `aria-controls` automatically.
   */
  panelId?: string;
  /**
   * When provided, a close (×) button is rendered at the trailing edge.
   * Called when the user clicks the close button.
   */
  onClose?: () => void;
  /** Accessible label for the close button. Defaults to `"Close tab"`. */
  closeLabel?: string;
  /** Optional count shown as a badge next to the label (e.g. unread messages). Values above 99 render as "99+". */
  count?: number;
  children?: ReactNode;
}

/**
 * Individual tab button inside a `TabBar`.
 */
export const TabItem = memo(function TabItem({
  label,
  icon,
  active = false,
  panelId,
  onClose,
  closeLabel = 'Close tab',
  count,
  className,
  disabled,
  ...props
}: TabItemProps) {
  return (
    <button
      role="tab"
      type="button"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      className={[
        styles.tab,
        active ? styles.active : null,
        onClose ? styles.closeable : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && (
        <span className={styles.tabIcon}>
          <Icon icon={icon} size="sm" aria-hidden />
        </span>
      )}
      <span className={styles.tabLabel}>{label}</span>

      {count !== undefined && (
        <Badge className={styles.tabBadge}>{count > 99 ? '99+' : count}</Badge>
      )}

      {onClose && (
        <button
          type="button"
          aria-label={closeLabel}
          className={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      )}
    </button>
  );
});
