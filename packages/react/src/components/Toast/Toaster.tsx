import { createPortal } from "react-dom";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Toast.module.css";

export interface ToasterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Where to render the toast stack.
   * - `bottom` (default) — bottom-center, following the GNOME HIG.
   * - `top` — top-center.
   */
  position?: "bottom" | "top";
  /** `<Toast>` elements to display. */
  children?: ReactNode;
  /**
   * DOM node to render the portal into.
   * Defaults to `document.body`.
   */
  container?: Element | DocumentFragment;
}

/**
 * Fixed-position overlay that stacks `<Toast>` notifications.
 *
 * Renders into a portal (default: `document.body`) so it sits above all
 * other content regardless of where you place it in the React tree.
 *
 * @example
 * <Toaster>
 *   {toasts.map(t => (
 *     <Toast key={t.id} title={t.message} onDismiss={() => remove(t.id)} />
 *   ))}
 * </Toaster>
 */
export function Toaster({
  position = "bottom",
  children,
  container,
  className,
  ...props
}: ToasterProps) {
  const node = (
    <div
      aria-label="Notifications"
      className={[
        styles.toaster,
        position === "top" ? styles.toasterTop : styles.toasterBottom,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );

  // During SSR document is not available — render inline
  if (typeof document === "undefined") return node;

  return createPortal(node, container ?? document.body);
}
