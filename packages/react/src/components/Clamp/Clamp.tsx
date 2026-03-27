import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Clamp.module.css";

export interface ClampProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum content width in pixels.
   * The element shrinks freely below this value.
   * Defaults to `600` — the Adwaita recommended narrow-content width.
   */
  maximumSize?: number;
  /**
   * Fractional width (0–1) of the viewport to use when the viewport is
   * narrower than `maximumSize`. Useful for keeping a comfortable margin
   * on medium-width screens. Set to `1` (default) to always fill the width.
   */
  tighteningThreshold?: number;
  children?: ReactNode;
}

/**
 * Constrains its child to a maximum width while allowing it to shrink freely,
 * mirroring the Adwaita `AdwClamp` widget.
 *
 * Use this to keep readable line lengths and comfortable reading widths on
 * large screens while still filling the available space on narrow screens.
 *
 * @example
 * // Settings page — content never wider than 600 px
 * <Clamp maximumSize={600}>
 *   <BoxedList>…</BoxedList>
 * </Clamp>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Clamp.html
 */
export function Clamp({
  maximumSize = 600,
  children,
  className,
  style,
  ...props
}: ClampProps) {
  return (
    <div
      className={[styles.clamp, className].filter(Boolean).join(" ")}
      style={{ maxWidth: maximumSize, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
