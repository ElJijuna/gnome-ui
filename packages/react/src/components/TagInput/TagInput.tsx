import {
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from 'react';

import { Chip } from '../Chip';
import { WrapBox } from '../WrapBox';

import styles from './TagInput.module.css';

export interface TagInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id' | 'type'> {
  /** Current list of tags. */
  value: string[];
  /** Called when a tag is added or removed. */
  onChange: (value: string[]) => void;
  /** Visible label rendered above the input. */
  label?: string;
  /** Helper text rendered below the input. Hidden when `error` is set. */
  helperText?: string;
  /**
   * Error message rendered below the input in place of `helperText`.
   * Also applies the error visual state to the border.
   */
  error?: string;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
  /** Maximum number of tags allowed. Once reached, the text input is hidden. */
  maxTags?: number;
  /** Reject a new tag that already exists (case-insensitive). Defaults to `true`. */
  preventDuplicates?: boolean;
}

/**
 * Type-to-add multi-value input rendering entries as removable `Chip`s in a `WrapBox`.
 *
 * `WrapBox`/`Chip` alone only support static, pre-populated display — `TagInput`
 * adds interactive entry: type and press Enter or `,` to commit a tag, Backspace
 * on an empty draft to remove the last one, or paste a comma/newline-separated
 * list to add several at once.
 */
export const TagInput = ({
  value,
  onChange,
  label,
  helperText,
  error,
  id: idProp,
  maxTags,
  preventDuplicates = true,
  className,
  disabled,
  ...props
}: TagInputProps) => {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const atMax = maxTags !== undefined && value.length >= maxTags;

  const isDuplicate = (tag: string) =>
    preventDuplicates && value.some((v) => v.toLowerCase() === tag.toLowerCase());

  const commit = (raw: string) => {
    const tag = raw.trim();

    setDraft('');

    if (!tag || atMax || isDuplicate(tag)) {
      return;
    }

    onChange([...value, tag]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);

      return;
    }

    if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');

    if (!text.includes(',') && !text.includes('\n')) {
      return;
    }

    e.preventDefault();

    const next = [...value];

    for (const part of text.split(/[,\n]/)) {
      const tag = part.trim();

      if (!tag || (maxTags !== undefined && next.length >= maxTags)) {
        continue;
      }
      if (preventDuplicates && next.some((v) => v.toLowerCase() === tag.toLowerCase())) {
        continue;
      }
      next.push(tag);
    }

    setDraft('');
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={[styles.wrapper, disabled ? styles.disabled : null].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <WrapBox
        childSpacing={6}
        className={[styles.box, error ? styles.errorBox : null, className]
          .filter(Boolean)
          .join(' ')}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, i) => (
          <Chip
            key={`${tag}-${i}`}
            label={tag}
            disabled={disabled}
            onRemove={disabled ? undefined : () => removeAt(i)}
          />
        ))}

        {!atMax && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            aria-describedby={error || helperText ? helpId : undefined}
            aria-invalid={error ? true : undefined}
            className={styles.input}
            {...props}
          />
        )}
      </WrapBox>

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
