import { type FieldsetHTMLAttributes, type ReactNode, useId } from 'react';

import styles from './FieldGroup.module.css';

export interface FieldGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'id'> {
  /** Group heading, rendered as the fieldset's `<legend>`. */
  label: string;
  /** Helper text shown below the label. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message shown below the label in place of `helperText`.
   * Announced via `role="alert"` when it appears.
   */
  error?: string;
  /** Arbitrary field content — checkboxes, radios, a custom composite field, etc. */
  children?: ReactNode;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
}

/**
 * Generic form-field grouping with a shared label, help text, and error
 * message, for arbitrary fields outside a `BoxedList`.
 *
 * `PreferencesGroup` is scoped specifically to wrapping settings rows inside
 * a `BoxedList` — use `FieldGroup` for a plain `<fieldset>`/`<legend>`
 * grouping around any set of related form controls (e.g. a `RadioButton`
 * group or several `Checkbox`es sharing one label and error), independent
 * of the settings-page layout.
 *
 * Renders a native `<fieldset>`, so `disabled` automatically disables every
 * descendant form control for free — no need to thread it through manually.
 */
export const FieldGroup = ({
  label,
  helperText,
  error,
  id: idProp,
  className,
  children,
  ...props
}: FieldGroupProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;

  return (
    <fieldset
      id={id}
      aria-describedby={error || helperText ? helpId : undefined}
      className={[styles.group, className].filter(Boolean).join(' ')}
      {...props}
    >
      <legend className={styles.legend}>{label}</legend>

      {(error || helperText) && (
        <span
          id={helpId}
          role={error ? 'alert' : undefined}
          className={[styles.hint, error ? styles.errorHint : null].filter(Boolean).join(' ')}
        >
          {error ?? helperText}
        </span>
      )}

      <div className={styles.content}>{children}</div>
    </fieldset>
  );
};
