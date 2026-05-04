import {
  useState,
  useRef,
  useId,
  useCallback,
  useEffect,
  cloneElement,
  type ReactElement,
  type HTMLAttributes,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /**
   * The tooltip label. Keep it short — a noun phrase or brief description.
   * Do not duplicate information already visible on screen.
   */
  label: string;
  /**
   * Preferred placement relative to the trigger.
   * The tooltip flips automatically if there is not enough space.
   * Defaults to `"top"`.
   */
  placement?: TooltipPlacement;
  /**
   * Delay in milliseconds before the tooltip appears on hover.
   * Defaults to `500`. Set to `0` for instant.
   */
  delay?: number;
  /**
   * The element that triggers the tooltip.
   * Must be a single React element that can receive `ref` and event props.
   */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}

interface Position {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const GAP = 6; // px between trigger and tooltip

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

function computePosition(
  trigger: DOMRect,
  tooltip: DOMRect,
  preferred: TooltipPlacement
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const placements: TooltipPlacement[] = [
    preferred,
    preferred === "top" || preferred === "bottom"
      ? preferred === "top" ? "bottom" : "top"
      : preferred === "left" ? "right" : "left",
    "top",
    "bottom",
    "left",
    "right",
  ];

  for (const p of placements) {
    let top = 0;
    let left = 0;

    if (p === "top") {
      top  = trigger.top  - tooltip.height - GAP;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
    } else if (p === "bottom") {
      top  = trigger.bottom + GAP;
      left = trigger.left   + trigger.width / 2 - tooltip.width / 2;
    } else if (p === "left") {
      top  = trigger.top  + trigger.height / 2 - tooltip.height / 2;
      left = trigger.left - tooltip.width - GAP;
    } else {
      top  = trigger.top    + trigger.height / 2 - tooltip.height / 2;
      left = trigger.right  + GAP;
    }

    // Clamp to viewport with 8 px margin
    const margin = 8;
    const fitsH = left >= margin && left + tooltip.width  <= vw - margin;
    const fitsV = top  >= margin && top  + tooltip.height <= vh - margin;

    if (fitsH && fitsV) {
      return {
        top:  Math.max(margin, Math.min(top,  vh - tooltip.height - margin)),
        left: Math.max(margin, Math.min(left, vw - tooltip.width  - margin)),
        placement: p,
      };
    }
  }

  // Fallback: clamp preferred
  let top = 0, left = 0;
  if (preferred === "top")    { top = trigger.top - tooltip.height - GAP; left = trigger.left + trigger.width / 2 - tooltip.width / 2; }
  if (preferred === "bottom") { top = trigger.bottom + GAP;               left = trigger.left + trigger.width / 2 - tooltip.width / 2; }
  if (preferred === "left")   { top = trigger.top + trigger.height / 2 - tooltip.height / 2; left = trigger.left - tooltip.width - GAP; }
  if (preferred === "right")  { top = trigger.top + trigger.height / 2 - tooltip.height / 2; left = trigger.right + GAP; }

  const margin = 8;
  return {
    top:  Math.max(margin, Math.min(top,  vh - tooltip.height - margin)),
    left: Math.max(margin, Math.min(left, window.innerWidth - tooltip.width  - margin)),
    placement: preferred,
  };
}

/**
 * Informational tooltip following the Adwaita / GNOME HIG pattern.
 *
 * Wraps a single trigger element and shows a floating label on hover or
 * keyboard focus. The tooltip is positioned automatically and flips if
 * there is not enough space.
 *
 * - `aria-describedby` is wired to the trigger automatically.
 * - The tooltip itself is `role="tooltip"` and rendered in a portal.
 * - Does not show on touch — touch devices have no hover state.
 *
 * @example
 * <Tooltip label="Save file (Ctrl+S)">
 *   <Button aria-label="Save"><Icon icon={Save} /></Button>
 * </Tooltip>
 *
 * @see https://developer.gnome.org/hig/patterns/feedback/tooltips.html
 */
export function Tooltip({
  label,
  placement: preferredPlacement = "top",
  delay = 500,
  children,
}: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const place = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setPos(computePosition(triggerRect, tooltipRect, preferredPlacement));
  }, [preferredPlacement]);

  // Reposition on scroll/resize while visible
  useEffect(() => {
    if (!visible) return;
    place();
    window.addEventListener("scroll", place, { passive: true, capture: true });
    window.addEventListener("resize", place, { passive: true });
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [visible, place]);

  const show = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
    setPos(null);
  }, []);

  // Position as soon as the tooltip mounts
  useEffect(() => {
    if (visible) place();
  }, [visible, place]);

  // Dismiss on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, hide]);

  const childRef = (children.props as HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLElement>;
  }).ref;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const child = cloneElement(children as any, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(childRef, node);
    },
    "aria-describedby": id,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      children.props.onBlur?.(e);
    },
  });

  const tooltip = (
    <div
      ref={tooltipRef}
      id={id}
      role="tooltip"
      className={[
        styles.tooltip,
        pos ? styles[pos.placement] : null,
        visible && pos ? styles.visible : null,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        pos
          ? { top: pos.top, left: pos.left }
          : { visibility: "hidden", top: -9999, left: -9999 }
      }
    >
      {label}
    </div>
  );

  return (
    <>
      {child}
      {typeof document !== "undefined"
        ? createPortal(tooltip, document.body)
        : tooltip}
    </>
  );
}
