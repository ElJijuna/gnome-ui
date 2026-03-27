import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./WrapBox.module.css";

export type WrapBoxJustify = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
export type WrapBoxAlign = "start" | "center" | "end" | "stretch";

export interface WrapBoxProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between children on the same line. Default: `6`. */
  childSpacing?: number | string;
  /** Gap between lines. Defaults to `childSpacing`. */
  lineSpacing?: number | string;
  /** Horizontal distribution of children within each line. Default: `"start"`. */
  justify?: WrapBoxJustify;
  /** Cross-axis alignment of children within each line. Default: `"center"`. */
  align?: WrapBoxAlign;
  /** When true children wrap in the reverse direction (bottom to top). */
  wrapReverse?: boolean;
  children?: ReactNode;
}

/**
 * Flexible wrapping layout container.
 *
 * Children flow horizontally and wrap to new lines when they don't fit,
 * like words in a paragraph — without locking them into a grid.
 *
 * Mirrors `AdwWrapBox` (libadwaita 1.7 / GNOME 48).
 *
 * Pair with `Chip` for tag lists and filter rows.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.WrapBox.html
 */
export function WrapBox({
  childSpacing = 6,
  lineSpacing,
  justify = "start",
  align = "center",
  wrapReverse = false,
  children,
  className,
  style,
  ...props
}: WrapBoxProps) {
  const gap = typeof childSpacing === "number" ? `${childSpacing}px` : childSpacing;
  const rowGap = lineSpacing != null
    ? (typeof lineSpacing === "number" ? `${lineSpacing}px` : lineSpacing)
    : gap;

  const cssVars: CSSProperties = {
    "--wrapbox-gap": gap,
    "--wrapbox-row-gap": rowGap,
    "--wrapbox-justify": justify,
    "--wrapbox-align": align,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[
        styles.wrapBox,
        wrapReverse ? styles.reverse : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={cssVars}
      {...props}
    >
      {children}
    </div>
  );
}
