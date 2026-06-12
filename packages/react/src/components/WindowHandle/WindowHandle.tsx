import { WindowClose, WindowMaximize, WindowMinimize, WindowRestore } from '@gnome-ui/icons';
import type { HTMLAttributes } from 'react';

import { Icon } from '../Icon';

import styles from './WindowHandle.module.css';

export interface WindowHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the current window is maximized. Controls the maximize/restore icon. */
  maximized?: boolean;
  /** Hide the minimize control. */
  hideMinimize?: boolean;
  /** Hide the maximize/restore control. */
  hideMaximize?: boolean;
  /** Hide the close control. */
  hideClose?: boolean;
  /** Called when the minimize control is activated. */
  onMinimize?: () => void;
  /** Called when the maximize/restore control is activated. */
  onToggleMaximize?: () => void;
  /** Called when the close control is activated. */
  onClose?: () => void;
}

/**
 * GNOME-style window controls for desktop shells.
 *
 * The controls expose `data-window-action` attributes so native host bridges
 * can attach behavior without changing the React API.
 */
export const WindowHandle = ({
  maximized = false,
  hideMinimize = false,
  hideMaximize = false,
  hideClose = false,
  onMinimize,
  onToggleMaximize,
  onClose,
  className,
  ...props
}: WindowHandleProps) => {
  return (
    <div
      role="group"
      aria-label="Window controls"
      className={[styles.windowHandle, className].filter(Boolean).join(' ')}
      {...props}
    >
      {!hideMinimize && (
        <button
          type="button"
          className={styles.control}
          aria-label="Minimize"
          data-window-action="minimize"
          onClick={onMinimize}
        >
          <Icon icon={WindowMinimize} size="md" aria-hidden />
        </button>
      )}
      {!hideMaximize && (
        <button
          type="button"
          className={styles.control}
          aria-label={maximized ? 'Restore' : 'Maximize'}
          data-window-action={maximized ? 'restore' : 'maximize'}
          onClick={onToggleMaximize}
        >
          <Icon icon={maximized ? WindowRestore : WindowMaximize} size="md" aria-hidden />
        </button>
      )}
      {!hideClose && (
        <button
          type="button"
          className={[styles.control, styles.close].join(' ')}
          aria-label="Close"
          data-window-action="close"
          onClick={onClose}
        >
          <Icon icon={WindowClose} size="md" aria-hidden />
        </button>
      )}
    </div>
  );
};
