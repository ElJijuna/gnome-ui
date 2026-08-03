import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('copy button writes the value to the clipboard and shows a confirmation', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-copy-button--interactive');

  const control = page.getByRole('button', { name: 'Copy' });
  await control.click();

  await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Copied!');
  await expect(page.getByText('Copied "CVE-2024-3094" to the clipboard.')).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('CVE-2024-3094');

  await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible({ timeout: 5000 });
});

test('disabled copy button does not activate', async ({ page }) => {
  await page.goto('/iframe.html?id=web-components-copy-button--disabled');

  const control = page.getByRole('button', { name: 'Copy' });
  await expect(control).toBeDisabled();
});
