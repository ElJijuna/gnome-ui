import {
  useState,
  useRef,
  useId,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { PanDown, Check } from "@gnome-ui/icons";
import { Icon } from "../Icon";
import styles from "./Dropdown.module.css";

export interface DropdownOption<V extends string = string> {
  /** The value submitted / returned on selection. */
  value: V;
  /** Display label shown in the list and trigger. */
  label: string;
  /** Optional descriptive text shown below the label. */
  description?: string;
  /** Whether the option is selectable. */
  disabled?: boolean;
}

export interface DropdownProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** The list of selectable options. */
  options: DropdownOption<V>[];
  /** The currently selected value. */
  value?: V;
  /** Called when the user selects an option. */
  onChange?: (value: V) => void;
  /** Placeholder shown when no option is selected. */
  placeholder?: string;
  /** Accessible label for the control (used as `aria-label`). */
  "aria-label"?: string;
  /** Disables the entire control. */
  disabled?: boolean;
}

/**
 * Expandable option list following the Adwaita combo-row / drop-down pattern.
 *
 * - Fully keyboard-navigable: Space/Enter opens; ↑/↓ navigate; Enter selects; Escape closes.
 * - Uses `role="combobox"` + `role="listbox"` + `role="option"` ARIA pattern.
 * - Closes when clicking outside or pressing Escape.
 * - The list flips above the trigger when there is not enough space below.
 *
 * @see https://developer.gnome.org/hig/patterns/controls/drop-down-lists.html
 */
export function Dropdown<V extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled,
  className,
  ...props
}: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [flipUp, setFlipUp] = useState(false);

  const triggerId  = useId();
  const listboxId  = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Compute flip direction when opening
  const computeFlip = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const listH = Math.min(options.length * 48 + 8, 280);
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
    (opt: DropdownOption<V>) => {
      if (opt.disabled) return;
      onChange?.(opt.value);
      closeList();
    },
    [onChange, closeList]
  );

  // Scroll active item into view
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  // Close on outside click
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

  // Trigger keyboard handler
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
            options.reduce(
              (last, o, i) => (!o.disabled ? i : last),
              -1
            )
          );
          break;
      }
    },
    [openList, computeFlip, options]
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
    [options, activeIndex, selectOption, closeList]
  );

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      {...props}
    >
      {/* Trigger button */}
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
        className={[styles.trigger, open ? styles.triggerOpen : null]
          .filter(Boolean)
          .join(" ")}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={[styles.triggerLabel, !selected ? styles.placeholder : null]
          .filter(Boolean).join(" ")}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon={PanDown}
          size="md"
          aria-hidden
          className={[styles.chevron, open ? styles.chevronOpen : null]
            .filter(Boolean).join(" ")}
        />
      </button>

      {/* Listbox */}
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
                opt.value === value   ? styles.optionSelected : null,
                i === activeIndex     ? styles.optionActive   : null,
                opt.disabled          ? styles.optionDisabled : null,
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
              onClick={() => selectOption(opt)}
            >
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{opt.label}</span>
                {opt.description && (
                  <span className={styles.optionDesc}>{opt.description}</span>
                )}
              </span>
              {opt.value === value && (
                <Icon icon={Check} size="md" aria-hidden className={styles.checkIcon} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
