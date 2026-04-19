import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBreakpoint } from "./index";

// ─── matchMedia mock ──────────────────────────────────────────────────────────
// jsdom does not implement matchMedia, so we define it via Object.defineProperty.

type ChangeHandler = (e: { matches: boolean }) => void;

function createMQL(matches: boolean) {
  const listeners: ChangeHandler[] = [];
  const mql = {
    matches,
    addEventListener: vi.fn((_: string, fn: ChangeHandler) => listeners.push(fn)),
    removeEventListener: vi.fn((_: string, fn: ChangeHandler) => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    }),
    trigger(nextMatches: boolean) {
      mql.matches = nextMatches; // update before handler so getSnapshot() reads the new value
      listeners.forEach((fn) => fn({ matches: nextMatches }));
    },
  };
  return mql;
}

type MockMQL = ReturnType<typeof createMQL>;

let mobileMQL:  MockMQL;
let tabletMQL:  MockMQL;
let desktopMQL: MockMQL;

function mockMatchMedia(mobile: boolean, tablet: boolean, desktop: boolean) {
  mobileMQL  = createMQL(mobile);
  tabletMQL  = createMQL(tablet);
  desktopMQL = createMQL(desktop);

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => {
      if (query === "(max-width: 479px)")                          return mobileMQL;
      if (query === "(min-width: 480px) and (max-width: 1023px)") return tabletMQL;
      if (query === "(min-width: 1024px)")                        return desktopMQL;
      return createMQL(false);
    }),
  });
}

afterEach(() => vi.restoreAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useBreakpoint", () => {

  describe("initial state", () => {
    it("returns isDesktop=true when viewport ≥ 1024 px", () => {
      mockMatchMedia(false, false, true);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toEqual({ isMobile: false, isTablet: false, isDesktop: true });
    });

    it("returns isTablet=true when viewport is 480–1023 px", () => {
      mockMatchMedia(false, true, false);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toEqual({ isMobile: false, isTablet: true, isDesktop: false });
    });

    it("returns isMobile=true when viewport < 480 px", () => {
      mockMatchMedia(true, false, false);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toEqual({ isMobile: true, isTablet: false, isDesktop: false });
    });
  });

  describe("reactivity", () => {
    beforeEach(() => mockMatchMedia(false, false, true));

    it("updates to isMobile when the mobile query fires", () => {
      const { result } = renderHook(() => useBreakpoint());

      act(() => {
        desktopMQL.trigger(false);
        mobileMQL.trigger(true);
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("updates to isTablet when the tablet query fires", () => {
      const { result } = renderHook(() => useBreakpoint());

      act(() => {
        desktopMQL.trigger(false);
        tabletMQL.trigger(true);
      });

      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("updates back to isDesktop after switching from mobile", () => {
      const { result } = renderHook(() => useBreakpoint());

      act(() => {
        desktopMQL.trigger(false);
        mobileMQL.trigger(true);
      });
      expect(result.current.isMobile).toBe(true);

      act(() => {
        mobileMQL.trigger(false);
        desktopMQL.trigger(true);
      });
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("removes all three listeners on unmount", () => {
      mockMatchMedia(false, false, true);
      const { unmount } = renderHook(() => useBreakpoint());
      unmount();
      expect(mobileMQL.removeEventListener).toHaveBeenCalledOnce();
      expect(tabletMQL.removeEventListener).toHaveBeenCalledOnce();
      expect(desktopMQL.removeEventListener).toHaveBeenCalledOnce();
    });
  });
});
