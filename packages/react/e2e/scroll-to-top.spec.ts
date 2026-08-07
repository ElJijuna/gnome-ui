import { expect, type Page, test } from '@playwright/test';

// useScrollToTopVisibility tracks real `window.scrollY` and calls the real
// `window.scrollTo()`. The unit tests fake both — `Object.defineProperty`
// stubs `scrollY` and `vi.spyOn` no-ops `scrollTo` (jsdom's own `scrollTo`
// is a documented no-op, it never touches `scrollY`) — so neither the
// threshold-crossing logic nor the actual scroll-back action ever runs
// against a real, scrollable page. These do.

async function scrollWindowBy(page: Page, deltaY: number) {
  // Real navigation timing means the story's effects (which attach the
  // `scroll` listener) may not be mounted the instant `goto()` resolves —
  // wait for its content to actually paint before scrolling.
  await expect(page.getByText('Scroll the page down to reveal the button.')).toBeVisible();
  await page.evaluate((dy) => window.scrollBy(0, dy), deltaY);
}

test('appears after scrolling the real window past the threshold and hides scrolling back up', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-scrolltotop--window-scroll');

  const button = page.getByRole('button', { name: 'Scroll to top' });
  await expect(button).toBeHidden();

  await scrollWindowBy(page, 400);
  await expect(button).toBeVisible();

  await scrollWindowBy(page, -400);
  await expect(button).toBeHidden();
});

test('clicking scrolls the real window back to the top', async ({ page }) => {
  await page.goto('/iframe.html?id=components-scrolltotop--window-scroll');

  await scrollWindowBy(page, 500);
  const button = page.getByRole('button', { name: 'Scroll to top' });
  await expect(button).toBeVisible();

  await button.click();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
