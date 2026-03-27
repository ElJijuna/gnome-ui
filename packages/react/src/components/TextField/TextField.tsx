import { useId, type InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Visible label rendered above the input. */
  label?: string;
  /** Helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the input in place of `helperText`.
   * Also applies the error visual state to the input border.
   */
  error?: string;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
}

/**
 * Single-line text input with label, helper text, and error state.
 *
 * Follows the Adwaita `GtkEntry` / `.entry` style class.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/text-fields.html
 */
export function TextField({
  label,
  helperText,
  error,
  id: idProp,
  className,
  disabled,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;

  return (
    <div className={[styles.wrapper, disabled ? styles.disabled : null].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <input
        id={id}
        disabled={disabled}
        aria-describedby={error || helperText ? helpId : undefined}
        aria-invalid={error ? true : undefined}
        className={[
          styles.input,
          error ? styles.errorInput : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      {(error || helperText) && (
        <span
          id={helpId}
          className={[styles.hint, error ? styles.errorHint : null]
            .filter(Boolean)
            .join(" ")}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  );
}
