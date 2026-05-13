import { useEffect, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@gnome-ui/react";
import type {
  LayoutSidebarBreakpoint,
  LayoutSidebarOpenChangeReason,
} from "../Layout";

const sidebarBreakpointQuery: Record<LayoutSidebarBreakpoint, string> = {
  narrow: "(max-width: 400px)",
  medium: "(max-width: 550px)",
  wide: "(max-width: 860px)",
};

function matchesSidebarOverlay(breakpoint: LayoutSidebarBreakpoint) {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(sidebarBreakpointQuery[breakpoint]).matches;
}

export interface SidebarTriggerProps extends Omit<ButtonProps, "onClick"> {
  /** Current overlay-open state. */
  sidebarOpen: boolean;
  /** Current rail-collapsed state. */
  sidebarCollapsed: boolean;
  /** Breakpoint at which the sidebar becomes an overlay. */
  sidebarBreakpoint?: LayoutSidebarBreakpoint;
  /** Called when the trigger toggles overlay open state. */
  onSidebarOpenChange: (
    open: boolean,
    reason: LayoutSidebarOpenChangeReason,
  ) => void;
  /** Called when the trigger toggles rail collapse state. */
  onSidebarCollapsedChange: (collapsed: boolean) => void;
  /** Button contents. Defaults to a menu glyph. */
  children?: ReactNode;
}

/**
 * Sidebar toggle button for app headers.
 *
 * On overlay breakpoints it opens/closes the sidebar. On wider screens it
 * toggles icon-only rail collapse.
 */
export function SidebarTrigger({
  sidebarOpen,
  sidebarCollapsed,
  sidebarBreakpoint = "narrow",
  onSidebarOpenChange,
  onSidebarCollapsedChange,
  children = "☰",
  "aria-label": ariaLabel,
  variant = "flat",
  ...props
}: SidebarTriggerProps) {
  const [overlay, setOverlay] = useState(() =>
    matchesSidebarOverlay(sidebarBreakpoint),
  );
  const sidebarVisible = overlay ? sidebarOpen : !sidebarCollapsed;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setOverlay(false);
      return undefined;
    }

    const mediaQuery = window.matchMedia(sidebarBreakpointQuery[sidebarBreakpoint]);
    const updateOverlay = () => setOverlay(mediaQuery.matches);

    updateOverlay();
    mediaQuery.addEventListener?.("change", updateOverlay);
    return () => mediaQuery.removeEventListener?.("change", updateOverlay);
  }, [sidebarBreakpoint]);

  const handleClick = () => {
    if (overlay) {
      onSidebarOpenChange(!sidebarOpen, "trigger");
    } else {
      onSidebarCollapsedChange(!sidebarCollapsed);
    }
  };

  return (
    <Button
      {...props}
      type="button"
      variant={variant}
      aria-label={ariaLabel ?? (sidebarVisible ? "Hide sidebar" : "Show sidebar")}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
