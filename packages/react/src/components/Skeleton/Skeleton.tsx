import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./Skeleton.module.css";

export type SkeletonVariant = "rect" | "circle" | "text";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape of the placeholder. Defaults to `"rect"`. */
  variant?: SkeletonVariant;
  /** Width for rectangular placeholders. Defaults to `"100%"`. */
  width?: number | string;
  /** Height for rectangular placeholders. Defaults to `16`. */
  height?: number | string;
  /** Diameter for circular placeholders. Defaults to `40`. */
  size?: number;
  /** Number of rows for text placeholders. Defaults to `3`. */
  lines?: number;
  /**
   * Enables the shimmer animation.
   * Respects `prefers-reduced-motion`. Defaults to `true`.
   */
  animated?: boolean;
}

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Loading placeholder for content-shaped skeleton screens.
 *
 * GNOME HIG recommends `Spinner` or `ProgressBar` for loading states; this is a
 * pragmatic web-style extension for layouts that benefit from placeholder shape.
 */
export function Skeleton({
  variant = "rect",
  width = "100%",
  height = 16,
  size = 40,
  lines = 3,
  animated = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const classes = [
    styles.skeleton,
    styles[variant],
    animated ? styles.animated : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "text") {
    const lineCount = Math.max(1, Math.floor(lines));

    return (
      <div
        aria-hidden="true"
        className={classes}
        style={style}
        {...props}
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div
            key={index}
            className={styles.line}
            style={
              index === lineCount - 1
                ? ({ "--skeleton-line-width": "60%" } as CSSProperties)
                : undefined
            }
          />
        ))}
      </div>
    );
  }

  const shapeStyle: CSSProperties =
    variant === "circle"
      ? { width: `${size}px`, height: `${size}px` }
      : { width: toCssSize(width), height: toCssSize(height) };

  return (
    <div
      aria-hidden="true"
      className={classes}
      style={{ ...shapeStyle, ...style }}
      {...props}
    />
  );
}
