import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/** GNOME HIG standard spacing values (matches GtkBox spacing tokens). */
export type BoxSpacing = 3 | 6 | 12 | 18 | 24 | 32 | 48;

/** Alias of `BoxSpacing` for use as a padding scale. */
export type BoxPadding = BoxSpacing;

export type BoxOrientation = "horizontal" | "vertical";
export type BoxAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type BoxJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Direction children are arranged.
   * `"vertical"` → `flex-direction: column` (default).
   * `"horizontal"` → `flex-direction: row`.
   */
  orientation?: BoxOrientation;
  /**
   * Gap between children in pixels.
   * Accepts any of the GNOME HIG standard spacing values or any CSS string.
   * Defaults to `6` (the HIG "standard" inner spacing).
   */
  spacing?: BoxSpacing | number | string;
  /**
   * Cross-axis alignment (`align-items`).
   * Defaults to `"stretch"` for vertical, `"center"` for horizontal.
   */
  align?: BoxAlign;
  /**
   * Main-axis distribution (`justify-content`).
   * Defaults to `"start"`.
   */
  justify?: BoxJustify;
  /**
   * Inner padding applied to all sides.
   * Accepts any of the GNOME HIG standard spacing values or any CSS string.
   */
  padding?: BoxPadding | number | string;
  children?: ReactNode;
}

/**
 * Fundamental flex layout primitive — the web equivalent of `GtkBox`.
 *
 * Arranges children in a single row or column with consistent spacing
 * following the GNOME Human Interface Guidelines spacing scale:
 *
 * | Token | px | Use |
 * |-------|----|-----|
 * | tight | 3  | Dense UI, icon + label pairs |
 * | standard | 6 | Default inner spacing |
 * | medium | 12 | Between related groups |
 * | large | 18 | Between loosely related sections |
 * | section | 24 | Page-level section gaps |
 * | loose | 32 | Large content separation |
 * | jumbo | 48 | Hero / splash spacing |
 *
 * **Usage:**
 * ```tsx
 * // Vertical section (heading + content)
 * <Box spacing={8}>
 *   <Text variant="caption-heading" color="dim">Devices</Text>
 *   <BoxedList>…</BoxedList>
 * </Box>
 *
 * // Horizontal icon + label
 * <Box orientation="horizontal" spacing={6} align="center">
 *   <Icon name="folder" />
 *   <Text>Documents</Text>
 * </Box>
 * ```
 *
 * @see https://developer.gnome.org/hig/guidelines/spacing.html
 */
export function Box({
  orientation = "vertical",
  spacing = 6,
  align,
  justify = "start",
  padding,
  className,
  style,
  children,
  ...props
}: BoxProps) {
  const defaultAlign: BoxAlign =
    orientation === "horizontal" ? "center" : "stretch";

  const resolvedStyle: CSSProperties = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    gap: typeof spacing === "number" ? `${spacing}px` : spacing,
    alignItems: align ?? defaultAlign,
    justifyContent: justify,
    ...(padding !== undefined && { padding: typeof padding === "number" ? `${padding}px` : padding }),
    ...style,
  };

  return (
    <div className={className} style={resolvedStyle} {...props}>
      {children}
    </div>
  );
}
