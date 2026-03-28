import { useState, useRef, useId, useEffect, useCallback, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import styles from "./ComboRow.module.css";

export interface ComboRowOption<V extends string = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface ComboRowProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Primary label. */
  title: string;
  /** Secondary line below the title. */
  subtitle?: string;
  /** Icon or image placed at the leading edge. */
  leading?: ReactNode;
  /** The list of selectable options. */
  options: ComboRowOption<V>[];
  /** The currently selected value (controlled). */
  value?: V;
  /** Initial value when uncontrolled. */
  defaultValue?: V;
  /** Called when the user selects an option. */
  onValueChange?: (value: V) => void;
  /** Disables the row. */
  disabled?: boolean;
}

/**
 * Settings row with an inline combo selector at the trailing edge.
 *
 * Mirrors `AdwComboRow` — a standard `ActionRow` layout with a dropdown
 * for choosing among a set of options. The dropdown opens inline in the row
 * and follows the same keyboard patterns as the standalone `Dropdown`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ComboRow.html
 */
export function ComboRow<V extends string = string>({
  title,
  subtitle,
  leading,
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  ...props
}: ComboRowProps<V>) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<V | undefined>(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [flipUp, setFlipUp] = useState(false);

  const triggerId = useId();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const computeFlip = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const listH = Math.min(options.length * 44 + 8, 260);
    setFlipUp(spaceBelow < listH && rect.top > listH);
  }, [options.length]);

  const openList = useCallback(() => {
    if (disabled) return;
    computeFlip();
    setOpen(true);
    const idx = options.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
  }, [disabled, computeFlip, options, value]);

  const closeList = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectOption = useCallback(
    (opt: ComboRowOption<V>) => {
      if (opt.disabled) return;
      if (!isControlled) setUncontrolledValue(opt.value);
      onValueChange?.(opt.value);
      closeList();
    },
    [isControlled, onValueChange, closeList],
  );

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        closeList();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeList]);

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          openList();
          break;
        case "ArrowUp":
          e.preventDefault();
          computeFlip();
          setOpen(true);
          setActiveIndex(
            options.reduce((last, o, i) => (!o.disabled ? i : last), -1),
          );
          break;
      }
    },
    [openList, computeFlip, options],
  );

  const handleListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const enabledIndexes = options
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled)
        .map(({ i }) => i);
      const currentPos = enabledIndexes.indexOf(activeIndex);

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = enabledIndexes[Math.min(currentPos + 1, enabledIndexes.length - 1)];
          setActiveIndex(next ?? activeIndex);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = enabledIndexes[Math.max(currentPos - 1, 0)];
          setActiveIndex(prev ?? activeIndex);
          break;
        }
        case "Home":
          e.preventDefault();
          setActiveIndex(enabledIndexes[0] ?? -1);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          if (activeIndex >= 0) selectOption(options[activeIndex]);
          break;
        }
        case "Escape":
        case "Tab":
          closeList();
          break;
      }
    },
    [options, activeIndex, selectOption, closeList],
  );

  return (
    <div
      className={[styles.row, disabled ? styles.disabled : null, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {leading && <span className={styles.leading}>{leading}</span>}

      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>

      {/* Combo trigger button */}
      <div className={styles.comboWrap}>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          disabled={disabled}
          className={[styles.trigger, open ? styles.triggerOpen : null].filter(Boolean).join(" ")}
          onClick={() => (open ? closeList() : openList())}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className={[styles.triggerLabel, !selected ? styles.placeholder : null]
            .filter(Boolean).join(" ")}>
            {selected?.label ?? "—"}
          </span>
          <svg
            className={[styles.chevron, open ? styles.chevronOpen : null].filter(Boolean).join(" ")}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            className={[styles.list, flipUp ? styles.listUp : styles.listDown]
              .filter(Boolean)
              .join(" ")}
            onKeyDown={handleListKeyDown}
          >
            {options.map((opt, i) => (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                className={[
                  styles.option,
                  opt.value === value ? styles.optionSelected : null,
                  i === activeIndex ? styles.optionActive : null,
                  opt.disabled ? styles.optionDisabled : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                onClick={() => selectOption(opt)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                {opt.value === value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={styles.checkIcon}>
                    <path
                      d="M3 8l4 4 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
