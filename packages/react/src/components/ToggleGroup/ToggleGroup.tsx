import {
  createContext,
  useContext,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./ToggleGroup.module.css";

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToggleGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroup() {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) throw new Error("ToggleGroupItem must be used inside ToggleGroup");
  return ctx;
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────

export interface ToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the currently active toggle. */
  value: string;
  /** Called with the new value when a toggle is selected. */
  onValueChange: (value: string) => void;
  /** Accessible label for the group. */
  "aria-label"?: string;
  children?: ReactNode;
}

/**
 * Mutually-exclusive group of toggle buttons for in-place option selection.
 *
 * Mirrors `AdwToggleGroup` (libadwaita 1.7 / GNOME 48).
 *
 * Use for formatting controls, view-mode selectors, and toolbar options —
 * wherever a `ViewSwitcher` would be too heavy or is not placed in a HeaderBar.
 *
 * Compose with `ToggleGroupItem`. Keyboard: ← / → cycle, Home / End jump.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ToggleGroup.html
 */
export function ToggleGroup({
  value,
  onValueChange,
  "aria-label": ariaLabel = "Options",
  children,
  className,
  ...props
}: ToggleGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role=radio]:not(:disabled)",
      ) ?? [],
    );
    const idx = items.findIndex((el) => el === document.activeElement);
    if (idx === -1) return;

    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (idx + 1) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;

    e.preventDefault();
    items[next].focus();
    items[next].click();
  }

  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={[styles.group, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}
