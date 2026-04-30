import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Representative user-agent strings
const UA = {
  chrome:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  firefox:
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  epiphany:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Epiphany/44.0 Safari/605.1.15",
  edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  iosSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  unknown: "CustomBrowser/1.0",
} as const;

type ExtendedWindow = Window & {
  webkit?: { messageHandlers: Record<string, unknown> };
  process?: { versions?: { electron?: string } };
};

function setUA(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

describe("getRuntime", () => {
  beforeEach(() => {
    vi.resetModules();
    delete (window as ExtendedWindow).webkit;
  });

  afterEach(() => {
    delete (window as ExtendedWindow).webkit;
    vi.unstubAllGlobals();
  });

  it("returns the same object on repeated calls (memoized)", async () => {
    setUA(UA.chrome);
    const { getRuntime } = await import("./runtime.ts");
    expect(getRuntime()).toBe(getRuntime());
  });

  describe("engine detection", () => {
    it("detects blink for a Chrome UA", async () => {
      setUA(UA.chrome);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().engine).toBe("blink");
    });

    it("detects gecko for a Firefox UA", async () => {
      setUA(UA.firefox);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().engine).toBe("gecko");
    });

    it("detects webkit for a Safari UA", async () => {
      setUA(UA.safari);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().engine).toBe("webkit");
    });

    it("returns unknown for an unrecognized UA", async () => {
      setUA(UA.unknown);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().engine).toBe("unknown");
    });
  });

  describe("browser detection", () => {
    it("identifies Chrome (not Edge)", async () => {
      setUA(UA.chrome);
      const { getRuntime } = await import("./runtime.ts");
      const { browser } = getRuntime();
      expect(browser.chrome).toBe(true);
      expect(browser.edge).toBe(false);
      expect(browser.firefox).toBe(false);
      expect(browser.epiphany).toBe(false);
    });

    it("identifies Firefox", async () => {
      setUA(UA.firefox);
      const { getRuntime } = await import("./runtime.ts");
      const { browser } = getRuntime();
      expect(browser.firefox).toBe(true);
      expect(browser.chrome).toBe(false);
    });

    it("identifies Safari (not Chrome, not Epiphany)", async () => {
      setUA(UA.safari);
      const { getRuntime } = await import("./runtime.ts");
      const { browser } = getRuntime();
      expect(browser.safari).toBe(true);
      expect(browser.chrome).toBe(false);
      expect(browser.epiphany).toBe(false);
    });

    it("identifies Epiphany (not generic Safari)", async () => {
      setUA(UA.epiphany);
      const { getRuntime } = await import("./runtime.ts");
      const { browser } = getRuntime();
      expect(browser.epiphany).toBe(true);
      expect(browser.safari).toBe(false);
    });

    it("identifies Edge (not Chrome)", async () => {
      setUA(UA.edge);
      const { getRuntime } = await import("./runtime.ts");
      const { browser } = getRuntime();
      expect(browser.edge).toBe(true);
      expect(browser.chrome).toBe(false);
    });
  });

  describe("OS detection", () => {
    it("detects Linux from a Chrome/Linux UA", async () => {
      setUA(UA.chrome);
      const { getRuntime } = await import("./runtime.ts");
      const { os } = getRuntime();
      expect(os.linux).toBe(true);
      expect(os.android).toBe(false);
    });

    it("detects macOS from a Safari UA", async () => {
      setUA(UA.safari);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().os.mac).toBe(true);
    });

    it("detects Windows from an Edge UA", async () => {
      setUA(UA.edge);
      const { getRuntime } = await import("./runtime.ts");
      const { os } = getRuntime();
      expect(os.windows).toBe(true);
      expect(os.linux).toBe(false);
    });

    it("detects Android and excludes the Linux flag", async () => {
      setUA(UA.androidChrome);
      const { getRuntime } = await import("./runtime.ts");
      const { os } = getRuntime();
      expect(os.android).toBe(true);
      expect(os.linux).toBe(false);
    });

    it("detects iOS", async () => {
      setUA(UA.iosSafari);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().os.ios).toBe(true);
    });
  });

  describe("shell detection", () => {
    it('returns "browser" by default', async () => {
      setUA(UA.chrome);
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().shell).toBe("browser");
    });

    it('returns "webkitgtk-webview" when webkit.messageHandlers is present', async () => {
      setUA(UA.epiphany);
      (window as ExtendedWindow).webkit = { messageHandlers: {} };
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().shell).toBe("webkitgtk-webview");
    });

    it('returns "electron" when process.versions.electron is set', async () => {
      setUA(UA.chrome);
      vi.stubGlobal("process", { versions: { electron: "28.0.0" } });
      const { getRuntime } = await import("./runtime.ts");
      expect(getRuntime().shell).toBe("electron");
    });
  });
});
