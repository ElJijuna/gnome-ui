import { afterEach, vi } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.removeProperty('overflow');
  vi.useRealTimers();
});
