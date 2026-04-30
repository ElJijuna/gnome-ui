import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRuntime } from "@gnome-ui/platform";
import type { RuntimeInfo } from "@gnome-ui/platform";
import { usePlatform } from "./index";

vi.mock("@gnome-ui/platform", () => ({
  getRuntime: vi.fn(),
}));

function mockRuntime(
  shell: RuntimeInfo["shell"],
  epiphany = false
): RuntimeInfo {
  return {
    shell,
    engine: "blink",
    browser: {
      epiphany,
      chrome: false,
      firefox: false,
      safari: false,
      edge: false,
      brave: false,
    },
    os: {
      android: false,
      ios: false,
      linux: true,
      mac: false,
      windows: false,
    },
  };
}

describe("usePlatform", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets all flags correctly for the default browser shell", () => {
    vi.mocked(getRuntime).mockReturnValue(mockRuntime("browser"));
    const { result } = renderHook(() => usePlatform());
    expect(result.current).toEqual({
      isGnomeWebView: false,
      isPWA: false,
      isElectron: false,
      isBrowser: true,
      isEpiphany: false,
    });
  });

  describe("isGnomeWebView", () => {
    it("is true when shell is webkitgtk-webview", () => {
      vi.mocked(getRuntime).mockReturnValue(mockRuntime("webkitgtk-webview"));
      const { result } = renderHook(() => usePlatform());
      expect(result.current.isGnomeWebView).toBe(true);
      expect(result.current.isBrowser).toBe(false);
    });
  });

  describe("isPWA", () => {
    it("is true when shell is pwa", () => {
      vi.mocked(getRuntime).mockReturnValue(mockRuntime("pwa"));
      const { result } = renderHook(() => usePlatform());
      expect(result.current.isPWA).toBe(true);
      expect(result.current.isBrowser).toBe(false);
    });
  });

  describe("isElectron", () => {
    it("is true when shell is electron", () => {
      vi.mocked(getRuntime).mockReturnValue(mockRuntime("electron"));
      const { result } = renderHook(() => usePlatform());
      expect(result.current.isElectron).toBe(true);
      expect(result.current.isBrowser).toBe(false);
    });
  });

  describe("isEpiphany", () => {
    it("is true when browser.epiphany is true", () => {
      vi.mocked(getRuntime).mockReturnValue(mockRuntime("browser", true));
      const { result } = renderHook(() => usePlatform());
      expect(result.current.isEpiphany).toBe(true);
    });

    it("is false when browser.epiphany is false", () => {
      vi.mocked(getRuntime).mockReturnValue(mockRuntime("browser", false));
      const { result } = renderHook(() => usePlatform());
      expect(result.current.isEpiphany).toBe(false);
    });
  });

  it("returns the same object reference across re-renders (memoized)", () => {
    vi.mocked(getRuntime).mockReturnValue(mockRuntime("browser"));
    const { result, rerender } = renderHook(() => usePlatform());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
