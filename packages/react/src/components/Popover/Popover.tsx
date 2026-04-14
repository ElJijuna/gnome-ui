import {
  useState,
  useRef,
  useId,
  useEffect,
  useCallback,
  cloneElement,
  type ReactElement,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
  /**
   * The rich content rendered inside the popover panel.
   * Can include interactive elements (buttons, links, forms).
   */
  content: ReactNode;
  /**
   * Preferred placement relative to the trigger.
   * Flips automatically when there is not enough viewport space.
   * Defaults to `"bottom"`.
   */
  placement?: PopoverPlacement;
  /**
   * Whether the popover is open (controlled mode).
   * Omit to use uncontrolled mode where the trigger toggles it.
   */
  open?: boolean;
  /**
   * Called when the popover requests to be closed
   * (Escape key, outside click, or trigger click while open).
   */
  onClose?: () => void;
  /**
   * Called when open state should change (controlled mode).
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The trigger element. Must be a single React element that can
   * receive `ref` and click/keyboard event props.
   */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}

interface Position {
  top: number;
  left: number;
  placement: PopoverPlacement;
  /** Arrow center offset in px from the near edge of the panel.
   *  Horizontal (left) for top/bottom; vertical (top) for left/right.
   *  Undefined means use the default 50% CSS. */
  arrowOffset?: number;
}

const GAP = 8;
const MARGIN = 10;
const ARROW_HALF = 6; // half of the 12 px arrow

function computePosition(
  trigger: DOMRect,
  popover: DOMRect,
  preferred: PopoverPlacement
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const order: PopoverPlacement[] = [
    preferred,
    preferred === "top"    ? "bottom"
    : preferred === "bottom" ? "top"
    : preferred === "left"   ? "right"
    : "left",
    "bottom", "top", "left", "right",
  ];

  // De-duplicate while preserving order
  const candidates = [...new Set(order)];

  function calcRaw(p: PopoverPlacement): { top: number; left: number } {
    if (p === "bottom") return {
      top:  trigger.bottom + GAP,
      left: trigger.left + trigger.width / 2 - popover.width / 2,
    };
    if (p === "top") return {
      top:  trigger.top - popover.height - GAP,
      left: trigger.left + trigger.width / 2 - popover.width / 2,
    };
    if (p === "left") return {
      top:  trigger.top + trigger.height / 2 - popover.height / 2,
      left: trigger.left - popover.width - GAP,
    };
    return {
      top:  trigger.top + trigger.height / 2 - popover.height / 2,
      left: trigger.right + GAP,
    };
  }

  // First pass: find a placement that fits both axes perfectly.
  for (const p of candidates) {
    const { top, left } = calcRaw(p);
    const fitsH = left >= MARGIN && left + popover.width  <= vw - MARGIN;
    const fitsV = top  >= MARGIN && top  + popover.height <= vh - MARGIN;
    if (fitsH && fitsV) {
      // Always use pixel arrowOffset (never rely on CSS left:50%) so the arrow
      // points exactly at the trigger center regardless of sub-pixel rounding.
      const arrowOffset =
        p === "top" || p === "bottom"
          ? trigger.left + trigger.width  / 2 - left
          : trigger.top  + trigger.height / 2 - top;
      return { top, left, placement: p, arrowOffset };
    }
  }

  // Second pass: fits the primary axis; clamp the secondary axis and
  // shift the arrow so it still points at the trigger center.
  for (const p of candidates) {
    const { top, left } = calcRaw(p);
    const fitsV = top  >= MARGIN && top  + popover.height <= vh - MARGIN;
    const fitsH = left >= MARGIN && left + popover.width  <= vw - MARGIN;

    if ((p === "top" || p === "bottom") && fitsV) {
      const clampedLeft = Math.max(MARGIN, Math.min(left, vw - popover.width - MARGIN));
      const rawOffset = trigger.left + trigger.width / 2 - clampedLeft;
      return {
        top, left: clampedLeft, placement: p,
        arrowOffset: Math.max(ARROW_HALF + 4, Math.min(rawOffset, popover.width - ARROW_HALF - 4)),
      };
    }

    if ((p === "left" || p === "right") && fitsH) {
      const clampedTop = Math.max(MARGIN, Math.min(top, vh - popover.height - MARGIN));
      const rawOffset = trigger.top + trigger.height / 2 - clampedTop;
      return {
        top: clampedTop, left, placement: p,
        arrowOffset: Math.max(ARROW_HALF + 4, Math.min(rawOffset, popover.height - ARROW_HALF - 4)),
      };
    }
  }

  // Fallback: clamp bottom placement and shift arrow to match trigger.
  const fbTop  = trigger.bottom + GAP;
  const fbLeft = trigger.left + trigger.width / 2 - popover.width / 2;
  const clampedTop  = Math.max(MARGIN, Math.min(fbTop,  vh - popover.height - MARGIN));
  const clampedLeft = Math.max(MARGIN, Math.min(fbLeft, vw - popover.width  - MARGIN));
  const rawArrowOffset = trigger.left + trigger.width / 2 - clampedLeft;
  return {
    top: clampedTop,
    left: clampedLeft,
    placement: "bottom",
    arrowOffset: Math.max(ARROW_HALF + 4, Math.min(rawArrowOffset, popover.width - ARROW_HALF - 4)),
  };
}

