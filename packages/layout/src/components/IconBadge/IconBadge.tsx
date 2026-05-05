import type { HTMLAttributes, ReactNode } from "react";
import styles from "./IconBadge.module.css";

export type IconBadgeColor =
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "brown";

export type IconBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconBadgeProps extends HTMLAttributes<HTMLDivElement> {
  color?: IconBadgeColor | (string & {});
  size?: IconBadgeSize;
  children: ReactNode;
}

export function IconBadge({
  color,
  size = "md",
  className,
  style,
  children,
  ...props
}: IconBadgeProps) {
  const isHex = color ? /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color) : false;

  return (
    <div
      className={[
        styles.badge,
        styles[size],
        isHex ? undefined : color ? styles[color as IconBadgeColor] : styles.neutral,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(isHex && {
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
        }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
