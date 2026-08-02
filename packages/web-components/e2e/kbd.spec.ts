import { expect, test } from '@playwright/test';

test('normalises a common key name to its symbol and exposes the name via aria-label', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-kbd--default');

  const kbd = page.locator('gnome-kbd kbd');
  await expect(kbd).toHaveText('↵');
  await expect(kbd).toHaveAttribute('aria-label', 'Enter');
});

test('raw shows the raw key name with no aria-label', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-kbd--raw-text');

  const kbd = page.locator('gnome-kbd kbd');
  await expect(kbd).toHaveText('Enter');
  await expect(kbd).not.toHaveAttribute('aria-label');
});

test('common keys story shows symbols for known keys and raw text for unknown ones', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=web-components-kbd--common-keys');

  const kbds = page.locator('gnome-kbd kbd');
  await expect(kbds).toHaveCount(9);
  await expect(kbds.nth(0)).toHaveText('↵');
  await expect(kbds.nth(8)).toHaveText('F5');
});