/**
 * Floating panel anchored to a trigger element.
 *
 * Unlike `Tooltip`, a Popover can contain rich interactive content
 * (menus, forms, details). It follows the Adwaita `GtkPopover` pattern.
 *
 * - Supports both controlled (`open` + `onClose`) and uncontrolled modes.
 * - Auto-positions with viewport-aware flip.
 * - Closes on Escape, outside click, or trigger re-click.
 * - Focus is moved into the panel on open; returns to the trigger on close.
 * - `aria-haspopup="dialog"` + `aria-expanded` wired to the trigger.
 * - `role="dialog"` on the panel with `aria-labelledby` when a heading is present.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Popover.html
 */
export function Popover({
  content,
  placement: preferredPlacement = "bottom",
  open: controlledOpen,
  onClose,
  onOpenChange,
  children,
}: PopoverProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const [pos, setPos] = useState<Position | null>(null);

  const triggerId  = useId();
  const popoverId  = useId();
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const close = useCallback(() => {
    if (isControlled) {
      onClose?.();
    } else {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onClose, onOpenChange]);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      if (!isControlled) setUncontrolledOpen(true);
      onOpenChange?.(true);
    }
  }, [open, close, isControlled, onOpenChange]);

  // Position panel
  const place = useCallback(() => {
    if (!triggerRef.current || !panelRef.current) return;
    setPos(
      computePosition(
        triggerRef.current.getBoundingClientRect(),
        panelRef.current.getBoundingClientRect(),
        preferredPlacement
      )
    );
  }, [preferredPlacement]);

  // Reposition on open, scroll, resize
  useEffect(() => {
    if (!open) return;
    // Two RAF: first lets panel mount with hidden styles so we can measure it;
    // second applies the measured position.
    const id = requestAnimationFrame(() => {
      place();
      window.addEventListener("scroll", place, { passive: true, capture: true });
      window.addEventListener("resize", place, { passive: true });
    });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  // Save / restore focus
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (first ?? panelRef.current)?.focus();
      });
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
      setPos(null);
    }
  }, [open]);

  // Close on outside pointer
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  // Escape key
  const handlePanelKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    },
    [close]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trigger = cloneElement(children as any, {
    ref: triggerRef,
    id: triggerId,
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? popoverId : undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      toggle();
      children.props.onClick?.(e);
    },
  });

  const panel = (
    <div
      ref={panelRef}
      id={popoverId}
      role="dialog"
      aria-labelledby={triggerId}
      tabIndex={-1}
      className={[
        styles.panel,
        pos ? styles[pos.placement] : null,
        open && pos ? styles.visible : null,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        pos
          ? { top: pos.top, left: pos.left }
          : { visibility: "hidden", pointerEvents: "none", top: -9999, left: -9999 }
      }
      onKeyDown={handlePanelKeyDown}
    >
      {/* Arrow — offset shifts it to point at the trigger when the panel is clamped */}
      <div
        className={styles.arrow}
        aria-hidden="true"
        style={
          pos?.arrowOffset !== undefined
            ? pos.placement === "top" || pos.placement === "bottom"
              ? { left: pos.arrowOffset - ARROW_HALF, marginLeft: 0 }
              : { top:  pos.arrowOffset - ARROW_HALF, marginTop: 0 }
            : undefined
        }
      />
      {content}
    </div>
  );

  return (
    <>
      {trigger}
      {open &&
        (typeof document !== "undefined"
          ? createPortal(panel, document.body)
          : panel)}
    </>
  );
}
