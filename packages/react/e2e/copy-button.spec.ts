import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: baseURL,
  });
});

test('writes the real value to the OS clipboard and confirms visually', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copybutton--default');

  const button = page.getByRole('button', { name: 'Copy' });
  await button.click();

  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('CVE-2024-3094');
});

test('reverts to the copy label after the reset delay', async ({ page }) => {
  await page.goto('/iframe.html?id=components-copybutton--default');

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible({ timeout: 3000 });
});
