import { ViewConceal, ViewReveal } from '@gnome-ui/icons';
import { type InputHTMLAttributes, useId, useState } from 'react';

import { IconButton } from '@/components/IconButton';

import styles from './PasswordField.module.css';

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
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
  /**
   * Show the peek toggle button that reveals the password as plain text.
   * Mirrors `GtkPasswordEntry`'s `show-peek-icon` property. Defaults to `true`.
   */
  revealable?: boolean;
  /** Accessible label for the toggle button while the password is hidden. */
  revealLabel?: string;
  /** Accessible label for the toggle button while the password is revealed. */
  concealLabel?: string;
}

/**
 * Single-line password input with a peek toggle to reveal the value as plain text.
 *
 * Mirrors `GtkPasswordEntry` (`.entry` style class plus its built-in peek icon),
 * as opposed to `TextField` with `type="password"`, which has no reveal affordance.
 *
 * @see https://docs.gtk.org/gtk4/class.PasswordEntry.html
 */
export const PasswordField = ({
  label,
  helperText,
  error,
  id: idProp,
  revealable = true,
  revealLabel = 'Show password',
  concealLabel = 'Hide password',
  className,
  disabled,
  ...props
}: PasswordFieldProps) => {
  const [revealed, setRevealed] = useState(false);
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const showAsText = revealable && revealed;

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
          type={showAsText ? 'text' : 'password'}
          disabled={disabled}
          aria-describedby={error || helperText ? helpId : undefined}
          aria-invalid={error ? true : undefined}
          className={[
            styles.input,
            error ? styles.errorInput : null,
            revealable ? styles.hasToggle : null,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {revealable && (
          <IconButton
            icon={showAsText ? ViewConceal : ViewReveal}
            label={showAsText ? concealLabel : revealLabel}
            variant="flat"
            size="sm"
            type="button"
            disabled={disabled}
            className={styles.toggle}
            onClick={() => setRevealed((prev) => !prev)}
          />
        )}
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
