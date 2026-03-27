import type { InputHTMLAttributes } from "react";
import styles from "./RadioButton.module.css";

export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Accessible label. Required when no visible `<label>` is associated. */
  "aria-label"?: string;
}

/**
 * Single-selection radio button following the GNOME HIG and Adwaita style.
 *
 * Group radio buttons by giving them the same `name` attribute.
 * Renders as `<input type="radio">` — natively keyboard-accessible
 * (arrow keys cycle within the group) and compatible with standard form libraries.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/radio-buttons.html
 */
export function RadioButton({ className, ...props }: RadioButtonProps) {
  return (
    <input
      type="radio"
      className={[styles.radio, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
