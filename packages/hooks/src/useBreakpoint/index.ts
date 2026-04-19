import { useEffect, useState } from "react";

export interface BreakpointInfo {
  /** `true` when viewport width is below 480 px. */
  isMobile: boolean;
  /** `true` when viewport width is between 480 px and 1023 px. */
  isTablet: boolean;
  /** `true` when viewport width is 1024 px or wider. */
  isDesktop: boolean;
}

const MOBILE  = "(max-width: 479px)";
const TABLET  = "(min-width: 480px) and (max-width: 1023px)";
const DESKTOP = "(min-width: 1024px)";

function getSnapshot(): BreakpointInfo {
  if (typeof window === "undefined") {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }
  return {
    isMobile:  window.matchMedia(MOBILE).matches,
    isTablet:  window.matchMedia(TABLET).matches,
    isDesktop: window.matchMedia(DESKTOP).matches,
  };
}

/**
 * Reactive viewport-size flags based on GNOME HIG adaptive layout breakpoints.
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint();
 * if (isMobile) return <CompactView />;
 */
export function useBreakpoint(): BreakpointInfo {
  const [state, setState] = useState<BreakpointInfo>(getSnapshot);

  useEffect(() => {
    const queries = [
      window.matchMedia(MOBILE),
      window.matchMedia(TABLET),
      window.matchMedia(DESKTOP),
    ];
    const handler = () => setState(getSnapshot());
    queries.forEach((mql) => mql.addEventListener("change", handler));
    return () => queries.forEach((mql) => mql.removeEventListener("change", handler));
  }, []);

  return state;
}
