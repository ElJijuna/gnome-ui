import {
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
} from 'react';

import styles from './OtpInput.module.css';

export interface OtpInputProps {
  /** Number of digit cells. Defaults to `6`. */
  length?: number;
  /** Current value — a string of up to `length` digits. */
  value: string;
  /** Called whenever the value changes. */
  onChange: (value: string) => void;
  /** Called once, when the value reaches `length` digits. */
  onComplete?: (value: string) => void;
  /** Obscure entered digits like a password field. Defaults to `false`. */
  masked?: boolean;
  /** Visible label rendered as the group's `<legend>`. */
  label?: string;
  /** Helper text below the label. Hidden when `error` is set. */
  helperText?: string;
  /** Error message shown below the label in place of `helperText`. */
  error?: string;
  /** Disables every cell. */
  disabled?: boolean;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
  /** Autofocus the first cell on mount. Defaults to `false`. */
  autoFocus?: boolean;
}

/**
 * Segmented PIN/verification-code input — one cell per digit, with
 * auto-advance on typing, backspace-to-previous-cell, and paste support
 * (pasting a full code distributes it across the remaining cells).
 *
 * Common auth pattern, pairs naturally with `PasswordEntryRow`/`PasswordField`
 * for a two-factor confirmation step following a password entry.
 */
export const OtpInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  masked = false,
  label,
  helperText,
  error,
  disabled = false,
  id: idProp,
  autoFocus = false,
}: OtpInputProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const prevValueRef = useRef(value);

  const chars = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (value.length === length && value !== prevValueRef.current) {
      onComplete?.(value);
    }
    prevValueRef.current = value;
  }, [value, length, onComplete]);

  const setCellValue = (index: number, char: string) => {
    const next = [...chars];

    next[index] = char;
    onChange(next.join(''));
  };

  const fillFrom = (startIndex: number, digits: string) => {
    const cleaned = digits.replace(/\D/g, '');

    if (!cleaned) {
      return;
    }

    const next = [...chars];
    let i = startIndex;

    for (const d of cleaned) {
      if (i >= length) {
        break;
      }
      next[i] = d;
      i++;
    }

    onChange(next.join(''));
    inputRefs.current[Math.min(i, length - 1)]?.focus();
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');

    if (raw.length > 1) {
      fillFrom(index, raw);

      return;
    }

    setCellValue(index, raw);

    if (raw && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');

    if (!/\d/.test(text)) {
      return;
    }

    e.preventDefault();
    fillFrom(index, text);
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      if (chars[index]) {
        setCellValue(index, '');
      } else if (index > 0) {
        setCellValue(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }

      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <fieldset
      id={id}
      disabled={disabled}
      aria-describedby={error || helperText ? helpId : undefined}
      className={styles.group}
    >
      {label && <legend className={styles.legend}>{label}</legend>}

      {(error || helperText) && (
        <span
          id={helpId}
          role={error ? 'alert' : undefined}
          className={[styles.hint, error ? styles.errorHint : null].filter(Boolean).join(' ')}
        >
          {error ?? helperText}
        </span>
      )}

      <div className={styles.row}>
        {chars.map((char, i) => (
          <input
            key={i}
            ref={(node) => {
              inputRefs.current[i] = node;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={char}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            className={[styles.cell, error ? styles.errorCell : null].filter(Boolean).join(' ')}
            onChange={handleChange(i)}
            onKeyDown={handleKeyDown(i)}
            onPaste={handlePaste(i)}
            onFocus={handleFocus}
          />
        ))}
      </div>
    </fieldset>
  );
};
