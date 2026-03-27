import type { SVGAttributes } from "react";
import type { IconDefinition } from "@gnome-ui/icons";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Icon definition imported from `@gnome-ui/icons`. */
  icon: IconDefinition;
  /**
   * Rendered size.
   * - `sm` — 12 px
   * - `md` — 16 px (default)
   * - `lg` — 20 px
   *
   * Override with `width`/`height` for non-standard sizes.
   */
  size?: IconSize;
  /** Accessible label. Omit for decorative icons — they are hidden from screen readers. */
  label?: string;
}

const SIZE_MAP: Record<IconSize, number> = { sm: 12, md: 16, lg: 20 };

/**
 * Renders an `@gnome-ui/icons` definition as an inline SVG.
 *
 * Uses `currentColor` so the icon inherits the text color of its parent.
 * Pass `label` only when the icon conveys meaning on its own;
 * omit it when a sibling text label already describes the action.
 *
 * @example
 * import { Search } from "@gnome-ui/icons";
 * <Icon icon={Search} label="Search" />
 */
export function Icon({
  icon,
  size = "md",
  label,
  width,
  height,
  ...props
}: IconProps) {
  const px = SIZE_MAP[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={width ?? px}
      height={height ?? px}
      fill="currentColor"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fillRule={p.fillRule}
          clipRule={p.clipRule}
        />
      ))}
    </svg>
  );
}
