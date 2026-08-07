import { PanDown } from '@gnome-ui/icons';
import {
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Icon } from '@/components/Icon';

import styles from './MultiSelectDropdown.module.css';

export interface MultiSelectDropdownOption<V extends string = string> {
  /** The value included in `value` when this option is selected. */
  value: V;
  /** Display label shown in the list and (when only one is selected) the trigger. */
  label: string;
  /** Optional descriptive text shown below the label. */
  description?: string;
  /** Whether the option is selectable. */
  disabled?: boolean;
}

export interface MultiSelectDropdownProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The list of selectable options. */
  options: MultiSelectDropdownOption<V>[];
  /** The currently selected values. */
  value: V[];
  /** Called with the full updated selection whenever an option is toggled. */
  onChange: (value: V[]) => void;
  /** Placeholder shown when no option is selected. */
  placeholder?: string;
  /** Accessible label for the control (used as `aria-label`). */
  'aria-label'?: string;
  /** Disables the entire control. */
  disabled?: boolean;
}

function summarize(count: number, selected: { label: string }[]): string {
  if (count === 1) {
    return selected[0].label;
  }

  return `${count} selected`;
}

/**
 * Checkbox-list variant of `Dropdown` for selecting multiple values from a
 * single trigger.
 *
 * `Dropdown`/`ComboRow` are single-select only — use `MultiSelectDropdown`
 * when more than one value can be chosen at once (e.g. filtering by several
 * categories). Toggling an option keeps the list open so the user can pick
 * several in a row; close it via Escape, Tab, or clicking outside.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/drop-down-lists.html
 */
export const MultiSelectDropdown = <V extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  disabled,
  className,
  'aria-label': ariaLabel,
  ...props
}: MultiSelectDropdownProps<V>) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [flipUp, setFlipUp] = useState(false);

  const triggerId = useId();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOptions = options.filter((o) => value.includes(o.value));

  // Compute flip direction when opening
  const computeFlip = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const listH = Math.min(options.length * 48 + 8, 280);

    setFlipUp(spaceBelow < listH && rect.top > listH);
  }, [options.length]);

  const openList = useCallback(() => {
    if (disabled) {
      return;
    }

    computeFlip();
    setOpen(true);
    const idx = options.findIndex((o) => value.includes(o.value) && !o.disabled);

    setActiveIndex(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
  }, [disabled, computeFlip, options, value]);

  const closeList = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const toggleOption = useCallback(
    (opt: MultiSelectDropdownOption<V>) => {
      if (opt.disabled) {
        return;
      }

      onChange(
        value.includes(opt.value) ? value.filter((v) => v !== opt.value) : [...value, opt.value],
      );
    },
    [onChange, value],
  );

  // Refine the flip with the real list height once it has rendered — the
  // pre-open estimate can't account for option descriptions or wrapped labels.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !listRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const listH = listRef.current.offsetHeight;

    setFlipUp(window.innerHeight - rect.bottom < listH && rect.top > listH);
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) {
      return;
    }

    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;

    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        closeList();
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeList]);

  // Trigger keyboard handler
  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          openList();
          break;
        case 'ArrowUp':
          e.preventDefault();
          computeFlip();
          setOpen(true);
          setActiveIndex(options.reduce((last, o, i) => (!o.disabled ? i : last), -1));
          break;
      }
    },
    [openList, computeFlip, options],
  );

  // Listbox keyboard handler
  const handleListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const enabledIndexes = options
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled)
        .map(({ i }) => i);

      const currentPos = enabledIndexes.indexOf(activeIndex);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = enabledIndexes[Math.min(currentPos + 1, enabledIndexes.length - 1)];

          setActiveIndex(next ?? activeIndex);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = enabledIndexes[Math.max(currentPos - 1, 0)];

          setActiveIndex(prev ?? activeIndex);
          break;
        }
        case 'Home':
          e.preventDefault();
          setActiveIndex(enabledIndexes[0] ?? -1);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
          break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (activeIndex >= 0) {
            toggleOption(options[activeIndex]);
          }

          break;
        }
        case 'Escape':
        case 'Tab':
          closeList();
          break;
      }
    },
    [options, activeIndex, toggleOption, closeList],
  );

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} {...props}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        className={[styles.trigger, open ? styles.triggerOpen : null].filter(Boolean).join(' ')}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={[styles.triggerLabel, selectedOptions.length === 0 ? styles.placeholder : null]
            .filter(Boolean)
            .join(' ')}
        >
          {selectedOptions.length === 0
            ? placeholder
            : summarize(selectedOptions.length, selectedOptions)}
        </span>
        <Icon
          icon={PanDown}
          size="md"
          aria-hidden
          className={[styles.chevron, open ? styles.chevronOpen : null].filter(Boolean).join(' ')}
        />
      </button>

      {/* Listbox */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={triggerId}
          tabIndex={-1}
          className={[styles.list, flipUp ? styles.listUp : styles.listDown]
            .filter(Boolean)
            .join(' ')}
          onKeyDown={handleListKeyDown}
        >
          {options.map((opt, i) => {
            const checked = value.includes(opt.value);

            return (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={checked}
                aria-disabled={opt.disabled}
                className={[
                  styles.option,
                  checked ? styles.optionSelected : null,
                  i === activeIndex ? styles.optionActive : null,
                  opt.disabled ? styles.optionDisabled : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                onClick={() => toggleOption(opt)}
              >
                <span
                  className={[styles.checkbox, checked ? styles.checkboxChecked : null]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {opt.description && <span className={styles.optionDesc}>{opt.description}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
