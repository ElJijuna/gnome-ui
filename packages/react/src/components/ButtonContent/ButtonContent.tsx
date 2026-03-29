import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ButtonContent.module.css";

export interface ButtonContentProps extends HTMLAttributes<HTMLSpanElement> {
  /** Icon element placed before the label. */
  icon?: ReactNode;
  /** Text label. */
  label: string;
  /**
   * Position of the icon relative to the label.
   * Defaults to `"start"`.
   */
  iconPosition?: "start" | "end";
}

/**
 * Icon + label layout helper for buttons that contain both an icon and text.
 *
 * Pass as the `children` of a `Button` to get the correct Adwaita spacing
 * between the icon and label (4 px gap, icon centred vertically with the text).
 *
 * Mirrors `AdwButtonContent`.
 *
 * @example
 * ```tsx
 * <Button>
 *   <ButtonContent icon={<Icon name="document-save-symbolic" />} label="Save" />
 * </Button>
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ButtonContent.html
 */
export function ButtonContent({
  icon,
  label,
  iconPosition = "start",
  className,
  ...props
}: ButtonContentProps) {
  return (
    <span
      className={[
        styles.content,
        iconPosition === "end" ? styles.iconEnd : null,
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {icon && iconPosition === "start" && (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      )}
      <span className={styles.label}>{label}</span>
      {icon && iconPosition === "end" && (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      )}
    </span>
  );
}
