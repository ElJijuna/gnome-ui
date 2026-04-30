import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRuntime } from "@gnome-ui/platform";
import type { RuntimeInfo } from "@gnome-ui/platform";
import { useRuntime } from "./index";

vi.mock("@gnome-ui/platform", () => ({
  getRuntime: vi.fn(),
}));

const mockRuntime: RuntimeInfo = {
  shell: "browser",
  engine: "blink",
  browser: {
    epiphany: false,
    chrome: true,
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

describe("useRuntime", () => {
  beforeEach(() => {
    vi.mocked(getRuntime).mockReturnValue(mockRuntime);
  });

  it("returns the RuntimeInfo from getRuntime()", () => {
    const { result } = renderHook(() => useRuntime());
    expect(result.current).toEqual(mockRuntime);
  });

  it("returns the same object reference across re-renders (memoized)", () => {
    // Return a new object on every call so reference identity proves memoization,
    // not mock stability.
    vi.mocked(getRuntime).mockImplementation(() => ({ ...mockRuntime }));
    const { result, rerender } = renderHook(() => useRuntime());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
