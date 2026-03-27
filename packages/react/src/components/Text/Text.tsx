import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextVariant =
  | "large-title"
  | "title-1"
  | "title-2"
  | "title-3"
  | "title-4"
  | "heading"
  | "body"
  | "document"
  | "caption"
  | "caption-heading"
  | "monospace"
  | "numeric";

export type TextColor =
  | "default"
  | "dim"
  | "accent"
  | "destructive"
  | "success"
  | "warning"
  | "error";

/** Default HTML element rendered for each variant */
const defaultElement: Record<TextVariant, ElementType> = {
  "large-title": "h1",
  "title-1": "h1",
  "title-2": "h2",
  "title-3": "h3",
  "title-4": "h4",
  heading: "h3",
  body: "p",
  document: "p",
  caption: "span",
  "caption-heading": "span",
  monospace: "code",
  numeric: "span",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Typography style. Mirrors Adwaita / GNOME HIG text styles. */
  variant?: TextVariant;
  /** Semantic color. */
  color?: TextColor;
  /** Override the rendered HTML element. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Text component following GNOME Human Interface Guidelines typography styles.
 *
 * Variants map directly to Adwaita style classes:
 * `large-title`, `title-1`–`title-4`, `heading`, `body`, `document`,
 * `caption`, `caption-heading`, `monospace`, `numeric`.
 *
 * @see https://developer.gnome.org/hig/guidelines/typography.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html
 */
export function Text({
  variant = "body",
  color = "default",
  as,
  className,
  children,
  ...props
}: TextProps) {
  const Tag = as ?? defaultElement[variant];

  const classes = [
    styles.text,
    styles[variant],
    styles[`color-${color}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
