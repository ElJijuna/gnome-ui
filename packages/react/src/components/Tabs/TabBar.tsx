import {
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./Tabs.module.css";

export interface TabBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible label for the tab list. */
  "aria-label"?: string;
}

/**
 * Horizontal tab bar that holds `TabItem` elements.
 *
 * Manages roving-tabindex keyboard navigation (← → Home End).
 *
 * @see https://developer.gnome.org/hig/patterns/nav/tabs.html
 */
export function TabBar({
  children,
  className,
  "aria-label": ariaLabel = "Tabs",
  ...props
}: TabBarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role=tab]:not(:disabled)",
      ) ?? [],
    );
    const idx = tabs.findIndex((t) => t === document.activeElement);
    if (idx === -1) return;

    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;

    e.preventDefault();
    tabs[next].focus();
  }

  return (
    <div
      className={[styles.bar, className].filter(Boolean).join(" ")}
      {...props}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={styles.list}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
