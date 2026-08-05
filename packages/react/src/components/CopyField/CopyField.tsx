import { type InputHTMLAttributes, useId } from 'react';

import { CopyButton } from '@/components/CopyButton';

import styles from './CopyField.module.css';

export interface CopyFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'readOnly' | 'value' | 'type'> {
  /** The value displayed in the field and copied to the clipboard. */
  value: string;
  /** Visible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the field in place of `helperText`.
   * Also applies the error visual state to the field border.
   */
  error?: string;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
  /** Accessible label and tooltip for the copy button before copying. Defaults to `"Copy"`. */
  copyLabel?: string;
  /** Accessible label and tooltip after a successful copy. Defaults to `"Copied!"`. */
  copiedLabel?: string;
  /**
   * Render the value in a monospace font — useful for tokens, keys, and IDs.
   * Defaults to `true`.
   */
  monospace?: boolean;
}

/**
 * Read-only `TextField` with a built-in trailing `CopyButton`, for
 * displaying copyable values (API keys, tokens, IDs) outside the
 * `CveIdentifier`/`CweIdentifier`-style specialised components.
 *
 * The field is `readOnly`, not `disabled` — its text remains selectable
 * for manual copy in addition to the button.
 */
export const CopyField = ({
  value,
  label,
  helperText,
  error,
  id: idProp,
  copyLabel = 'Copy',
  copiedLabel = 'Copied!',
  monospace = true,
  className,
  disabled,
  ...props
}: CopyFieldProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;

  return (
    <div className={[styles.wrapper, disabled ? styles.disabled : null].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <input
          id={id}
          type="text"
          readOnly
          value={value}
          disabled={disabled}
          aria-describedby={error || helperText ? helpId : undefined}
          aria-invalid={error ? true : undefined}
          className={[
            styles.input,
            monospace ? styles.monospace : null,
            error ? styles.errorInput : null,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        <CopyButton
          value={value}
          label={copyLabel}
          copiedLabel={copiedLabel}
          variant="flat"
          size="sm"
          disabled={disabled}
          className={styles.copyBtn}
        />
      </div>

      {(error || helperText) && (
        <span
          id={helpId}
          className={[styles.hint, error ? styles.errorHint : null].filter(Boolean).join(' ')}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  );
};
