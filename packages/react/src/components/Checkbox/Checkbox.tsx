import { useEffect, useRef, type InputHTMLAttributes } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Indeterminate state — shown when only some children in a group are checked.
   * Takes visual precedence over `checked`.
   */
  indeterminate?: boolean;
  /** Accessible label. Required when no visible `<label>` is associated. */
  "aria-label"?: string;
}

/**
 * Checkbox for multi-selection, following the GNOME HIG and Adwaita style.
 *
 * Supports three states: unchecked, checked, and indeterminate (mixed).
 * Use `indeterminate` for "select all" controls when only some items are selected.
 *
 * Renders as `<input type="checkbox">` — natively keyboard-accessible and
 * compatible with standard form libraries.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/checkboxes.html
 */
export function Checkbox({ indeterminate = false, className, ...props }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className={[styles.checkbox, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
