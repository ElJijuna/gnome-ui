import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isWebKitBridge, postMessage } from "@gnome-ui/platform";
import { useHapticFeedback } from "./index";

vi.mock("@gnome-ui/platform", () => ({
  isWebKitBridge: vi.fn(),
  postMessage: vi.fn(),
}));

function setVibrationApi(available: boolean) {
  if (available) {
    Object.defineProperty(navigator, "vibrate", {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
  } else {
    Object.defineProperty(navigator, "vibrate", {
      value: undefined,
      configurable: true,
      writable: true,
    });
  }
}

describe("useHapticFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isWebKitBridge).mockReturnValue(false);
    setVibrationApi(false);
  });

  describe("flags", () => {
    it("isNativeSupported is true when inside WebKitGTK WebView", () => {
      vi.mocked(isWebKitBridge).mockReturnValue(true);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isNativeSupported).toBe(true);
    });

    it("isNativeSupported is false outside WebKitGTK WebView", () => {
      vi.mocked(isWebKitBridge).mockReturnValue(false);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isNativeSupported).toBe(false);
    });

    it("isVibrationApiSupported is true when navigator.vibrate is available", () => {
      setVibrationApi(true);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isVibrationApiSupported).toBe(true);
    });

    it("isVibrationApiSupported is false when navigator.vibrate is unavailable", () => {
      setVibrationApi(false);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isVibrationApiSupported).toBe(false);
    });

    it("isSupported is true when native is available", () => {
      vi.mocked(isWebKitBridge).mockReturnValue(true);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isSupported).toBe(true);
    });

    it("isSupported is true when only vibration API is available", () => {
      setVibrationApi(true);
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isSupported).toBe(true);
    });

    it("isSupported is false when neither mechanism is available", () => {
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe("trigger — native path", () => {
    beforeEach(() => {
      vi.mocked(isWebKitBridge).mockReturnValue(true);
    });

    it("calls postMessage with hapticFeedback channel and event", () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger("button-pressed");
      expect(postMessage).toHaveBeenCalledWith("hapticFeedback", {
        event: "button-pressed",
      });
    });

    it("does not call navigator.vibrate on native path", () => {
      setVibrationApi(true);
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger("button-pressed");
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });

    it("forwards custom x- prefixed events", () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger("x-myapp-custom");
      expect(postMessage).toHaveBeenCalledWith("hapticFeedback", {
        event: "x-myapp-custom",
      });
    });
  });

  describe("trigger — vibration API fallback", () => {
    beforeEach(() => {
      vi.mocked(isWebKitBridge).mockReturnValue(false);
      setVibrationApi(true);
    });

    it.each([
      ["button-pressed", [10]],
      ["button-released", [5]],
      ["window-close", [50]],
      ["message-new-instant", [50, 50, 50]],
      ["message-new-sms", [50, 50, 50]],
      ["phone-incoming-call", [200, 100, 200]],
      ["alarm-clock-elapsed", [300, 100, 300]],
      ["battery-low", [100, 50, 100]],
    ] as const)("trigger('%s') vibrates with pattern %j", (event, pattern) => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger(event);
      expect(navigator.vibrate).toHaveBeenCalledWith(pattern);
    });

    it("uses generic fallback pattern for unknown events", () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger("x-unknown-event");
      expect(navigator.vibrate).toHaveBeenCalledWith([30]);
    });

    it("does not call postMessage on vibration path", () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.trigger("button-pressed");
      expect(postMessage).not.toHaveBeenCalled();
    });
  });

  describe("trigger — no-op path", () => {
    it("does not call postMessage or navigator.vibrate", () => {
      setVibrationApi(true);
      const vibrateSpy = vi.spyOn(navigator, "vibrate");
      const { result } = renderHook(() => useHapticFeedback());

      // override to simulate no-op: both false
      vi.mocked(isWebKitBridge).mockReturnValue(false);
      setVibrationApi(false);
      const { result: resultNoSupport } = renderHook(() => useHapticFeedback());
      resultNoSupport.current.trigger("button-pressed");

      expect(postMessage).not.toHaveBeenCalled();
      vibrateSpy.mockRestore();
    });
  });

  it("returns the same object reference across re-renders (memoized)", () => {
    vi.mocked(isWebKitBridge).mockReturnValue(false);
    const { result, rerender } = renderHook(() => useHapticFeedback());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
