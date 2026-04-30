import { describe, it, expect, vi, beforeEach } from "vitest";
import { isWebKitBridge, postMessage, onNativeEvent } from "./bridge.ts";

type WebKitWindow = Window & {
  webkit?: {
    messageHandlers: Record<string, { postMessage: (payload: unknown) => void }>;
  };
};

function setWebKit(
  handlers: Record<string, { postMessage: (payload: unknown) => void }>
) {
  (window as WebKitWindow).webkit = { messageHandlers: handlers };
}

function clearWebKit() {
  delete (window as WebKitWindow).webkit;
}

describe("isWebKitBridge", () => {
  beforeEach(clearWebKit);

  it("returns false when window.webkit is absent", () => {
    expect(isWebKitBridge()).toBe(false);
  });

  it("returns false when webkit has no messageHandlers", () => {
    (window as Window & { webkit?: unknown }).webkit = {};
    expect(isWebKitBridge()).toBe(false);
  });

  it("returns true when webkit.messageHandlers is present", () => {
    setWebKit({});
    expect(isWebKitBridge()).toBe(true);
  });
});

describe("postMessage", () => {
  beforeEach(clearWebKit);

  it("resolves immediately in a non-WebKit environment", async () => {
    await expect(postMessage("settings", { key: "value" })).resolves.toBeUndefined();
  });

  it("calls the matching channel handler in a WebKit environment", async () => {
    const spy = vi.fn();
    setWebKit({ settings: { postMessage: spy } });
    await postMessage("settings", { key: "value" });
    expect(spy).toHaveBeenCalledWith({ key: "value" });
  });

  it("resolves when the channel has no registered handler", async () => {
    setWebKit({});
    await expect(postMessage("notifications", {})).resolves.toBeUndefined();
  });

  it("resolves even when the handler throws", async () => {
    setWebKit({
      settings: {
        postMessage: () => {
          throw new Error("handler error");
        },
      },
    });
    await expect(postMessage("settings", {})).resolves.toBeUndefined();
  });
});

describe("onNativeEvent", () => {
  it("calls the handler with the event detail when the native event fires", () => {
    const handler = vi.fn();
    const off = onNativeEvent("modal-open", handler);
    window.dispatchEvent(new CustomEvent("gnome:modal-open", { detail: { id: "settings" } }));
    expect(handler).toHaveBeenCalledWith({ id: "settings" });
    off();
  });

  it("does not call the handler after unsubscribing", () => {
    const handler = vi.fn();
    const off = onNativeEvent("modal-close", handler);
    off();
    window.dispatchEvent(new CustomEvent("gnome:modal-close", { detail: {} }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call the handler for a different event type", () => {
    const handler = vi.fn();
    const off = onNativeEvent("target-event", handler);
    window.dispatchEvent(new CustomEvent("gnome:other-event", { detail: {} }));
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it("uses the 'gnome:' prefix — bare event name does not trigger the handler", () => {
    const handler = vi.fn();
    const off = onNativeEvent("bare-event", handler);
    window.dispatchEvent(new CustomEvent("bare-event", { detail: {} }));
    expect(handler).not.toHaveBeenCalled();
    off();
  });
});
