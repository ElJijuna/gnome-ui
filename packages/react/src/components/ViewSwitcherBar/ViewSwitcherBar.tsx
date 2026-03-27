import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ViewSwitcherBar.module.css";

export interface ViewSwitcherBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `ViewSwitcherItem` elements to render in the bottom bar.
   * Use the same items you pass to the header-bar `ViewSwitcher`.
   */
  children: ReactNode;
  /**
   * Whether the bar is visible.
   * Typically tied to `useBreakpoint().isMedium` so it appears
   * automatically when the window is ≤ 550 px wide.
   */
  reveal?: boolean;
}

/**
 * Bottom navigation bar for `ViewSwitcher` items on narrow screens (≤ 550 px),
 * mirroring the Adwaita `AdwViewSwitcherBar` pattern.
 *
 * Use in tandem with a `ViewSwitcher` in the `HeaderBar`:
 * - **Wide** (> 550 px): show the `ViewSwitcher` in the header, hide the bar.
 * - **Narrow** (≤ 550 px): hide the header switcher, reveal the bar.
 *
 * @example
 * const { isMedium } = useBreakpoint();
 * <>
 *   <HeaderBar
 *     title={
 *       !isMedium && (
 *         <ViewSwitcher aria-label="View">…items…</ViewSwitcher>
 *       )
 *     }
 *   />
 *   <ViewSwitcherBar reveal={isMedium}>…items…</ViewSwitcherBar>
 * </>
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ViewSwitcherBar.html
 */
export function ViewSwitcherBar({
  children,
  reveal = true,
  className,
  ...props
}: ViewSwitcherBarProps) {
  if (!reveal) return null;

  return (
    <div
      role="navigation"
      aria-label="Bottom navigation"
      className={[styles.bar, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
