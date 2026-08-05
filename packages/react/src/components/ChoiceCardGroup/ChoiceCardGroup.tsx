import type { IconDefinition } from '@gnome-ui/icons';
import { type FieldsetHTMLAttributes, type KeyboardEvent, useId } from 'react';

import { Icon } from '@/components/Icon';

import styles from './ChoiceCardGroup.module.css';

export interface ChoiceCardOption<V extends string = string> {
  /** The value submitted / returned on selection. */
  value: V;
  /** Card title. */
  title: string;
  /** Optional descriptive text shown below the title. */
  description?: string;
  /** Optional leading icon from `@gnome-ui/icons`. */
  icon?: IconDefinition;
  /** Whether the option is selectable. */
  disabled?: boolean;
}

export interface ChoiceCardGroupProps<V extends string = string>
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'id'> {
  /** The list of selectable cards. */
  options: ChoiceCardOption<V>[];
  /** The currently selected value. */
  value?: V;
  /** Called when the user selects a card. */
  onChange: (value: V) => void;
  /** Visible label rendered as the group's `<legend>`. */
  label?: string;
  /** Helper text below the label. Hidden when `error` is set. */
  helperText?: string;
  /** Error message shown below the label in place of `helperText`. */
  error?: string;
  /** Disables every card. */
  disabled?: boolean;
  /** Explicit id. Auto-generated when omitted. */
  id?: string;
}

/**
 * Card-based single-choice selector — large selectable cards instead of
 * radio buttons. Mirrors the pattern used in GNOME Initial Setup / welcome
 * flows (e.g. choosing an account type or a starting template).
 *
 * Implements the WAI-ARIA `radiogroup`/`radio` pattern with roving tabindex:
 * only the selected card (or the first enabled one, if none is selected) is
 * in the tab order; ←/→/↑/↓ move the selection between cards.
 */
export const ChoiceCardGroup = <V extends string = string>({
  options,
  value,
  onChange,
  label,
  helperText,
  error,
  disabled = false,
  id: idProp,
  className,
  ...props
}: ChoiceCardGroupProps<V>) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;

  const enabledIndexes = options
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => !o.disabled)
    .map(({ i }) => i);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabbableIndex = enabledIndexes.includes(selectedIndex) ? selectedIndex : enabledIndexes[0];

  const select = (opt: ChoiceCardOption<V>) => {
    if (opt.disabled || disabled) {
      return;
    }

    onChange(opt.value);
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const pos = enabledIndexes.indexOf(index);

    if (pos === -1) {
      return;
    }

    let nextPos: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPos = (pos + 1) % enabledIndexes.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPos = (pos - 1 + enabledIndexes.length) % enabledIndexes.length;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextIndex = enabledIndexes[nextPos];
    const el = document.getElementById(`${id}-opt-${nextIndex}`) as HTMLButtonElement | null;

    el?.focus();
    select(options[nextIndex]);
  };

  return (
    <fieldset
      id={id}
      disabled={disabled}
      aria-describedby={error || helperText ? helpId : undefined}
      className={[styles.group, className].filter(Boolean).join(' ')}
      {...props}
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

      <div role="radiogroup" aria-label={label} className={styles.grid}>
        {options.map((opt, i) => {
          const checked = opt.value === value;
          const isDisabled = disabled || opt.disabled;

          return (
            <button
              key={opt.value}
              id={`${id}-opt-${i}`}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={isDisabled}
              tabIndex={i === tabbableIndex ? 0 : -1}
              className={[
                styles.card,
                checked ? styles.cardChecked : null,
                isDisabled ? styles.cardDisabled : null,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => select(opt)}
              onKeyDown={handleKeyDown(i)}
            >
              <span className={styles.radioDot} aria-hidden="true" />
              {opt.icon && <Icon icon={opt.icon} size="lg" aria-hidden className={styles.icon} />}
              <span className={styles.title}>{opt.title}</span>
              {opt.description && <span className={styles.description}>{opt.description}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
