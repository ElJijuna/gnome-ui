import { expect, test } from '@playwright/test';

// TerminalView calls a real `scrollIntoView()` on mount to land on the last
// line. TerminalView.test.tsx only stubs `scrollIntoView` to silence jsdom's
// "not implemented" error — it never checks the resulting real scroll
// position, which requires actual overflow/layout math jsdom doesn't do.

test('starts already scrolled to the latest line when many lines are present', async ({ page }) => {
  await page.goto('/iframe.html?id=components-terminalview--with-long-output');

  const terminal = page.locator('[class*="terminal"]').first();

  await expect
    .poll(async () => {
      const { scrollTop, scrollHeight, clientHeight } = await terminal.evaluate((el) => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));

      return scrollHeight - clientHeight - scrollTop;
    })
    // The container has 12px of bottom padding, which stays below the
    // scroll target regardless of position — leave headroom for that
    // rather than asserting a pixel-perfect flush scroll.
    .toBeLessThan(15);
});

test('stays scrolled to the top when autoScroll is false', async ({ page }) => {
  await page.goto('/iframe.html?id=components-terminalview--auto-scroll-disabled');

  const terminal = page.locator('[class*="terminal"]').first();
  const scrollTop = await terminal.evaluate((el) => el.scrollTop);

  expect(scrollTop).toBe(0);
});
