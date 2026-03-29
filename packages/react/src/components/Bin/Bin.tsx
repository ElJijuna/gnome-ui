import type { HTMLAttributes, ReactNode } from "react";

export interface BinProps extends HTMLAttributes<HTMLDivElement> {
  /** Single child. */
  children?: ReactNode;
}

/**
 * Single-child container with no visual styling.
 *
 * A transparent wrapper that constrains its content to one child while
 * forwarding all HTML div attributes. Useful as a base for custom components
 * that need a neutral container — e.g. to apply layout or size constraints
 * without introducing visual chrome.
 *
 * Mirrors `AdwBin`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Bin.html
 */
export function Bin({ children, ...props }: BinProps) {
  return <div {...props}>{children}</div>;
}
