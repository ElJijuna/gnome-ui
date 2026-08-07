import { PanDown, Search } from '@gnome-ui/icons';
import {
  type ChangeEvent,
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
import type { MultiSelectDropdownOption } from '@/components/MultiSelectDropdown';

import styles from './FilterableMultiSelectDropdown.module.css';

export type { MultiSelectDropdownOption } from '@/components/MultiSelectDropdown';

export interface FilterableMultiSelectDropdownProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The list of selectable options. */
  options: MultiSelectDropdownOption<V>[];
  /** The currently selected values. */
  value: V[];
  /** Called with the full updated selection whenever an option is toggled. */
  onChange: (value: V[]) => void;
  /** Placeholder shown on the trigger when no option is selected. */
  placeholder?: string;
  /** Placeholder for the filter field shown once the list is open. */
  filterPlaceholder?: string;
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

function filterOptions<V extends string>(
  options: MultiSelectDropdownOption<V>[],
  query: string,
): MultiSelectDropdownOption<V>[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options.filter(
    (o) =>
      o.label.toLowerCase().includes(normalized) ||
      o.description?.toLowerCase().includes(normalized),
  );
}

/**
 * `MultiSelectDropdown` plus a filter field for narrowing long option lists.
 *
 * Same overall shape as `MultiSelectDropdown` — a trigger summarizing the
 * selection, opening a checkbox listbox — but opening it also focuses a
 * filter field pinned above the list; typing narrows `options` to those
 * whose label or description contains the query (case-insensitive).
 * Filtering only affects what's shown, never the underlying selection: values
 * selected before a query hides their option stay selected.
 *
 * Use this instead of plain `MultiSelectDropdown` once the option list is
 * long enough that scanning it visually stops being the fastest way to find
 * an entry (timezones, countries, package names, …).
 */
export const FilterableMultiSelectDropdown = <V extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  filterPlaceholder = 'Filter options…',
  disabled,
  className,
  'aria-label': ariaLabel,
  ...props
}: FilterableMultiSelectDropdownProps<V>) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [flipUp, setFlipUp] = useState(false);

  const triggerId = useId();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOptions = options.filter((o) => value.includes(o.value));
  const filteredOptions = filterOptions(options, query);

  // Compute flip direction when opening
  const computeFlip = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popupH = Math.min(options.length * 48 + 48, 320);

    setFlipUp(spaceBelow < popupH && rect.top > popupH);
  }, [options.length]);

  const openList = useCallback(() => {
    if (disabled) {
      return;
    }

    computeFlip();
    setOpen(true);
    setQuery('');
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

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;

    setQuery(next);
    setActiveIndex(filterOptions(options, next).findIndex((o) => !o.disabled));
  };

  // Refine the flip with the real popup height once it has rendered — the
  // pre-open estimate can't account for the filter field, option
  // descriptions, or wrapped labels.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !popupRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const popupH = popupRef.current.offsetHeight;

    setFlipUp(window.innerHeight - rect.bottom < popupH && rect.top > popupH);
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
        !popupRef.current?.contains(e.target as Node)
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
          setQuery('');
          setActiveIndex(options.reduce((last, o, i) => (!o.disabled ? i : last), -1));
          break;
      }
    },
    [openList, computeFlip, options],
  );

  // Filter field keyboard handler — Space must reach the field as a normal
  // character (it's valid filter text), unlike MultiSelectDropdown's
  // listbox handler where Space toggles the active option.
  const handleFilterKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const enabledIndexes = filteredOptions
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
          e.preventDefault();
          if (activeIndex >= 0 && filteredOptions[activeIndex]) {
            toggleOption(filteredOptions[activeIndex]);
          }

          break;
        case 'Escape':
          e.preventDefault();
          closeList();
          break;
        case 'Tab':
          closeList();
          break;
      }
    },
    [filteredOptions, activeIndex, toggleOption, closeList],
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

      {/* Popup: filter field + listbox */}
      {open && (
        <div
          ref={popupRef}
          className={[styles.popup, flipUp ? styles.popupUp : styles.popupDown]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.filterRow}>
            <Icon icon={Search} size="sm" aria-hidden className={styles.filterIcon} />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleFilterKeyDown}
              placeholder={filterPlaceholder}
              aria-label={filterPlaceholder}
              aria-controls={listboxId}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
              }
              className={styles.filterInput}
              autoFocus
            />
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={triggerId}
            className={styles.list}
          >
            {filteredOptions.length === 0 ? (
              <li className={styles.empty}>No results</li>
            ) : (
              filteredOptions.map((opt, i) => {
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
                      {opt.description && (
                        <span className={styles.optionDesc}>{opt.description}</span>
                      )}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
