import { useState, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./EntryRow.module.css";

export interface EntryRowProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /**
   * Acts as a floating label: shown small above the input when the field has
   * content or focus, shown as a placeholder when empty and unfocused.
   */
  title: string;
  /** Called when the input value changes. */
  onValueChange?: (value: string) => void;
  /** Icon or widget placed at the leading edge. */
  leading?: ReactNode;
  /** Icon or widget placed at the trailing edge (e.g. a clear button, copy button). */
  trailing?: ReactNode;
}

/**
 * Row with an inline text entry field.
 *
 * Mirrors `AdwEntryRow` — the `title` floats up as a small label when the
 * field is focused or has content, acting as a placeholder when empty and
 * unfocused. Use inside a `BoxedList` for inline settings that require text input.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.EntryRow.html
 */
export function EntryRow({
  title,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  leading,
  trailing,
  disabled,
  className,
  id: externalId,
  onChange,
  ...props
}: EntryRowProps) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue));
  const inputValue = isControlled ? String(controlledValue) : uncontrolledValue;

  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const floated = focused || inputValue.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(e.target.value);
    onValueChange?.(e.target.value);
    onChange?.(e);
  };

  return (
    <div
      className={[
        styles.row,
        focused ? styles.focused : null,
        disabled ? styles.disabled : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => inputRef.current?.focus()}
    >
      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.fieldWrap}>
        <label
          htmlFor={inputId}
          className={[styles.label, floated ? styles.labelFloated : null].filter(Boolean).join(" ")}
        >
          {title}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={[styles.input, floated ? styles.inputFloated : null].filter(Boolean).join(" ")}
          value={inputValue}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          {...props}
        />
      </span>

      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </div>
  );
}
