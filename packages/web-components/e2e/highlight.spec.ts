import { expect, test } from '@playwright/test';

test('highlight wraps each query term in a mark element', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-highlight--interactive');

  const highlight = page.locator('gnome-highlight');
  await expect(highlight).toHaveText('The quick brown fox jumps over the lazy dog.');

  const marks = highlight.locator('mark');
  await expect(marks).toHaveCount(2);
  await expect(marks.nth(0)).toHaveText('quick');
  await expect(marks.nth(1)).toHaveText('fox');
});

test('highlight with no query renders plain text and no marks', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-highlight--no-match');

  const highlight = page.locator('gnome-highlight');
  await expect(highlight.locator('mark')).toHaveCount(0);
});
