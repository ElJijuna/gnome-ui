import {
  useState,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from "react";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface BreakpointDefinition {
  /**
   * Identifier for this breakpoint, e.g. `"compact"` or `"narrow"`.
   * Exposed as `data-breakpoint` on the container element for CSS targeting.
   */
  name: string;
  /**
   * Container width threshold in pixels.
   * This breakpoint becomes active when the container width is ≤ this value.
   */
  maxWidth: number;
}

export interface BreakpointBinState {
  /**
   * Name of the currently active breakpoint, or `null` when the container
   * is wider than all defined breakpoints.
   */
  activeBreakpoint: string | null;
  /** Current container width in px (from `ResizeObserver`). */
  width: number;
}

export interface BreakpointBinProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Breakpoint definitions sorted by `maxWidth` ascending.
   * The active breakpoint is the smallest `maxWidth` ≥ the container's current width.
   */
  breakpoints: BreakpointDefinition[];
  /**
   * Render prop that receives the current breakpoint state.
   *
   * @example
   * ```tsx
   * <BreakpointBin breakpoints={[{ name: "compact", maxWidth: 400 }]}>
   *   {({ activeBreakpoint }) =>
   *     activeBreakpoint === "compact" ? <CompactLayout /> : <WideLayout />
   *   }
   * </BreakpointBin>
   * ```
   */
  children: (state: BreakpointBinState) => ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Container that fires layout changes when **its own width** crosses defined
 * thresholds — the CSS container-query equivalent of `AdwBreakpointBin`
 * (libadwaita 1.9 / GNOME 50).
 *
 * Unlike `useBreakpoint` (which watches the viewport), `BreakpointBin` uses
 * `ResizeObserver` to watch the element itself. This makes it composable:
 * the same component can behave differently depending on how much space it
 * is given by its parent, regardless of the viewport size.
 *
 * ### How it works
 * - Breakpoints are evaluated in ascending `maxWidth` order.
 * - The active breakpoint is the first one whose `maxWidth` ≥ the container width.
 * - When no breakpoint matches (container is wider than all), `activeBreakpoint` is `null`.
 * - The active name is set as `data-breakpoint` on the wrapper `<div>` for CSS targeting.
 *
 * ### CSS targeting
 * ```css
 * .myWidget[data-breakpoint="compact"] .layout { flex-direction: column; }
 * ```
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.BreakpointBin.html
 */
export function BreakpointBin({
  breakpoints,
  children,
  className,
  style,
  ...props
}: BreakpointBinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BreakpointBinState>({
    activeBreakpoint: null,
    width: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Sort breakpoints ascending so we find the smallest matching threshold
    const sorted = [...breakpoints].sort((a, b) => a.maxWidth - b.maxWidth);

    const evaluate = (width: number): BreakpointBinState => {
      const match = sorted.find((bp) => width <= bp.maxWidth) ?? null;
      return { activeBreakpoint: match?.name ?? null, width };
    };

    // Initial measurement
    setState(evaluate(el.offsetWidth));

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // contentBoxSize is more reliable than contentRect for inline-size
      const width =
        entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setState(evaluate(width));
    });

    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(breakpoints)]);

  const containerStyle: CSSProperties = {
    // Ensure the container establishes a containing block
    // so ResizeObserver reflects actual layout width
    minWidth: 0,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      data-breakpoint={state.activeBreakpoint ?? undefined}
      {...props}
    >
      {children(state)}
    </div>
  );
}
