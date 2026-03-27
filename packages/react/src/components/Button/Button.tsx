import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "default" | "suggested" | "destructive" | "flat" | "raised";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "default" | "pill" | "circular";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Follows GNOME HIG button types. */
  variant?: ButtonVariant;
  /** Size of the button. */
  size?: ButtonSize;
  /** Shape of the button. "pill" for primary actions in open space, "circular" for icon-only buttons. */
  shape?: ButtonShape;
  /**
   * Dark semi-transparent overlay style for buttons placed on top of
   * media or images — mirrors the `.osd` style class.
   */
  osd?: boolean;
  /** Icon placed before the label. */
  leadingIcon?: ReactNode;
  /** Icon placed after the label. */
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

/**
 * Button component following GNOME Human Interface Guidelines.
 *
 * Variants:
 * - `default`     — Standard action, flat appearance with subtle border.
 * - `suggested`   — Affirmative/primary action (accent color). Use at most once per view.
 * - `destructive` — Dangerous or irreversible action (red). Use sparingly.
 * - `flat`        — No border or background; ideal for header bars and toolbars.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/buttons.html
 */
export function Button({
  variant = "default",
  size = "md",
  shape = "default",
  osd = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size !== "md" ? styles[size] : null,
    shape !== "default" ? styles[shape] : null,
    osd ? styles.osd : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
