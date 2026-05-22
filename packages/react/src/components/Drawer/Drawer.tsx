import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button";
import { FOCUSABLE, trapFocus, useVisualViewport } from "../Dialog/dialogUtils";
import styles from "./Drawer.module.css";

export type DrawerSide = "left" | "right";
export type DrawerSize = "classic" | "wide";

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> {
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
}

/**
 * Slide-over panel for supplementary content.
 *
 * The drawer is controlled through `open`, renders into `document.body`, and
 * accepts its body as either `content` or `children`.
 */
export function Drawer({
  open,
  side = "right",
  size = "classic",
  title,
  content,
  children,
  onClose,
  closeOnBackdrop = true,
  className,
  ...props
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);
  const viewportStyle = useVisualViewport();
  const body = content !== undefined ? content : children;

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
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      trapFocus(event, drawerRef);
    },
    [onClose],
  );

  if (!open) return null;

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
          side === "left" ? styles.left : styles.right,
          size === "wide" ? styles.wide : styles.classic,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onKeyDown={handleKeyDown}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
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
        {body !== undefined && <div className={styles.content}>{body}</div>}
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
