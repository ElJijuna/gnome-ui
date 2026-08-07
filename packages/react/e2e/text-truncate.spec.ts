import { expect, test } from '@playwright/test';

// TextTruncate measures real `scrollWidth`/`clientWidth` to decide whether
// to wrap in a Tooltip. TextTruncate.test.tsx fakes both via
// `Object.defineProperty` — jsdom always returns 0 for both, so the actual
// overflow *measurement* (not just the branching logic around it) has never
// run against real text layout.

test('wraps in a tooltip revealing the full text when it is actually clipped', async ({ page }) => {
  await page.goto('/iframe.html?id=components-texttruncate--single-line');

  // The same text also lives in the (initially hidden) tooltip node itself,
  // so scope to the truncated trigger span specifically.
  const text = page.locator('span').filter({ hasText: 'A very long file name' });
  await text.hover();

  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('does not show a tooltip when the text fits without truncation', async ({ page }) => {
  await page.goto('/iframe.html?id=components-texttruncate--fits-without-truncation');

  await page.getByText('Short name.txt').hover();
  // No fixed "no tooltip appeared" event to await — wait past the default
  // 500ms hover delay, then assert it never showed up.
  await page.waitForTimeout(700);

  await expect(page.getByRole('tooltip')).toHaveCount(0);
});
