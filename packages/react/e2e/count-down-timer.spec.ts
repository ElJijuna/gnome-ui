import { expect, test } from '@playwright/test';

// CountDownTimer.test.tsx only renders once and checks the initial static
// text — it never waits for the real `setInterval` tick to actually update
// the DOM over real time. This does.

test('the displayed time really ticks down every second in real time', async ({ page }) => {
  await page.goto('/iframe.html?id=components-countdowntimer--default');

  const value = page.locator('[class*="value"]').first();
  const first = await value.textContent();

  await expect.poll(() => value.textContent(), { timeout: 4000 }).not.toBe(first);
});
