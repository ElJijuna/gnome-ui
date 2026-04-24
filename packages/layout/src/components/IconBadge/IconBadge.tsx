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
  color?: IconBadgeColor;
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
  return (
    <div
      className={[
        styles.badge,
        styles[size],
        color ? styles[color] : styles.neutral,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
