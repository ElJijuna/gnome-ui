import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onNativeEvent } from "@gnome-ui/platform";
import { useNativeEvent } from "./index";

vi.mock("@gnome-ui/platform", () => ({
  onNativeEvent: vi.fn(),
}));

describe("useNativeEvent", () => {
  const unsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onNativeEvent).mockReturnValue(unsubscribe);
  });

  it("subscribes to the given event type on mount", () => {
    renderHook(() => useNativeEvent("open-modal", vi.fn()));
    expect(onNativeEvent).toHaveBeenCalledWith("open-modal", expect.any(Function));
  });

  it("invokes the handler with the event payload", () => {
    let capturedCallback: ((payload: unknown) => void) | undefined;
    vi.mocked(onNativeEvent).mockImplementation((_type, fn) => {
      capturedCallback = fn;
      return unsubscribe;
    });

    const handler = vi.fn();
    renderHook(() => useNativeEvent("open-modal", handler));
    capturedCallback?.({ id: "settings" });
    expect(handler).toHaveBeenCalledWith({ id: "settings" });
  });

  it("always calls the latest handler without re-subscribing", () => {
    let capturedCallback: ((payload: unknown) => void) | undefined;
    vi.mocked(onNativeEvent).mockImplementation((_type, fn) => {
      capturedCallback = fn;
      return unsubscribe;
    });

    const firstHandler = vi.fn();
    const secondHandler = vi.fn();
    const { rerender } = renderHook(
      ({ handler }: { handler: (p: unknown) => void }) =>
        useNativeEvent("open-modal", handler),
      { initialProps: { handler: firstHandler } }
    );
    rerender({ handler: secondHandler });
    capturedCallback?.({ id: "settings" });

    expect(secondHandler).toHaveBeenCalledWith({ id: "settings" });
    expect(firstHandler).not.toHaveBeenCalled();
    expect(onNativeEvent).toHaveBeenCalledTimes(1);
  });

  it("calls the unsubscribe function on unmount", () => {
    const { unmount } = renderHook(() => useNativeEvent("open-modal", vi.fn()));
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("re-subscribes when the event type changes", () => {
    const { rerender } = renderHook(
      ({ type }: { type: string }) => useNativeEvent(type, vi.fn()),
      { initialProps: { type: "event-a" } }
    );
    rerender({ type: "event-b" });

    expect(onNativeEvent).toHaveBeenCalledTimes(2);
    expect(onNativeEvent).toHaveBeenLastCalledWith("event-b", expect.any(Function));
  });

  it("unsubscribes from the old type when the event type changes", () => {
    const { rerender } = renderHook(
      ({ type }: { type: string }) => useNativeEvent(type, vi.fn()),
      { initialProps: { type: "event-a" } }
    );
    expect(unsubscribe).not.toHaveBeenCalled();
    rerender({ type: "event-b" });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("does not re-subscribe when only the handler changes", () => {
    const { rerender } = renderHook(
      ({ handler }: { handler: () => void }) =>
        useNativeEvent("open-modal", handler),
      { initialProps: { handler: vi.fn() } }
    );
    rerender({ handler: vi.fn() });
    expect(onNativeEvent).toHaveBeenCalledTimes(1);
  });
});
