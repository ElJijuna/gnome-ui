import type { SVGAttributes } from "react";
import type { AnyIconDefinition, IconDefinition } from "@gnome-ui/icons";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Icon from `@gnome-ui/icons`, a `simple-icons` icon, or a raw `{ path }` object. */
  icon: AnyIconDefinition;
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

function isIconDefinition(icon: AnyIconDefinition): icon is IconDefinition {
  // When an object has both `path` and `paths`, `paths` wins.
  return "paths" in icon && Array.isArray((icon as IconDefinition).paths);
}

/**
 * Renders an icon as an inline SVG.
 *
 * Accepts icons from `@gnome-ui/icons`, any `simple-icons` icon, or a plain
 * `{ path }` object. Uses `currentColor` so the icon inherits the text color
 * of its parent. Pass `label` only when the icon conveys meaning on its own.
 *
 * @example
 * import { Search } from "@gnome-ui/icons";
 * <Icon icon={Search} label="Search" />
 *
 * @example
 * import { siGithub } from "simple-icons";
 * <Icon icon={siGithub} label="GitHub" />
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

  const resolvedViewBox = isIconDefinition(icon)
    ? icon.viewBox
    : (icon.viewBox ?? "0 0 24 24");

  const paths = isIconDefinition(icon)
    ? icon.paths.map((p, i) => (
        <path key={i} d={p.d} fillRule={p.fillRule} clipRule={p.clipRule} />
      ))
    : [<path key={0} d={icon.path} />];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={resolvedViewBox}
      width={width ?? px}
      height={height ?? px}
      fill="currentColor"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {paths}
    </svg>
  );
}
