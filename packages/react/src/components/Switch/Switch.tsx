import type { InputHTMLAttributes } from "react";
import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Accessible label. Required when no visible `<label>` is associated. */
  "aria-label"?: string;
}

/**
 * On/off toggle following the Adwaita switch style.
 *
 * Renders as `<input type="checkbox" role="switch">` so it is natively
 * keyboard-accessible and works with standard form libraries.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/switches.html
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={[styles.switch, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
