import { expect, test } from '@playwright/test';

// BreakpointBin watches its own size with a real `ResizeObserver`.
// BreakpointBin.test.tsx replaces the global with a hand-rolled
// `ResizeObserverMock` (jsdom has no `ResizeObserver` at all) — these resize
// a real element and let a real `ResizeObserver` report the change, which
// the mock can never validate.

test('sets data-breakpoint to compact when a real resize shrinks the container', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=adaptive-breakpointbin--active-breakpoint');

  const container = page.locator('div[style*="resize: horizontal"]');
  await container.evaluate((el: HTMLElement) => {
    el.style.width = '250px';
  });

  await expect(container).toHaveAttribute('data-breakpoint', 'compact');
});

test('re-evaluates the breakpoint again on a subsequent real resize', async ({ page }) => {
  await page.goto('/iframe.html?id=adaptive-breakpointbin--active-breakpoint');

  const container = page.locator('div[style*="resize: horizontal"]');
  await container.evaluate((el: HTMLElement) => {
    el.style.width = '250px';
  });
  await expect(container).toHaveAttribute('data-breakpoint', 'compact');

  await container.evaluate((el: HTMLElement) => {
    el.style.width = '600px';
  });
  await expect(container).toHaveAttribute('data-breakpoint', 'regular');
});
