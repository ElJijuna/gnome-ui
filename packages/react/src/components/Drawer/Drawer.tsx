import type { IconDefinition } from '@gnome-ui/icons';
import {
  type CSSProperties,
  createContext,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';

import { createPortal } from 'react-dom';

import { Button } from '@/components/Button/Button';
import { FOCUSABLE, trapFocus, useVisualViewport } from '@/components/Dialog/dialogUtils';
import { IconButton } from '@/components/IconButton';

import styles from './Drawer.module.css';

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'classic' | 'wide';

export interface DrawerRailItem {
  /** Stable unique identifier. */
  id: string;
  /** Icon shown for this rail entry. */
  icon: IconDefinition;
  /** Accessible name, also used as the tooltip. */
  label: string;
  /** Whether this entry represents the currently visible drawer/panel. */
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'title'> {
  /** Whether the drawer is visible. */
  open: boolean;
  /** Edge that the drawer slides in from. Defaults to `"right"`. */
  side?: DrawerSide;
  /** Preset drawer width. Defaults to `"classic"`. */
  size?: DrawerSize;
  /** Optional drawer heading. */
  title?: ReactNode;
  /** Drawer content when a prop is preferred over `children`. */
  content?: ReactNode;
  /** Drawer content. Used when `content` is not provided. */
  children?: ReactNode;
  /** Called when the user dismisses the drawer with Escape or the backdrop. */
  onClose?: () => void;
  /** Whether clicking the backdrop closes the drawer. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /**
   * Narrow icon rail rendered on the drawer's inner edge (the edge facing
   * the backdrop), for switching between related drawers or panels without
   * closing the drawer. Purely presentational — clicking an entry only
   * calls its `onClick`; the caller decides what happens (swap `content`,
   * open a different drawer, etc).
   */
  rail?: DrawerRailItem[];
}

const DrawerDepthContext = createContext(0);

const DRAWER_PRESET_WIDTH: Record<DrawerSize, number> = { classic: 420, wide: 640 };
const DRAWER_DEPTH_SCALE = 0.85;
const DRAWER_MIN_WIDTH = 240;

/**
 * Slide-over panel for supplementary content.
 *
 * The drawer is controlled through `open`, renders into `document.body`, and
 * accepts its body as either `content` or `children`.
 *
 * Drawers opened from within another drawer's content are automatically
 * narrower than their parent — each nesting level scales the preset width
 * down (detected via context, so it works across the `document.body`
 * portal) until it hits a minimum width.
 */
export const Drawer = ({
  open,
  side = 'right',
  size = 'classic',
  title,
  content,
  children,
  onClose,
  closeOnBackdrop = true,
  className,
  style,
  rail,
  ...props
}: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);
  const viewportStyle = useVisualViewport();
  const body = content !== undefined ? content : children;
  const depth = useContext(DrawerDepthContext);

  const presetWidth = DRAWER_PRESET_WIDTH[size];
  const scaledWidth =
    depth > 0
      ? Math.max(DRAWER_MIN_WIDTH, Math.round(presetWidth * DRAWER_DEPTH_SCALE ** depth))
      : presetWidth;

  const drawerStyle = {
    ...style,
    '--gnome-drawer-preset-width': `${scaledWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();

        return;
      }

      trapFocus(event, drawerRef);
    },
    [onClose],
  );

  if (!open) {
    return null;
  }

  const node = (
    <div
      className={styles.backdrop}
      style={viewportStyle}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        data-side={side}
        data-size={size}
        className={[
          styles.drawer,
          side === 'left' ? styles.left : styles.right,
          size === 'wide' ? styles.wide : styles.classic,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={drawerStyle}
        onKeyDown={handleKeyDown}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {rail && rail.length > 0 && side === 'right' && (
          <nav className={styles.rail} aria-label="Drawer navigation">
            {rail.map((item) => (
              <IconButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                tooltip={item.label}
                tooltipPlacement="left"
                variant="flat"
                size="sm"
                aria-pressed={Boolean(item.active)}
                disabled={item.disabled}
                onClick={item.onClick}
              />
            ))}
          </nav>
        )}

        <div className={styles.panel}>
          {title && (
            <div id={titleId} className={styles.title}>
              <span className={styles.titleText}>{title}</span>
              {onClose && (
                <Button
                  variant="flat"
                  shape="circular"
                  size="sm"
                  aria-label="Close"
                  onClick={onClose}
                >
                  ✕
                </Button>
              )}
            </div>
          )}
          {body !== undefined && (
            <div className={styles.content}>
              <DrawerDepthContext.Provider value={depth + 1}>{body}</DrawerDepthContext.Provider>
            </div>
          )}
        </div>

        {rail && rail.length > 0 && side === 'left' && (
          <nav className={styles.rail} aria-label="Drawer navigation">
            {rail.map((item) => (
              <IconButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                tooltip={item.label}
                tooltipPlacement="right"
                variant="flat"
                size="sm"
                aria-pressed={Boolean(item.active)}
                disabled={item.disabled}
                onClick={item.onClick}
              />
            ))}
          </nav>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return node;
  }

  return createPortal(node, document.body);
};
