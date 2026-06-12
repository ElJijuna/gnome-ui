import type { AnyIconDefinition } from '@gnome-ui/icons';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { Icon } from '../Icon';
import { Popover, type PopoverPlacement } from '../Popover';

import styles from './PopoverMenu.module.css';

export interface PopoverMenuItem {
  /** Stable item id. */
  id: string;
  /** Visible item label. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: AnyIconDefinition;
  /** Optional shortcut hint, e.g. `Ctrl+S`. */
  shortcut?: ReactNode;
  /** Disabled menu items are visible but not activatable. */
  disabled?: boolean;
  /** Destructive items receive warning styling. */
  destructive?: boolean;
  /** Called when this item is activated. */
  onSelect?: () => void;
}

export interface PopoverMenuSection {
  /** Optional accessible section label. */
  label?: string;
  items: PopoverMenuItem[];
}

export interface PopoverMenuProps {
  /** Menu sections. */
  sections: PopoverMenuSection[];
  /** Preferred popover placement. */
  placement?: PopoverPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Called when the popover requests to close. */
  onClose?: () => void;
  /** Trigger element. */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}

/**
 * Context/menu popover with sections, icons, shortcuts, and disabled actions.
 */
export const PopoverMenu = ({
  sections,
  placement = 'bottom',
  open,
  onOpenChange,
  onClose,
  children,
}: PopoverMenuProps) => {
  const close = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const content = (
    <div role="menu" className={styles.menu}>
      {sections.map((section, sectionIndex) => (
        <div
          key={section.label ?? sectionIndex}
          role="group"
          aria-label={section.label}
          className={styles.section}
        >
          {section.items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={[
                styles.item,
                item.destructive ? styles.destructive : null,
                item.icon ? styles.withIcon : null,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                item.onSelect?.();
                close();
              }}
            >
              {item.icon && <Icon icon={item.icon} size="md" aria-hidden className={styles.icon} />}
              <span className={styles.label}>{item.label}</span>
              {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      placement={placement}
      open={open}
      onClose={close}
      onOpenChange={onOpenChange}
    >
      {children}
    </Popover>
  );
};
