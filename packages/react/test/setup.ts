/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom/vitest';

// jsdom implements no ResizeObserver, and components that measure themselves
// (via `useElementSize` or their own observer) throw on mount without one. The
// stub never fires: jsdom has no layout to report, so every measurement stays 0
// and components fall back to their unmeasured behaviour.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
