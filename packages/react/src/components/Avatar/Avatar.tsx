import type { HTMLAttributes } from "react";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Named color palette for the initials fallback.
 * Mirrors libadwaita's avatar color set.
 */
export type AvatarColor =
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "brown"
  | "teal"
  | "slate";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Full name used to generate initials and — when `color` is omitted —
   * to deterministically pick a background color.
   */
  name?: string;
  /** Image URL. When provided the initials fallback is hidden. */
  src?: string;
  /** Alt text for the image. Defaults to `name`. */
  alt?: string;
  /** Size of the avatar. Defaults to `"md"`. */
  size?: AvatarSize;
  /**
   * Override the auto-derived background color for the initials fallback.
   * When omitted a color is derived from `name` via a stable hash.
   */
  color?: AvatarColor;
}

const COLOR_LIST: AvatarColor[] = [
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "brown",
  "teal",
  "slate",
];

/** Stable, non-cryptographic hash → index into COLOR_LIST. */
function nameToColor(name: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return COLOR_LIST[hash % COLOR_LIST.length];
}

/** Extract up to 2 initials from a name string. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Circular avatar with image or initials fallback.
 *
 * Follows the Adwaita `AdwAvatar` pattern — deterministic color from name,
 * up to two initials when no image is supplied.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Avatar.html
 */
export function Avatar({
  name = "",
  src,
  alt,
  size = "md",
  color,
  className,
  ...props
}: AvatarProps) {
  const resolvedColor = color ?? (name ? nameToColor(name) : "blue");
  const initials = getInitials(name);

  const classes = [
    styles.avatar,
    styles[size],
    !src ? styles[`color-${resolvedColor}`] : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      role="img"
      aria-label={alt ?? name ?? "Avatar"}
      className={classes}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? name} className={styles.image} />
      ) : (
        <span aria-hidden="true" className={styles.initials}>
          {initials}
        </span>
      )}
    </span>
  );
}
